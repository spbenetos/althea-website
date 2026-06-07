import SwiftUI
import SwiftData

struct UserProgressView: View {
    @Query private var profiles: [UserProfile]
    @Query(sort: \WeightEntry.date)                      private var weights:      [WeightEntry]
    @Query(sort: \DoseEntry.date, order: .reverse)       private var doses:        [DoseEntry]
    @Query(sort: \SideEffectEntry.date, order: .reverse) private var effects:      [SideEffectEntry]
    @Query(sort: \FoodEntry.date, order: .reverse)       private var food:         [FoodEntry]
    @Query(sort: \BodyMeasurement.date, order: .reverse) private var measurements: [BodyMeasurement]

    private var profile: UserProfile? { profiles.first }
    private var isImperial: Bool { profile?.unitSystem == "imperial" }

    @State private var xpProgress:      Double      = 0
    @State private var newlyUnlocked:   Set<String> = []
    @State private var showLevelUp:     Bool        = false
    @State private var animateLevel:    Bool        = false
    @State private var showReport:      Bool        = false
    @State private var generatedReport: HealthReport?
    @Environment(\.openProfile) private var openProfile

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: AppSpacing.sectionSpacing) {
                    levelCard
                    achievementsSection
                    doseChartSection
                    sideEffectSection
                    weightChartSection
                    projectedGoalSection
                }
                .padding(.horizontal, AppSpacing.screenPadding)
                .padding(.top, AppSpacing.md)
                .padding(.bottom, AppSpacing.xxxl)
            }
            .background(AppColors.background)
            .navigationTitle("Progress")
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
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        generatedReport = PDFReportService.generate(
                            profile: profile,
                            doses:   Array(doses),
                            weights: Array(weights),
                            effects: Array(effects)
                        )
                        showReport = true
                    } label: {
                        Image(systemName: "square.and.arrow.up")
                            .font(.system(size: 17, weight: .medium))
                            .foregroundStyle(AppColors.textPrimary)
                    }
                }
            }
            .onAppear { handleAppear() }
            .sheet(isPresented: $showReport) {
                if let report = generatedReport {
                    ReportSheetView(report: report)
                }
            }
            .fullScreenCover(isPresented: $showLevelUp) {
                LevelUpOverlay(level: profile?.level ?? 1,
                               name: GamificationService.levelName(for: profile?.totalPoints ?? 0),
                               onDismiss: { showLevelUp = false })
            }
        }
    }

    // ── Level card ────────────────────────────────────────────────────────────

    private var levelCard: some View {
        let pts   = profile?.totalPoints ?? 0
        let lvl   = GamificationService.level(for: pts)
        let name  = GamificationService.levelName(for: pts)
        let toNext = GamificationService.pointsToNextLevel(for: pts)

        return ZStack(alignment: .bottomLeading) {
            LinearGradient(
                colors: [AppColors.primary, AppColors.primaryDark],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .clipShape(RoundedRectangle(cornerRadius: AppSpacing.cardRadius, style: .continuous))

            VStack(alignment: .leading, spacing: AppSpacing.md) {
                HStack(alignment: .center) {
                    VStack(alignment: .leading, spacing: AppSpacing.xs) {
                        HStack(spacing: AppSpacing.sm) {
                            Image(systemName: "bolt.fill")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundStyle(.white.opacity(0.9))
                            Text("Level \(lvl)")
                                .font(AppFonts.caption)
                                .foregroundStyle(.white.opacity(0.9))
                        }
                        Text(name)
                            .font(AppFonts.title)
                            .foregroundStyle(.white)
                            .scaleEffect(animateLevel ? 1.0 : 0.85)
                            .opacity(animateLevel ? 1.0 : 0)
                    }
                    Spacer()
                    ZStack {
                        Circle()
                            .stroke(.white.opacity(0.2), lineWidth: 5)
                            .frame(width: 70, height: 70)
                        Circle()
                            .trim(from: 0, to: xpProgress)
                            .stroke(.white, style: StrokeStyle(lineWidth: 5, lineCap: .round))
                            .frame(width: 70, height: 70)
                            .rotationEffect(.degrees(-90))
                        Text("\(lvl)")
                            .font(AppFonts.stat)
                            .foregroundStyle(.white)
                    }
                }

                VStack(alignment: .leading, spacing: AppSpacing.xs) {
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            Capsule().fill(.white.opacity(0.2)).frame(height: 8)
                            Capsule()
                                .fill(.white)
                                .frame(width: max(8, geo.size.width * xpProgress), height: 8)
                        }
                    }
                    .frame(height: 8)

                    HStack {
                        Text("\(pts) pts")
                            .font(AppFonts.micro)
                            .foregroundStyle(.white.opacity(0.8))
                        Spacer()
                        Text(toNext > 0 ? "\(toNext) pts to Level \(lvl + 1)" : "Max level reached!")
                            .font(AppFonts.micro)
                            .foregroundStyle(.white.opacity(0.8))
                    }
                }
            }
            .padding(AppSpacing.lg)
        }
        .frame(height: 170)
        .shadow(color: AppColors.primary.opacity(0.4), radius: 16, x: 0, y: 6)
    }

    // ── Achievements ──────────────────────────────────────────────────────────

    private var achievementsSection: some View {
        let earned = GamificationService.earnedIDs(doses: doses, weights: weights, profile: profile, effects: effects, food: food, measurements: measurements)

        return VStack(alignment: .leading, spacing: AppSpacing.md) {
            HStack {
                SectionHeaderView(title: "Achievements")
                Spacer()
                Text("\(earned.count)/\(Achievement.all.count)")
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textTertiary)
            }

            LazyVGrid(
                columns: [.init(.flexible()), .init(.flexible()), .init(.flexible())],
                spacing: AppSpacing.md
            ) {
                ForEach(Achievement.all) { achievement in
                    let isEarned  = earned.contains(achievement.id)
                    let isNew     = newlyUnlocked.contains(achievement.id)
                    AchievementBadgeView(
                        achievement: achievement,
                        isEarned: isEarned,
                        animateIn: isNew
                    )
                }
            }
        }
    }

    // ── Side effect section ───────────────────────────────────────────────────

    private var sideEffectSection: some View {
        VStack(alignment: .leading, spacing: AppSpacing.md) {
            SectionHeaderView(title: "Side Effects")
            if effects.isEmpty {
                EmptyStateView(
                    icon: "waveform.path.ecg",
                    title: "No symptoms logged",
                    message: "Log side effects from the Track tab to see trends here."
                )
                .cardStyle()
            } else {
                SideEffectTrendView(effects: effects, doses: doses)
                    .cardStyle()
            }
        }
    }

    // ── Dose adherence chart ──────────────────────────────────────────────────

    private var doseChartSection: some View {
        VStack(alignment: .leading, spacing: AppSpacing.md) {
            SectionHeaderView(title: "Dose Adherence")
            VStack(spacing: AppSpacing.md) {
                DoseAdherenceView(doses: doses, profile: profile)
                Divider()
                HStack(spacing: AppSpacing.lg) {
                    StatTileView(value: "\(profile?.currentStreakDays ?? 0)", unit: "days", label: "Current Streak", tintColor: AppColors.accent)
                    StatTileView(value: "\(profile?.longestStreakDays ?? 0)", unit: "days", label: "Best Streak",     tintColor: AppColors.textSecondary)
                    StatTileView(value: "\(doses.count)",                     unit: "total", label: "Doses Logged")
                }
            }
            .cardStyle()
        }
    }

    // ── Weight chart ──────────────────────────────────────────────────────────

    private var weightChartSection: some View {
        VStack(alignment: .leading, spacing: AppSpacing.md) {
            SectionHeaderView(title: "Weight Over Time")

            if weights.count < 2 {
                EmptyStateView(
                    icon: "chart.line.uptrend.xyaxis",
                    title: "Not enough data",
                    message: "Log at least two weight entries to see your trend."
                )
                .cardStyle()
            } else {
                VStack(alignment: .leading, spacing: AppSpacing.md) {
                    let unit    = isImperial ? "lbs" : "kg"
                    let factor  = isImperial ? 2.20462 : 1.0
                    let startKg = weights.first?.weightKg ?? 0
                    let curKg   = weights.last?.weightKg  ?? 0
                    let lost    = startKg - curKg

                    HStack(spacing: AppSpacing.lg) {
                        StatTileView(value: String(format: "%.1f", max(0, lost) * factor), unit: unit, label: "Total Lost")
                        StatTileView(value: String(format: "%.1f", startKg * factor),      unit: unit, label: "Starting", tintColor: AppColors.textSecondary)
                        StatTileView(value: String(format: "%.1f", curKg * factor),        unit: unit, label: "Current",  tintColor: AppColors.primary)
                    }

                    if let bmi = bmiInfo {
                        Divider()
                        StatTileView(
                            value: String(format: "%.1f", bmi.value),
                            unit: "",
                            label: "BMI · \(bmi.label)",
                            tintColor: bmi.color
                        )
                    }

                    WeightChartView(
                        weights:    weights,
                        targetKg:   profile?.targetWeightKg,
                        isImperial: isImperial
                    )
                }
                .cardStyle()
            }
        }
    }

    // ── Projected goal ────────────────────────────────────────────────────────

    private enum GoalProjection {
        case noGoal
        case atGoal
        case gainingWeight
        case onTrack(date: Date, weeklyKg: Double)
    }

    private var goalProjection: GoalProjection {
        guard weights.count >= 2 else { return .noGoal }
        guard let target = profile?.targetWeightKg else { return .noGoal }
        let currentKg = weights.last!.weightKg
        guard currentKg > target else { return .atGoal }
        let recent = Array(weights.suffix(8))
        guard let firstW = recent.first, let lastW = recent.last, firstW.id != lastW.id else { return .noGoal }
        let days = lastW.date.timeIntervalSince(firstW.date) / 86400
        guard days > 0 else { return .noGoal }
        let kgPerDay = (lastW.weightKg - firstW.weightKg) / days
        guard kgPerDay < 0 else { return .gainingWeight }
        let daysRemaining = (currentKg - target) / (-kgPerDay)
        guard let projected = Calendar.current.date(byAdding: .day, value: Int(daysRemaining), to: lastW.date) else { return .noGoal }
        return .onTrack(date: projected, weeklyKg: -kgPerDay * 7)
    }

    private var bmiInfo: (value: Double, label: String, color: Color)? {
        guard let w = weights.last, let h = profile?.heightCm, h > 0 else { return nil }
        let hm  = h / 100
        let bmi = w.weightKg / (hm * hm)
        switch bmi {
        case ..<18.5:   return (bmi, "Underweight", AppColors.info)
        case 18.5..<25: return (bmi, "Normal",      AppColors.success)
        case 25..<30:   return (bmi, "Overweight",  AppColors.warning)
        default:        return (bmi, "Obese",        AppColors.error)
        }
    }

    @ViewBuilder
    private var projectedGoalSection: some View {
        if weights.count >= 2 {
            VStack(alignment: .leading, spacing: AppSpacing.md) {
                SectionHeaderView(title: "Goal Projection")
                projectedGoalCard.cardStyle()
            }
        }
    }

    @ViewBuilder
    private var projectedGoalCard: some View {
        switch goalProjection {
        case .noGoal:
            HStack(spacing: AppSpacing.md) {
                Image(systemName: "flag")
                    .font(.system(size: 22, weight: .semibold))
                    .foregroundStyle(AppColors.textTertiary)
                    .frame(width: 36)
                VStack(alignment: .leading, spacing: AppSpacing.xs) {
                    Text("No goal set")
                        .font(AppFonts.headline)
                        .foregroundStyle(AppColors.textPrimary)
                    Text("Set a target weight in Settings to see your projected goal date.")
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.textSecondary)
                }
            }
        case .atGoal:
            HStack(spacing: AppSpacing.md) {
                Image(systemName: "trophy.fill")
                    .font(.system(size: 22, weight: .semibold))
                    .foregroundStyle(Color(hex: "FFD700"))
                    .frame(width: 36)
                VStack(alignment: .leading, spacing: AppSpacing.xs) {
                    Text("Goal reached!")
                        .font(AppFonts.headline)
                        .foregroundStyle(AppColors.textPrimary)
                    Text("You've hit your target weight. Incredible work.")
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.textSecondary)
                }
            }
        case .gainingWeight:
            HStack(spacing: AppSpacing.md) {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 22, weight: .semibold))
                    .foregroundStyle(AppColors.warning)
                    .frame(width: 36)
                VStack(alignment: .leading, spacing: AppSpacing.xs) {
                    Text("Review your goal")
                        .font(AppFonts.headline)
                        .foregroundStyle(AppColors.textPrimary)
                    Text("Your weight has been trending up recently. Staying consistent with your medication and habits can help get back on track.")
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.textSecondary)
                }
            }
        case let .onTrack(date, weeklyKg):
            onTrackProjectionView(date: date, weeklyKg: weeklyKg)
        }
    }

    private func onTrackProjectionView(date: Date, weeklyKg: Double) -> some View {
        let factor     = isImperial ? 2.20462 : 1.0
        let unit       = isImperial ? "lbs/wk" : "kg/wk"
        let targetRate = profile?.targetWeeklyLossKg ?? 0.5
        return VStack(alignment: .leading, spacing: AppSpacing.md) {
            HStack(spacing: AppSpacing.md) {
                Image(systemName: "flag.fill")
                    .font(.system(size: 22, weight: .semibold))
                    .foregroundStyle(AppColors.primary)
                    .frame(width: 36)
                VStack(alignment: .leading, spacing: AppSpacing.xs) {
                    Text("At your current pace, you'll reach your goal by")
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.textSecondary)
                    Text(date.formatted(.dateTime.month(.wide).year()))
                        .font(AppFonts.title3)
                        .foregroundStyle(AppColors.textPrimary)
                }
            }
            Divider()
            HStack(spacing: AppSpacing.lg) {
                StatTileView(
                    value: String(format: "%.2g", weeklyKg * factor),
                    unit: unit,
                    label: "Your pace",
                    tintColor: AppColors.primary
                )
                StatTileView(
                    value: String(format: "%.2g", targetRate * factor),
                    unit: unit,
                    label: "Target pace",
                    tintColor: AppColors.textSecondary
                )
                Spacer()
            }
        }
    }

    // ── On appear logic ───────────────────────────────────────────────────────

    private func handleAppear() {
        // XP bar + level number animate in
        let pts = profile?.totalPoints ?? 0
        withAnimation(.spring(response: 1.4, dampingFraction: 0.75).delay(0.2)) {
            xpProgress = GamificationService.progressToNextLevel(for: pts)
        }
        withAnimation(.spring(response: 0.55, dampingFraction: 0.65).delay(0.15)) {
            animateLevel = true
        }

        // Hydration flag (check current day while on this screen)
        if HydrationStore.glassesToday() >= 8 {
            UserDefaults.standard.set(true, forKey: "achievement_hydrated")
        }

        // Detect newly unlocked achievements
        let earned = GamificationService.earnedIDs(doses: doses, weights: weights, profile: profile, effects: effects, food: food, measurements: measurements)
        let seen   = GamificationService.seenIDs()
        let fresh  = earned.subtracting(seen)

        if !fresh.isEmpty {
            // Award bonus points for newly unlocked achievements
            if let profile { GamificationService.awardAchievements(newIDs: fresh, profile: profile) }
            GamificationService.markSeen(earned)
            // Stagger-animate each new badge
            for (i, id) in fresh.sorted().enumerated() {
                DispatchQueue.main.asyncAfter(deadline: .now() + Double(i) * 0.35) {
                    _ = withAnimation(.spring(response: 0.45, dampingFraction: 0.55)) {
                        newlyUnlocked.insert(id)
                    }
                    GamificationService.playUnlock()
                }
            }
        }

        // Level up detection
        let lastSeen = UserDefaults.standard.integer(forKey: "lastSeenLevel")
        let current  = profile?.level ?? 1
        if current > lastSeen && lastSeen > 0 {
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                showLevelUp = true
                GamificationService.playLevelUp()
            }
        }
        if current > 0 {
            UserDefaults.standard.set(current, forKey: "lastSeenLevel")
        }
    }
}

