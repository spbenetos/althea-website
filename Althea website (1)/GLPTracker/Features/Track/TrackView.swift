import SwiftUI
import SwiftData

struct TrackView: View {
    @Query private var weights:      [WeightEntry]
    @Query private var effects:      [SideEffectEntry]
    @Query private var food:         [FoodEntry]
    @Query private var measurements: [BodyMeasurement]
    @Query private var profiles:     [UserProfile]

    init() {
        var wd = FetchDescriptor<WeightEntry>(sortBy: [SortDescriptor(\.date, order: .reverse)])
        wd.fetchLimit = 90
        _weights = Query(wd)

        var ed = FetchDescriptor<SideEffectEntry>(sortBy: [SortDescriptor(\.date, order: .reverse)])
        ed.fetchLimit = 90
        _effects = Query(ed)

        var fd = FetchDescriptor<FoodEntry>(sortBy: [SortDescriptor(\.date, order: .reverse)])
        fd.fetchLimit = 90
        _food = Query(fd)

        var md = FetchDescriptor<BodyMeasurement>(sortBy: [SortDescriptor(\.date, order: .reverse)])
        md.fetchLimit = 30
        _measurements = Query(md)

        _profiles = Query(FetchDescriptor<UserProfile>())
    }

    @Environment(\.modelContext) private var modelContext
    @Environment(HealthKitService.self)  private var healthKit
    @Environment(\.scenePhase)           private var scenePhase

    private struct HKSnapshot { var calories: Int = 0; var protein: Double = 0 }

    @State private var activeSheet:             ActiveSheet?
    @State private var selectedCard:            Int          = 0
    @State private var hydrationGlasses:        Int          = 0
    @State private var pendingHydrationGlasses: Int          = 0
    @State private var pendingWeight:           Double       = 80
    @State private var hkData                               = HKSnapshot()
    @State private var pendingSymptoms:         Set<SideEffectType> = []
    @State private var pendingSymptomSeverity:  Int          = 2
    @State private var feelingFineToday:        Bool         = false
    @State private var selectedMealType:        MealType     = .snack
    @State private var foodSheetProduct:        OFFProduct?  = nil
    @State private var showCardFoodSearch:      Bool         = false
    @State private var showCardFoodScanner:     Bool         = false
    @State private var todayStart:              Date         = Calendar.current.startOfDay(for: .now)
    @State private var chipHaptic                           = UIImpactFeedbackGenerator(style: .light)
    @Environment(\.openProfile) private var openProfile

    private var profile:    UserProfile? { profiles.first }
    private var isImperial: Bool         { profile?.unitSystem == "imperial" }

    private var unit: String { isImperial ? "lbs" : "kg" }

    enum ActiveSheet: Identifiable {
        case weight, symptom, food, measurements, goalSetup
        var id: Self { self }
    }

    // ── Logged-today flags ─────────────────────────────────────────────────────

    private var isWeightLoggedToday:      Bool { weights.contains      { $0.date >= todayStart } }
    private var isSymptomLoggedToday:     Bool { effects.contains      { $0.date >= todayStart } || feelingFineToday }
    private var isFoodLoggedToday:        Bool { food.contains         { $0.date >= todayStart } }
    private var isWaterLoggedToday:       Bool { hydrationGlasses > 0 }
    private var isMeasurementLoggedToday: Bool { measurements.contains { $0.date >= todayStart } }

    private var dailyLoggedCount: Int {
        [isWeightLoggedToday, isSymptomLoggedToday, isFoodLoggedToday, isWaterLoggedToday].filter { $0 }.count
    }

    private var hasAnyLoggedToday: Bool {
        dailyLoggedCount > 0 || isMeasurementLoggedToday
    }

    private var hasDailyStats: Bool {
        isFoodLoggedToday || isWaterLoggedToday || isSymptomLoggedToday
            || hkData.calories > 0 || hkData.protein > 0
    }

    private var firstUnloggedCardIndex: Int? {
        if !isWeightLoggedToday  { return 0 }
        if !isFoodLoggedToday    { return 1 }
        if !isWaterLoggedToday   { return 2 }
        if !isSymptomLoggedToday { return 3 }
        return nil
    }