// ── Achievement badge ─────────────────────────────────────────────────────────

private struct AchievementBadgeView: View {
    let achievement: Achievement
    let isEarned:    Bool
    let animateIn:   Bool

    @State private var scale:     CGFloat = 1.0
    @State private var ringScale: CGFloat = 0.6
    @State private var ringOpacity: Double = 0

    var body: some View {
        VStack(spacing: AppSpacing.sm) {
            ZStack {
                // Expanding unlock ring
                if animateIn {
                    Circle()
                        .stroke(achievement.color, lineWidth: 2)
                        .frame(width: 64, height: 64)
                        .scaleEffect(ringScale)
                        .opacity(ringOpacity)
                }

                // Spark particles
                if animateIn {
                    SparkBurst(color: achievement.color)
                        .frame(width: 64, height: 64)
                }

                Circle()
                    .fill(isEarned ? achievement.color.opacity(0.15) : AppColors.surfaceSecondary)
                    .frame(width: 64, height: 64)
                    .overlay {
                        if !isEarned {
                            Image(systemName: "lock.fill")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundStyle(AppColors.textTertiary)
                                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomTrailing)
                                .padding(6)
                        }
                    }

                Image(systemName: achievement.icon)
                    .font(.system(size: 24, weight: .semibold))
                    .foregroundStyle(isEarned ? achievement.color : AppColors.textTertiary)
            }
            .scaleEffect(scale)

            Text(achievement.name)
                .font(AppFonts.micro)
                .foregroundStyle(isEarned ? AppColors.textPrimary : AppColors.textTertiary)
                .multilineTextAlignment(.center)
                .frame(width: 72)
                .lineLimit(2)
        }
        .onTapGesture { GamificationService.playTap() }
        .onAppear {
            guard animateIn else { return }
            // Badge pop
            withAnimation(.spring(response: 0.4, dampingFraction: 0.5).delay(0.05)) {
                scale = 1.2
            }
            withAnimation(.spring(response: 0.3, dampingFraction: 0.7).delay(0.28)) {
                scale = 1.0
            }
            // Ring expand + fade
            withAnimation(.easeOut(duration: 0.65).delay(0.05)) {
                ringScale   = 1.8
                ringOpacity = 0
            }
            withAnimation(.easeIn(duration: 0.05).delay(0.05)) {
                ringOpacity = 1
            }
        }
    }
}

// ── Spark burst particles ─────────────────────────────────────────────────────

private struct SparkBurst: View {
    let color: Color
    @State private var animate = false

    private let count = 8
    private let radius: CGFloat = 36

    var body: some View {
        ZStack {
            ForEach(0..<count, id: \.self) { i in
                let angle = Double(i) / Double(count) * 2 * .pi
                Circle()
                    .fill(color)
                    .frame(width: animate ? 3 : 6, height: animate ? 3 : 6)
                    .offset(
                        x: animate ? cos(angle) * radius : 0,
                        y: animate ? sin(angle) * radius : 0
                    )
                    .opacity(animate ? 0 : 0.9)
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.55).delay(0.08)) { animate = true }
        }
    }
}

// ── Level up overlay ──────────────────────────────────────────────────────────

struct LevelUpOverlay: View {
    let level:     Int
    let name:      String
    let onDismiss: () -> Void

    @State private var scale:   CGFloat = 0.4
    @State private var opacity: Double  = 0

    var body: some View {
        ZStack {
            Color.black.opacity(0.75).ignoresSafeArea()

            VStack(spacing: AppSpacing.lg) {
                ConfettiView()
                    .frame(maxWidth: .infinity, maxHeight: 200)
                    .clipped()

                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(colors: [AppColors.primary, AppColors.primaryDark],
                                           startPoint: .topLeading, endPoint: .bottomTrailing)
                        )
                        .frame(width: 110, height: 110)
                    VStack(spacing: 4) {
                        Text("LVL")
                            .font(.system(size: 13, weight: .bold, design: .rounded))
                            .foregroundStyle(.white.opacity(0.8))
                        Text("\(level)")
                            .font(.system(size: 38, weight: .black, design: .rounded))
                            .foregroundStyle(.white)
                    }
                }
                .scaleEffect(scale)

                VStack(spacing: AppSpacing.xs) {
                    Text("Level Up!")
                        .font(AppFonts.title)
                        .foregroundStyle(.white)
                    Text(name)
                        .font(AppFonts.headline)
                        .foregroundStyle(AppColors.primaryLight)
                }
                .opacity(opacity)

                Button {
                    onDismiss()
                } label: {
                    Text("Keep Going!")
                        .font(AppFonts.headline)
                        .foregroundStyle(AppColors.primary)
                        .frame(width: 200, height: 50)
                        .background(.white.opacity(0.15), in: Capsule())
                        .overlay(Capsule().stroke(.white.opacity(0.3), lineWidth: 1))
                }
                .opacity(opacity)
            }
            .padding(AppSpacing.xl)
        }
        .onAppear {
            withAnimation(.spring(response: 0.55, dampingFraction: 0.6).delay(0.2)) { scale = 1.0 }
            withAnimation(.easeOut(duration: 0.4).delay(0.5)) { opacity = 1 }
        }
    }
}