    // ── Body ───────────────────────────────────────────────────────────────────

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: AppSpacing.sectionSpacing) {
                    dailySwipeCardsSection
                    weeklySection
                    if hasAnyLoggedToday {
                        if hasDailyStats { todayAtAGlanceSection }
                        loggedTodaySection
                    } else {
                        emptyPromptView
                    }
                }
                .padding(.horizontal, AppSpacing.screenPadding)
                .padding(.bottom, AppSpacing.xxxl)
            }
            .background(AppColors.background)
            .navigationTitle("Track")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button { openProfile() } label: {
                        Image("althea-profile-icon")
                            .renderingMode(.original)
                            .resizable()
                            .scaledToFit()
                            .frame(width: 28, height: 28)
                    }
                }
            }
            .sheet(item: $activeSheet) { sheet in
                switch sheet {
                case .weight:       LogWeightView(weights: weights, profile: profiles.first)
                case .symptom:      LogSideEffectView()
                case .food:         LogFoodView(initialMealType: selectedMealType, product: foodSheetProduct)
                case .measurements: LogBodyMeasurementView()
                case .goalSetup:    GoalSetupView()
                }
            }
            .sheet(isPresented: $showCardFoodSearch) {
                FoodSearchSheet { product in
                    foodSheetProduct = product
                    activeSheet = .food
                }
            }
            .fullScreenCover(isPresented: $showCardFoodScanner) {
                BarcodeScannerView(
                    onScan: { barcode in
                        showCardFoodScanner = false
                        Task {
                            if let product = await OpenFoodFactsService.searchByBarcode(barcode) {
                                foodSheetProduct = product
                                activeSheet = .food
                            }
                        }
                    },
                    onCancel: { showCardFoodScanner = false }
                )
            }
            .onAppear {
                todayStart = Calendar.current.startOfDay(for: .now)
                var t = Transaction()
                t.disablesAnimations = true
                withTransaction(t) {
                    hydrationGlasses = HydrationStore.glassesToday()
                    pendingHydrationGlasses = hydrationGlasses
                    initPendingWeight()
                    selectedMealType = TrackView.autoMealType()
                    selectedCard = firstUnloggedCardIndex ?? 0
                    checkFeelingFineToday()
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { chipHaptic.prepare() }
            }
            .onChange(of: activeSheet) { _, new in
                if new == nil {
                    hydrationGlasses = HydrationStore.glassesToday()
                    pendingHydrationGlasses = hydrationGlasses
                    initPendingWeight()
                    foodSheetProduct = nil
                    checkFeelingFineToday()
                }
            }
            .task { await fetchHKData() }
            .onChange(of: scenePhase) { _, new in
                if new == .active {
                    todayStart = Calendar.current.startOfDay(for: .now)
                    Task { await fetchHKData() }
                    checkFeelingFineToday()
                }
            }
        }
    }

    // ── Daily swipe cards ──────────────────────────────────────────────────────

    private var dailySwipeCardsSection: some View {
        let cardIcons = ["scalemass.fill", "fork.knife", "drop.fill", "waveform.path.ecg"]
        return VStack(alignment: .leading, spacing: AppSpacing.md) {
            HStack(alignment: .center) {
                Text("Daily Log")
                    .font(AppFonts.title3)
                    .foregroundStyle(AppColors.textPrimary)
                HStack(spacing: 6) {
                    ForEach(0..<4, id: \.self) { i in
                        let color = currentCardColor(i)
                        Button {
                            withAnimation(.spring(response: 0.35)) { selectedCard = i }
                        } label: {
                            Image(systemName: cardIcons[i])
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundStyle(
                                    selectedCard == i ? color : AppColors.textTertiary.opacity(0.35)
                                )
                                .animation(.easeOut(duration: 0.15), value: selectedCard)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.leading, AppSpacing.xs)
                Spacer()
                Text("\(dailyLoggedCount)/4")
                    .font(AppFonts.captionBold)
                    .foregroundStyle(dailyLoggedCount == 4 ? AppColors.primary : AppColors.textTertiary)
                    .padding(.horizontal, AppSpacing.sm)
                    .padding(.vertical, 4)
                    .background(
                        dailyLoggedCount == 4 ? AppColors.primarySubtle : AppColors.surfaceSecondary,
                        in: Capsule()
                    )
                    .animation(.easeOut(duration: 0.2), value: dailyLoggedCount)
            }

            TabView(selection: $selectedCard) {
                ForEach(0..<4, id: \.self) { i in
                    cardForIndex(i).tag(i)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .frame(height: 390)

            HStack(spacing: 8) {
                ForEach(0..<4, id: \.self) { i in
                    Capsule()
                        .fill(i == selectedCard ? currentCardColor(i) : AppColors.textTertiary.opacity(0.25))
                        .frame(width: i == selectedCard ? 20 : 6, height: 6)
                        .animation(.spring(response: 0.35), value: selectedCard)
                        .onTapGesture { withAnimation(.spring(response: 0.35)) { selectedCard = i } }
                }
            }
            .frame(maxWidth: .infinity)
        }
    }

    private func currentCardColor(_ index: Int) -> Color {
        switch index {
        case 0: return AppColors.primary
        case 1: return AppColors.success
        case 2: return AppColors.info
        case 3: return AppColors.accent
        default: return AppColors.primary
        }
    }

    @ViewBuilder
    private func cardForIndex(_ i: Int) -> some View {
        switch i {
        case 0: weightCard
        case 1: foodCard
        case 2: waterCard
        default: symptomsCard
        }
    }

    // ── Shared card helpers ────────────────────────────────────────────────────

    private func cardHeader(
        icon: String, title: String, color: Color, isLogged: Bool,
        goalConfigured: Bool? = nil, goalAction: (() -> Void)? = nil
    ) -> some View {
        HStack {
            HStack(spacing: AppSpacing.sm) {
                Image(systemName: icon)
                    .font(.system(size: 26, weight: .semibold))
                    .foregroundStyle(color)
                Text(title)
                    .font(AppFonts.headline)
                    .foregroundStyle(AppColors.textPrimary)
            }
            Spacer()
            HStack(spacing: AppSpacing.sm) {
                if isLogged {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 20))
                        .foregroundStyle(color)
                        .transition(.scale.combined(with: .opacity))
                }
                if let goalConfigured, let goalAction {
                    Button(action: goalAction) {
                        Text(goalConfigured ? "Update Goal" : "Set Goal")
                            .font(AppFonts.captionBold)
                            .foregroundStyle(goalConfigured ? AppColors.textTertiary : AppColors.primary)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(AppColors.primarySubtle, in: Capsule())
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .animation(.spring(response: 0.3), value: isLogged)
    }

    private func actionButton(label: String, color: Color, isLogged: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Image(systemName: isLogged ? "pencil" : "plus")
                    .font(.system(size: 12, weight: .semibold))
                Text(label)
                    .font(AppFonts.headline)
            }
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 44)
            .background(
                isLogged ? color.opacity(0.65) : color,
                in: RoundedRectangle(cornerRadius: AppSpacing.radiusMd, style: .continuous)
            )
        }
        .buttonStyle(.plain)
    }

    // ── Weight card ────────────────────────────────────────────────────────────

    private var weightCard: some View {
        VStack(alignment: .leading, spacing: 0) {
            cardHeader(icon: "scalemass.fill", title: "Weight",
                       color: AppColors.primary, isLogged: isWeightLoggedToday)

            Spacer(minLength: AppSpacing.sm)

            VStack(spacing: 6) {
                Text(String(format: "%.1f", pendingWeight))
                    .font(AppFonts.statHero)
                    .foregroundStyle(AppColors.primary)
                    .contentTransition(.numericText())
                    .frame(maxWidth: .infinity, alignment: .center)

                HStack(spacing: AppSpacing.sm) {
                    Text(unit)
                        .font(AppFonts.title2)
                        .foregroundStyle(AppColors.textSecondary)

                    if let lastEntry = weights.first {
                        let currentKg   = isImperial ? pendingWeight / 2.20462 : pendingWeight
                        let diff        = currentKg - lastEntry.weightKg
                        let displayDiff = isImperial ? diff * 2.20462 : diff
                        let diffColor: Color = displayDiff < -0.05 ? AppColors.success
                                             : displayDiff > 0.05  ? AppColors.error
                                             : AppColors.textTertiary
                        HStack(spacing: 4) {
                            Image(systemName: displayDiff < -0.05 ? "arrow.down"
                                           : displayDiff > 0.05  ? "arrow.up" : "minus")
                                .font(.system(size: 10, weight: .bold))
                            Text(abs(displayDiff) < 0.05
                                 ? "No change"
                                 : "\(String(format: "%.1f", abs(displayDiff))) \(unit)")
                                .font(AppFonts.captionBold)
                        }
                        .foregroundStyle(diffColor)
                        .padding(.horizontal, AppSpacing.sm)
                        .padding(.vertical, 4)
                        .background(diffColor.opacity(0.12), in: Capsule())
                    }
                }
                .frame(maxWidth: .infinity, alignment: .center)
            }

            Spacer(minLength: AppSpacing.sm)

            HStack(spacing: AppSpacing.sm) {
                weightStepButton(label: "−1",   delta: -1.0)
                weightStepButton(label: "−0.1", delta: -0.1)
                Spacer()
                weightStepButton(label: "+0.1", delta:  0.1)
                weightStepButton(label: "+1",   delta:  1.0)
            }

            Spacer(minLength: AppSpacing.xs)

            let sliderMin: Double = isImperial ? 88 : 40
            let sliderMax: Double = isImperial ? 440 : 200
            HStack(spacing: AppSpacing.md) {
                Text(String(format: "%.0f", sliderMin))
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textTertiary)
                Slider(value: $pendingWeight, in: sliderMin...sliderMax, step: 0.1)
                    .tint(AppColors.primary)
                Text(String(format: "%.0f", sliderMax))
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textTertiary)
            }
            .padding(AppSpacing.cardPadding)
            .background(AppColors.surfaceSecondary,
                        in: RoundedRectangle(cornerRadius: AppSpacing.radiusMd, style: .continuous))

            Spacer(minLength: AppSpacing.md)

            actionButton(
                label: isWeightLoggedToday
                    ? "Update to \(String(format: "%.1f", pendingWeight)) \(unit)"
                    : "Log \(String(format: "%.1f", pendingWeight)) \(unit)",
                color: AppColors.primary,
                isLogged: isWeightLoggedToday,
                action: quickSaveWeight
            )
        }
        .trackingCardStyle()
    }

    private func weightStepButton(label: String, delta: Double) -> some View {
        Button {
            let minVal: Double = isImperial ? 88 : 40
            let maxVal: Double = isImperial ? 440 : 200
            pendingWeight = min(maxVal, max(minVal, pendingWeight + delta))
            UIImpactFeedbackGenerator(style: .light).impactOccurred()
        } label: {
            Text(label)
                .font(AppFonts.captionBold)
                .foregroundStyle(AppColors.primary)
                .frame(width: 60, height: 44)
                .background(AppColors.primarySubtle,
                            in: RoundedRectangle(cornerRadius: AppSpacing.radiusSm, style: .continuous))
        }
        .buttonStyle(.plain)
    }

    private func waterStepButton(label: String, delta: Int) -> some View {
        Button {
            pendingHydrationGlasses = max(0, min(16, pendingHydrationGlasses + delta))
            UIImpactFeedbackGenerator(style: .light).impactOccurred()
        } label: {
            Text(label)
                .font(AppFonts.captionBold)
                .foregroundStyle(delta < 0 && pendingHydrationGlasses == 0 ? AppColors.textTertiary : AppColors.info)
                .frame(width: 60, height: 44)
                .background(AppColors.info.opacity(delta < 0 && pendingHydrationGlasses == 0 ? 0.05 : 0.12),
                            in: RoundedRectangle(cornerRadius: AppSpacing.radiusSm, style: .continuous))
        }
        .buttonStyle(.plain)
        .disabled(delta < 0 && pendingHydrationGlasses == 0)
    }

    // ── Food card ──────────────────────────────────────────────────────────────

    private var foodCard: some View {
        VStack(alignment: .leading, spacing: 0) {
            cardHeader(icon: "fork.knife", title: "Food",
                       color: AppColors.success, isLogged: isFoodLoggedToday,
                       goalConfigured: profile?.goalsConfigured == true,
                       goalAction: { activeSheet = .goalSetup })

            Spacer(minLength: AppSpacing.sm)

            // Today's stats — always visible
            let todayFood = todayFoodEntries
            let kcal    = todayFood.reduce(0)   { $0 + $1.calories }
            let protein = todayFood.reduce(0.0) { $0 + $1.proteinG }
            let carbs   = todayFood.reduce(0.0) { $0 + $1.carbsG }
            let fat     = todayFood.reduce(0.0) { $0 + $1.fatG }

            VStack(alignment: .leading, spacing: AppSpacing.xs) {
                HStack(alignment: .lastTextBaseline, spacing: 5) {
                    Text(todayFood.isEmpty ? "—" : (kcal > 0 ? "\(kcal)" : "\(todayFood.count)"))
                        .font(AppFonts.stat)
                        .foregroundStyle(todayFood.isEmpty ? AppColors.textTertiary : AppColors.textPrimary)
                        .contentTransition(.numericText())
                    Text(todayFood.isEmpty ? "kcal" : (kcal > 0 ? "kcal" : "item\(todayFood.count == 1 ? "" : "s")"))
                        .font(AppFonts.subheadline)
                        .foregroundStyle(AppColors.textSecondary)
                    Spacer()
                    if !todayFood.isEmpty {
                        Text("\(todayFood.count) item\(todayFood.count == 1 ? "" : "s")")
                            .font(AppFonts.caption)
                            .foregroundStyle(AppColors.textTertiary)
                    }
                }
                HStack(spacing: AppSpacing.sm) {
                    macroPill("P", value: protein, color: AppColors.primary)
                    macroPill("C", value: carbs,   color: AppColors.warning)
                    macroPill("F", value: fat,     color: AppColors.accent)
                }
                if let goal = profile?.dailyCalorieGoal, goal > 0 {
                    let ratio = min(Double(kcal) / Double(goal), 1.0)
                    VStack(alignment: .leading, spacing: 3) {
                        Capsule()
                            .fill(AppColors.success.opacity(0.15))
                            .overlay(alignment: .leading) {
                                Capsule()
                                    .fill(kcal > goal ? AppColors.error : AppColors.success)
                                    .scaleEffect(x: ratio, anchor: .leading)
                            }
                            .frame(height: 5)
                        Text("\(kcal) / \(goal) kcal")
                            .font(AppFonts.micro)
                            .foregroundStyle(AppColors.textTertiary)
                    }
                }
            }

            Spacer(minLength: AppSpacing.sm)

            // Quick-add shortcuts: barcode scan and text search
            HStack(spacing: AppSpacing.sm) {
                Button { showCardFoodScanner = true } label: {
                    Label("Scan Barcode", systemImage: "barcode.viewfinder")
                        .font(AppFonts.captionBold)
                        .foregroundStyle(AppColors.primary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, AppSpacing.sm)
                        .background(AppColors.primarySubtle,
                                    in: RoundedRectangle(cornerRadius: AppSpacing.radiusSm, style: .continuous))
                }
                .buttonStyle(.plain)
                Button { showCardFoodSearch = true } label: {
                    Label("Search Food", systemImage: "magnifyingglass")
                        .font(AppFonts.captionBold)
                        .foregroundStyle(AppColors.primary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, AppSpacing.sm)
                        .background(AppColors.primarySubtle,
                                    in: RoundedRectangle(cornerRadius: AppSpacing.radiusSm, style: .continuous))
                }
                .buttonStyle(.plain)
            }

            Spacer(minLength: AppSpacing.sm)

            // Meal type selector — tap to pick, bottom button opens the sheet
            VStack(alignment: .leading, spacing: AppSpacing.xs) {
                Text("Meal type")
                    .font(AppFonts.captionBold)
                    .foregroundStyle(AppColors.textTertiary)
                HStack(spacing: AppSpacing.xs) {
                    ForEach(MealType.allCases, id: \.self) { type in
                        Button { selectedMealType = type } label: {
                            VStack(spacing: 3) {
                                Image(systemName: type.systemImage)
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundStyle(selectedMealType == type ? .white : type.accentColor)
                                Text(type.rawValue)
                                    .font(AppFonts.micro)
                                    .foregroundStyle(selectedMealType == type ? .white : AppColors.textSecondary)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, AppSpacing.sm)
                            .background(
                                RoundedRectangle(cornerRadius: AppSpacing.radiusSm, style: .continuous)
                                    .fill(selectedMealType == type
                                          ? AnyShapeStyle(type.gradient)
                                          : AnyShapeStyle(AppColors.surfaceSecondary))
                            )
                            .animation(.easeOut(duration: 0.15), value: selectedMealType)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }

            // Recent items — descriptive rows with one-tap re-log
            let recent = recentFoodItems
            if !recent.isEmpty {
                Spacer(minLength: AppSpacing.xs)
                VStack(spacing: 4) {
                    ForEach(recent, id: \.id) { entry in
                        Button { quickReLogFood(entry) } label: {
                            HStack(spacing: AppSpacing.sm) {
                                Image(systemName: "arrow.counterclockwise.circle.fill")
                                    .font(.system(size: 18))
                                    .foregroundStyle(AppColors.success.opacity(0.7))
                                VStack(alignment: .leading, spacing: 1) {
                                    Text(entry.name)
                                        .font(AppFonts.captionBold)
                                        .foregroundStyle(AppColors.textPrimary)
                                        .lineLimit(1)
                                    if entry.calories > 0 {
                                        Text("\(entry.calories) kcal · \(entry.mealTypeEnum?.rawValue ?? entry.mealType)")
                                            .font(AppFonts.micro)
                                            .foregroundStyle(AppColors.textTertiary)
                                    }
                                }
                                Spacer()
                                Text("Re-log")
                                    .font(AppFonts.micro)
                                    .foregroundStyle(AppColors.success)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 3)
                                    .background(AppColors.success.opacity(0.12), in: Capsule())
                            }
                            .padding(.horizontal, AppSpacing.sm)
                            .padding(.vertical, AppSpacing.xs)
                            .background(AppColors.surfaceSecondary,
                                        in: RoundedRectangle(cornerRadius: AppSpacing.radiusSm, style: .continuous))
                        }
                        .buttonStyle(.plain)
                    }
                }
            }

            Spacer(minLength: AppSpacing.sm)

            actionButton(
                label: isFoodLoggedToday ? "Add More Food" : "Log Manually",
                color: AppColors.success,
                isLogged: isFoodLoggedToday,
                action: { activeSheet = .food }
            )
        }
        .trackingCardStyle()
    }

    // ── Water card ─────────────────────────────────────────────────────────────

    private var waterCard: some View {
        let goal         = profile?.dailyWaterGoalGlasses ?? 8
        let current      = pendingHydrationGlasses
        let mlTotal      = current * 250
        let ratio        = min(Double(current) / Double(goal), 1.0)
        let displayCount = min(goal, 8)

        return VStack(alignment: .leading, spacing: 0) {
            cardHeader(icon: "drop.fill", title: "Water",
                       color: AppColors.info, isLogged: isWaterLoggedToday,
                       goalConfigured: profile?.goalsConfigured == true,
                       goalAction: { activeSheet = .goalSetup })

            Spacer(minLength: AppSpacing.sm)

            VStack(alignment: .leading, spacing: AppSpacing.xs) {
                HStack(alignment: .lastTextBaseline, spacing: 5) {
                    Text(current > 0 ? "\(mlTotal)" : "—")
                        .font(AppFonts.stat)
                        .foregroundStyle(current > 0 ? AppColors.textPrimary : AppColors.textTertiary)
                        .contentTransition(.numericText())
                    Text("ml")
                        .font(AppFonts.subheadline)
                        .foregroundStyle(AppColors.textSecondary)
                    Spacer()
                    if current > 0 {
                        Text("\(current) glass\(current == 1 ? "" : "es")")
                            .font(AppFonts.caption)
                            .foregroundStyle(AppColors.textTertiary)
                    }
                }
                VStack(alignment: .leading, spacing: 3) {
                    Capsule()
                        .fill(AppColors.info.opacity(0.15))
                        .overlay(alignment: .leading) {
                            Capsule()
                                .fill(current >= goal ? AppColors.success : AppColors.info)
                                .scaleEffect(x: ratio, anchor: .leading)
                                .animation(.spring(response: 0.4), value: ratio)
                        }
                        .frame(height: 5)
                    Text("\(current) / \(goal) glasses")
                        .font(AppFonts.micro)
                        .foregroundStyle(AppColors.textTertiary)
                }
            }

            Spacer(minLength: AppSpacing.md)

            LazyVGrid(
                columns: Array(repeating: .init(.flexible()), count: displayCount),
                spacing: AppSpacing.xs
            ) {
                ForEach(0..<displayCount, id: \.self) { i in
                    Image(systemName: i < current ? "drop.fill" : "drop")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(i < current ? AppColors.info : AppColors.textTertiary.opacity(0.3))
                        .animation(.spring(response: 0.3).delay(Double(i) * 0.02), value: current)
                }
            }

            Spacer(minLength: AppSpacing.sm)

            Text("GLP-1 medications can cause dehydration. Stay hydrated and follow your doctor's recommended daily intake.")
                .font(AppFonts.micro)
                .foregroundStyle(AppColors.textTertiary)

            Spacer(minLength: AppSpacing.md)

            HStack(spacing: AppSpacing.sm) {
                waterStepButton(label: "−2", delta: -2)
                waterStepButton(label: "−1", delta: -1)
                Spacer()
                waterStepButton(label: "+1", delta: 1)
                waterStepButton(label: "+2", delta: 2)
            }

            Spacer(minLength: AppSpacing.md)

            actionButton(
                label: "Log Water Intake",
                color: AppColors.info,
                isLogged: isWaterLoggedToday,
                action: { setGlasses(pendingHydrationGlasses) }
            )
        }
        .trackingCardStyle()
    }

    // ── Symptoms card ──────────────────────────────────────────────────────────

    private static let quickSymptoms: [SideEffectType] = [
        .nausea, .vomiting, .fatigue,
        .diarrhea, .constipation, .headache,
        .bloating, .heartburn, .lossOfAppetite
    ]

    private var symptomsCard: some View {
        let todayEffects = todayEffectEntries
        return VStack(alignment: .leading, spacing: 0) {
            cardHeader(icon: "waveform.path.ecg", title: "Symptoms",
                       color: AppColors.accent, isLogged: isSymptomLoggedToday)

            Spacer(minLength: AppSpacing.sm)

            // Today's logged summary (actual symptoms)
            if let latest = todayEffects.first {
                HStack(spacing: AppSpacing.sm) {
                    Text(latest.effectTypeEnums.map(\.rawValue).joined(separator: ", "))
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.textSecondary)
                        .lineLimit(1)
                    Spacer()
                    Text(latest.severityLabel)
                        .font(AppFonts.captionBold)
                        .foregroundStyle(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(latest.severityColor, in: Capsule())
                }
                .padding(.bottom, AppSpacing.xs)
            }

            // Chip grid
            VStack(alignment: .leading, spacing: AppSpacing.xs) {
                Text("Quick log")
                    .font(AppFonts.captionBold)
                    .foregroundStyle(AppColors.textTertiary)
                LazyVGrid(
                    columns: [.init(.flexible()), .init(.flexible()), .init(.flexible())],
                    spacing: AppSpacing.xs
                ) {
                    ForEach(TrackView.quickSymptoms, id: \.self) { quickSymptomChip($0) }
                }
            }

            // History context — below chips, hidden once chips are selected
            if pendingSymptoms.isEmpty, !isSymptomLoggedToday, let ctx = symptomHistoryContext {
                Text(ctx)
                    .font(AppFonts.micro)
                    .foregroundStyle(AppColors.textTertiary)
                    .lineLimit(1)
                    .padding(.top, AppSpacing.xs)
                    .transition(.opacity.combined(with: .move(edge: .bottom)))
            }

            // Severity — appears when chips are selected
            if !pendingSymptoms.isEmpty {
                Spacer(minLength: AppSpacing.sm)
                HStack {
                    Text("Severity")
                        .font(AppFonts.captionBold)
                        .foregroundStyle(AppColors.textTertiary)
                    Spacer()
                    severityButton("Mild",     value: 2)
                    severityButton("Moderate", value: 3)
                    severityButton("Severe",   value: 4)
                }
                .transition(.opacity.combined(with: .move(edge: .top)))
            }

            Spacer(minLength: AppSpacing.sm)

            // Action area
            if !pendingSymptoms.isEmpty {
                actionButton(
                    label: "Log \(pendingSymptoms.count) Symptom\(pendingSymptoms.count == 1 ? "" : "s")",
                    color: SideEffectEntry.color(for: pendingSymptomSeverity),
                    isLogged: false,
                    action: quickSaveSymptoms
                )
            } else if feelingFineToday && todayEffects.isEmpty {
                HStack(spacing: AppSpacing.sm) {
                    Image(systemName: "face.smiling")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(AppColors.success)
                    Text("Feeling fine today")
                        .font(AppFonts.captionBold)
                        .foregroundStyle(AppColors.success)
                    Spacer()
                    Button {
                        UserDefaults.standard.removeObject(forKey: "symptomFreeDate")
                        withAnimation { feelingFineToday = false }
                    } label: {
                        Text("Undo")
                            .font(AppFonts.micro)
                            .foregroundStyle(AppColors.textTertiary)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(AppColors.surfaceSecondary, in: Capsule())
                    }
                    .buttonStyle(.plain)
                }
                .padding(AppSpacing.md)
                .background(AppColors.success.opacity(0.08),
                            in: RoundedRectangle(cornerRadius: AppSpacing.radiusMd, style: .continuous))
            } else if todayEffects.isEmpty {
                VStack(spacing: 6) {
                    actionButton(label: "Log with Details", color: AppColors.accent,
                                 isLogged: false, action: { activeSheet = .symptom })
                    Button { markFeelingFine() } label: {
                        HStack(spacing: 6) {
                            Image(systemName: "face.smiling")
                                .font(.system(size: 12, weight: .semibold))
                            Text("Feeling fine today")
                                .font(AppFonts.captionBold)
                        }
                        .foregroundStyle(AppColors.success)
                        .frame(maxWidth: .infinity)
                        .frame(height: 36)
                    }
                    .buttonStyle(.plain)
                }
            } else {
                actionButton(label: "Add More Symptoms", color: AppColors.accent,
                             isLogged: true, action: { activeSheet = .symptom })
            }
        }
        .trackingCardStyle()
        .animation(.spring(response: 0.3), value: pendingSymptoms.isEmpty)
        .animation(.spring(response: 0.3), value: feelingFineToday)
    }

    private func quickSymptomChip(_ symptom: SideEffectType) -> some View {
        let isSelected = pendingSymptoms.contains(symptom)
        let chipColor  = SideEffectEntry.color(for: pendingSymptomSeverity)
        return Button {
            if isSelected { pendingSymptoms.remove(symptom) } else { pendingSymptoms.insert(symptom) }
            chipHaptic.impactOccurred()
        } label: {
            VStack(spacing: 3) {
                Image(systemName: symptom.systemImage)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(isSelected ? .white : AppColors.accent)
                Text(symptom.chipName)
                    .font(AppFonts.micro)
                    .foregroundStyle(isSelected ? .white : AppColors.textSecondary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.75)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, AppSpacing.sm)
            .background(
                isSelected ? chipColor : AppColors.surfaceSecondary,
                in: RoundedRectangle(cornerRadius: AppSpacing.radiusSm, style: .continuous)
            )
            .animation(.easeOut(duration: 0.15), value: isSelected)
            .animation(.easeOut(duration: 0.15), value: pendingSymptomSeverity)
        }
        .buttonStyle(.plain)
    }

    private func severityButton(_ label: String, value: Int) -> some View {
        let isSelected = pendingSymptomSeverity == value
        let color      = SideEffectEntry.color(for: value)
        return Button { pendingSymptomSeverity = value } label: {
            Text(label)
                .font(AppFonts.captionBold)
                .foregroundStyle(isSelected ? .white : color)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(isSelected ? color : color.opacity(0.12), in: Capsule())
                .animation(.spring(response: 0.2), value: isSelected)
        }
        .buttonStyle(.plain)
    }

    private var symptomHistoryContext: String? {
        guard let last = effects.first(where: { $0.date < todayStart }) else { return nil }
        let names = last.effectTypeEnums.prefix(2).map(\.rawValue).joined(separator: ", ")
        guard !names.isEmpty else { return nil }
        let time = last.date.formatted(date: .omitted, time: .shortened)
        let dateLabel: String
        if Calendar.current.isDateInYesterday(last.date) {
            dateLabel = "Yesterday at \(time)"
        } else {
            let d = last.date.formatted(.dateTime.month(.abbreviated).day())
            dateLabel = "\(d) at \(time)"
        }
        return "\(names) (+\(last.severity)) · \(dateLabel)"
    }

    private func checkFeelingFineToday() {
        feelingFineToday = UserDefaults.standard.double(forKey: "symptomFreeDate") == todayStart.timeIntervalSince1970
    }

    private func markFeelingFine() {
        let today = todayStart.timeIntervalSince1970
        UserDefaults.standard.set(today, forKey: "symptomFreeDate")
        withAnimation { feelingFineToday = true }
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
    }

    // ── Macro pill ─────────────────────────────────────────────────────────────

    private func macroPill(_ label: String, value: Double, color: Color) -> some View {
        HStack(spacing: 3) {
            Text(label).font(AppFonts.micro).foregroundStyle(color)
            Text(String(format: "%.0fg", value)).font(AppFonts.micro).foregroundStyle(AppColors.textSecondary)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(color.opacity(0.1), in: Capsule())
    }

    // ── Quick action helpers ───────────────────────────────────────────────────

    private func initPendingWeight() {
        let minVal: Double = isImperial ? 88 : 40
        if let today = weights.first(where: { $0.date >= todayStart }) {
            pendingWeight = isImperial ? today.weightLbs : today.weightKg
        } else if let last = weights.first {
            pendingWeight = isImperial ? last.weightLbs : last.weightKg
        } else if let hkKg = healthKit.latestWeightKg {
            pendingWeight = isImperial ? hkKg * 2.20462 : hkKg
        } else if let start = profile?.startWeightKg {
            pendingWeight = isImperial ? start * 2.20462 : start
        } else {
            pendingWeight = minVal
        }
    }

    private func quickSaveWeight() {
        for existing in weights.filter({ $0.date >= todayStart }) {
            modelContext.delete(existing)
        }
        let kg = isImperial ? pendingWeight / 2.20462 : pendingWeight
        let entry = WeightEntry(date: .now, weightKg: kg)
        modelContext.insert(entry)
        if let profile { GamificationService.awardWeightLogged(profile: profile) }
        if healthKit.isGranted {
            Task { await healthKit.writeWeight(kg: kg, date: .now) }
        }
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
    }

    private func setGlasses(_ count: Int) {
        let clamped = max(0, min(16, count))
        hydrationGlasses = clamped
        pendingHydrationGlasses = clamped
        HydrationStore.setGlassesToday(clamped)
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
        if clamped >= 8, let p = profile {
            let wasEarned = UserDefaults.standard.bool(forKey: "achievement_hydrated")
            UserDefaults.standard.set(true, forKey: "achievement_hydrated")
            if !wasEarned {
                GamificationService.awardAchievements(newIDs: ["hydrated"], profile: p)
                GamificationService.playUnlock()
            }
        }
    }

    private func quickSaveSymptoms() {
        guard !pendingSymptoms.isEmpty else { return }
        let isFirst = (try? modelContext.fetchCount(FetchDescriptor<SideEffectEntry>())) == 0
        let entry = SideEffectEntry(date: .now, effects: Array(pendingSymptoms), severity: pendingSymptomSeverity)
        modelContext.insert(entry)
        if let p = profile {
            if isFirst {
                GamificationService.awardAchievements(newIDs: ["first_symptom"], profile: p)
                GamificationService.playUnlock()
            } else {
                GamificationService.awardSymptomLogged(profile: p)
            }
        }
        pendingSymptoms = []
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
    }

    private func quickReLogFood(_ entry: FoodEntry) {
        let isFirst = (try? modelContext.fetchCount(FetchDescriptor<FoodEntry>())) == 0
        let newEntry = FoodEntry(
            date: .now,
            name: entry.name,
            calories: entry.calories,
            proteinG: entry.proteinG,
            carbsG: entry.carbsG,
            fatG: entry.fatG,
            mealType: entry.mealTypeEnum ?? selectedMealType
        )
        modelContext.insert(newEntry)
        if let p = profile {
            if isFirst {
                GamificationService.awardAchievements(newIDs: ["first_food"], profile: p)
                GamificationService.playUnlock()
            } else {
                GamificationService.awardFoodLogged(profile: p)
            }
        }
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
    }

    private var recentFoodItems: [FoodEntry] {
        var seen = Set<String>()
        var result: [FoodEntry] = []
        for entry in food where entry.date < todayStart {
            let key = entry.name.lowercased()
            if !seen.contains(key) {
                seen.insert(key)
                result.append(entry)
                if result.count == 2 { break }
            }
        }
        return result
    }

    private static func autoMealType() -> MealType {
        let h = Calendar.current.component(.hour, from: .now)
        switch h {
        case 5..<11:  return .breakfast
        case 11..<14: return .lunch
        case 18..<23: return .dinner
        default:      return .snack
        }
    }

    // ── Weekly section ─────────────────────────────────────────────────────────

    private var weeklySection: some View {
        VStack(alignment: .leading, spacing: AppSpacing.md) {
            Text("Weekly Check-in")
                .font(AppFonts.title3)
                .foregroundStyle(AppColors.textPrimary)

            Button { activeSheet = .measurements } label: {
                HStack(spacing: AppSpacing.md) {
                    Image(systemName: "ruler.fill")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundStyle(AppColors.info)
                        .frame(width: 44, height: 44)
                        .background(AppColors.info.opacity(0.12), in: Circle())
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Body Measurements")
                            .font(AppFonts.headline)
                            .foregroundStyle(AppColors.textPrimary)
                        Text(measurementSubtitle)
                            .font(AppFonts.caption)
                            .foregroundStyle(isMeasurementLoggedToday ? AppColors.primary : AppColors.textSecondary)
                    }
                    Spacer()
                    if isMeasurementLoggedToday {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 20))
                            .foregroundStyle(AppColors.primary)
                    } else {
                        Image(systemName: "chevron.right")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundStyle(AppColors.textTertiary)
                    }
                }
                .frame(maxWidth: .infinity)
                .cardStyle()
            }
            .buttonStyle(.plain)
            .animation(.spring(response: 0.3), value: isMeasurementLoggedToday)
        }
    }

    // ── Today at a glance ──────────────────────────────────────────────────────

    private var todayAtAGlanceSection: some View {
        let stats = todayFoodStats
        return VStack(alignment: .leading, spacing: AppSpacing.md) {
            SectionHeaderView(title: "Today at a Glance")

            LazyVGrid(columns: [.init(.flexible()), .init(.flexible())], spacing: AppSpacing.md) {
                statCard(label: "Calories",
                         value: stats.calories > 0 ? "\(stats.calories)" : "—",
                         unit: stats.calories > 0 ? "kcal" : "",
                         icon: "flame.fill", color: AppColors.accent)
                statCard(label: "Protein",
                         value: stats.protein > 0 ? String(format: "%.0f", stats.protein) : "—",
                         unit: stats.protein > 0 ? "g" : "",
                         icon: "bolt.fill", color: AppColors.primary)
                statCard(label: "Water",
                         value: hydrationGlasses > 0 ? "\(hydrationGlasses)" : "—",
                         unit: hydrationGlasses > 0 ? (hydrationGlasses == 1 ? "glass" : "glasses") : "",
                         icon: "drop.fill", color: AppColors.info)
                statCard(label: "Side Effects",
                         value: todayEffectsSummary, unit: "",
                         icon: "waveform.path.ecg", color: AppColors.warning)
            }
        }
    }

    private func statCard(label: String, value: String, unit: String, icon: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: AppSpacing.sm) {
            Image(systemName: icon)
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(color)
                .frame(width: 32, height: 32)
                .background(color.opacity(0.12), in: Circle())
            VStack(alignment: .leading, spacing: 2) {
                HStack(alignment: .lastTextBaseline, spacing: 3) {
                    Text(value)
                        .font(AppFonts.statSmall)
                        .foregroundStyle(AppColors.textPrimary)
                        .minimumScaleFactor(0.7)
                        .lineLimit(1)
                    if !unit.isEmpty {
                        Text(unit)
                            .font(AppFonts.micro)
                            .foregroundStyle(AppColors.textSecondary)
                            .lineLimit(1)
                    }
                }
                Text(label)
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textSecondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }

    // ── Logged today ───────────────────────────────────────────────────────────

    private struct LogRowItem {
        let icon: String
        let color: Color
        let title: String
        let subtitle: String
    }

    private var todayLogItems: [LogRowItem] {
        var items: [LogRowItem] = []
        for w in weights.filter({ $0.date >= todayStart }) {
            items.append(.init(
                icon: "scalemass.fill", color: AppColors.primary,
                title: w.displayWeight(unit: profile?.unitSystem ?? "metric"),
                subtitle: w.date.formatted(date: .omitted, time: .shortened)
            ))
        }
        for e in todayEffectEntries {
            items.append(.init(
                icon: "waveform.path.ecg", color: AppColors.accent,
                title: e.effectTypeEnums.map(\.rawValue).joined(separator: ", "),
                subtitle: "Severity: \(e.severityLabel) · \(e.date.formatted(date: .omitted, time: .shortened))"
            ))
        }
        for f in todayFoodEntries {
            let mealLabel = f.mealTypeEnum?.rawValue ?? f.mealType
            items.append(.init(
                icon: "fork.knife", color: AppColors.success,
                title: f.name,
                subtitle: f.calories > 0 ? "\(f.calories) kcal · \(mealLabel)" : mealLabel
            ))
        }
        if hydrationGlasses > 0 {
            items.append(.init(
                icon: "drop.fill", color: AppColors.info,
                title: "\(hydrationGlasses) glass\(hydrationGlasses == 1 ? "" : "es") of water",
                subtitle: "\(hydrationGlasses * 250) ml"
            ))
        }
        for m in measurements.filter({ $0.date >= todayStart }) {
            items.append(.init(
                icon: "ruler.fill", color: AppColors.info,
                title: "Body measurements",
                subtitle: m.date.formatted(date: .omitted, time: .shortened)
            ))
        }
        return items
    }

    @ViewBuilder
    private var loggedTodaySection: some View {
        if !todayLogItems.isEmpty {
            VStack(spacing: AppSpacing.md) {
                SectionHeaderView(title: "Logged Today")
                VStack(spacing: 0) {
                    ForEach(Array(todayLogItems.enumerated()), id: \.offset) { i, item in
                        logRow(item: item)
                        if i < todayLogItems.count - 1 {
                            Divider().padding(.leading, 52)
                        }
                    }
                }
                .cardStyle(padding: 0)
            }
        }
    }

    private func logRow(item: LogRowItem) -> some View {
        HStack(spacing: AppSpacing.md) {
            Image(systemName: item.icon)
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(item.color)
                .frame(width: 36, height: 36)
                .background(item.color.opacity(0.12), in: Circle())
            VStack(alignment: .leading, spacing: 2) {
                Text(item.title)
                    .font(AppFonts.subheadline)
                    .foregroundStyle(AppColors.textPrimary)
                    .lineLimit(1)
                Text(item.subtitle)
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textSecondary)
                    .lineLimit(1)
            }
            Spacer()
        }
        .padding(AppSpacing.cardPadding)
    }

    // ── Empty prompt ───────────────────────────────────────────────────────────

    private var emptyPromptView: some View {
        VStack(spacing: AppSpacing.sm) {
            Image(systemName: "plus.circle.dashed")
                .font(.system(size: 36))
                .foregroundStyle(AppColors.primary.opacity(0.45))
                .padding(.bottom, AppSpacing.xs)
            Text("Nothing logged yet today")
                .font(AppFonts.headline)
                .foregroundStyle(AppColors.textPrimary)
            Text("Use the cards above to start tracking your daily health.")
                .font(AppFonts.callout)
                .foregroundStyle(AppColors.textSecondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, AppSpacing.xl)
        .padding(.horizontal, AppSpacing.xl)
        .background(AppColors.surfaceSecondary,
                    in: RoundedRectangle(cornerRadius: AppSpacing.radiusLg, style: .continuous))
    }

    // ── Computed helpers ───────────────────────────────────────────────────────

    private var todayFoodEntries: [FoodEntry] {
        food.filter { $0.date >= todayStart }
    }

    private var todayEffectEntries: [SideEffectEntry] {
        effects.filter { $0.date >= todayStart }
    }

    private var todayFoodStats: (calories: Int, protein: Double) {
        let entries = todayFoodEntries
        let cal  = entries.reduce(0)   { $0 + $1.calories }
        let prot = entries.reduce(0.0) { $0 + $1.proteinG }
        return (
            calories: cal  > 0 ? cal  : hkData.calories,
            protein:  prot > 0 ? prot : hkData.protein
        )
    }

    private func fetchHKData() async {
        guard healthKit.isGranted else { return }
        async let cal  = healthKit.fetchCaloriesToday()
        async let prot = healthKit.fetchProteinTodayGrams()
        let (calories, protein) = await (cal, prot)
        hkData = HKSnapshot(calories: calories, protein: protein)
    }

    private var todayEffectsSummary: String {
        let entries = todayEffectEntries
        guard !entries.isEmpty else { return "None" }
        let count = entries.count
        return count == 1 ? (entries.first?.effectTypeEnums.first?.rawValue ?? "1 entry") : "\(count) entries"
    }

    private var measurementSubtitle: String {
        guard let m = measurements.first else { return "Not logged yet" }
        let days = Calendar.current.dateComponents([.day], from: m.date, to: .now).day ?? 0
        if days == 0 { return "Logged today" }
        return "Last: \(days) day\(days == 1 ? "" : "s") ago"
    }
}