// ── Confetti canvas ───────────────────────────────────────────────────────────

private struct ConfettiView: View {
    @State private var particles: [ConfettiParticle] = ConfettiParticle.generate(count: 60)
    @State private var startTime = Date()

    var body: some View {
        TimelineView(.animation) { ctx in
            ConfettiCanvas(particles: particles, elapsed: ctx.date.timeIntervalSince(startTime))
        }
        .onAppear { startTime = .now }
    }
}

private struct ConfettiCanvas: View {
    let particles: [ConfettiParticle]
    let elapsed: TimeInterval

    var body: some View {
        Canvas(renderer: { context, size in
            for p in particles {
                let t = elapsed + p.delay
                guard t > 0 else { continue }
                let x = p.x * size.width
                let y = (p.y + t * p.speed * 0.4).truncatingRemainder(dividingBy: 1.1) * size.height
                let angle = t * p.spin
                let rect  = CGRect(x: x - 5, y: y - 3, width: 10, height: 6)
                var ctx2  = context
                ctx2.opacity = max(0, 1 - t * 0.25)
                ctx2.translateBy(x: x, y: y)
                ctx2.rotate(by: .radians(angle))
                ctx2.translateBy(x: -x, y: -y)
                ctx2.fill(Rectangle().path(in: rect), with: .color(p.color))
            }
        })
    }
}

private struct ConfettiParticle {
    let x, y, speed, spin, delay: Double
    let color: Color

    static func generate(count: Int) -> [ConfettiParticle] {
        let colors: [Color] = [
            AppColors.primary, AppColors.primaryLight, AppColors.accent,
            Color(hex: "FFD700"), Color(hex: "34C759"), Color(hex: "007AFF"),
        ]
        return (0..<count).map { _ in
            ConfettiParticle(
                x:     Double.random(in: 0...1),
                y:     Double.random(in: -0.5...0),
                speed: Double.random(in: 0.12...0.28),
                spin:  Double.random(in: -3...3),
                delay: Double.random(in: -2...0),
                color: colors.randomElement()!
            )
        }
    }
}
