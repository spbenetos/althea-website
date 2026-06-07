import SwiftUI
import SwiftData

struct DosesView: View {
    @Query(sort: \DoseEntry.date, order: .reverse) private var doses: [DoseEntry]
    @Query private var profiles: [UserProfile]
    @Environment(\.modelContext) private var modelContext

    private var profile: UserProfile? { profiles.first }

    @Environment(\.openProfile) private var openProfile
    @State private var selectedMonth: Date = .now
    @State private var showLogSheet  = false

    // Pre-cached values — computed when doses changes, not on every body re-eval
    @State private var dosedDays:      Set<DateComponents> = []
    @State private var cachedSiteDoses: [DoseEntry]        = []
    @State private var cachedDoseCount: Int                = 0

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: AppSpacing.sectionSpacing) {
                    calendarSection
                    injectionSiteSection
                    doseHistorySection
                }
                .padding(.horizontal, AppSpacing.screenPadding)
                .padding(.bottom, AppSpacing.xxxl)
            }
            .background(AppColors.background)
            .navigationTitle("Doses")
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
                    Button { showLogSheet = true } label: {
                        Image(systemName: "plus")
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundStyle(AppColors.textOnPrimary)
                            .frame(width: 32, height: 32)
                            .background(AppColors.primary, in: Circle())
                    }
                }
            }
            .sheet(isPresented: $showLogSheet) {
                LogDoseView(recentDoses: cachedSiteDoses, totalDoseCount: cachedDoseCount, profile: profile)
            }
            .onChange(of: doses, initial: true) { _, newDoses in
                updateCaches(newDoses)
            }
        }
    }

    private func updateCaches(_ newDoses: [DoseEntry]) {
        dosedDays = Set(newDoses.filter { !$0.isMissed }.map {
            Calendar.current.dateComponents([.year, .month, .day], from: $0.date)
        })
        cachedSiteDoses = Array(newDoses.prefix(20))
        cachedDoseCount = newDoses.count
    }

    // ── Calendar ──────────────────────────────────────────────────────────────

    private var calendarSection: some View {
        VStack(alignment: .leading, spacing: AppSpacing.md) {
            SectionHeaderView(title: "Calendar")

            VStack(spacing: AppSpacing.md) {
                // Month navigation
                HStack {
                    Button {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            selectedMonth = Calendar.current.date(byAdding: .month, value: -1, to: selectedMonth) ?? selectedMonth
                        }
                    } label: {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundStyle(AppColors.textSecondary)
                            .frame(width: 36, height: 36)
                            .background(AppColors.surfaceSecondary, in: Circle())
                    }

                    Spacer()

                    Text(selectedMonth.formatted(.dateTime.month(.wide).year()))
                        .font(AppFonts.headline)
                        .foregroundStyle(AppColors.textPrimary)
                        .animation(.none, value: selectedMonth)

                    Spacer()

                    Button {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            let next = Calendar.current.date(byAdding: .month, value: 1, to: selectedMonth) ?? selectedMonth
                            if next <= .now { selectedMonth = next }
                        }
                    } label: {
                        Image(systemName: "chevron.right")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundStyle(Calendar.current.isDate(selectedMonth, equalTo: .now, toGranularity: .month)
                                ? AppColors.textTertiary : AppColors.textSecondary)
                            .frame(width: 36, height: 36)
                            .background(AppColors.surfaceSecondary, in: Circle())
                    }
                    .disabled(Calendar.current.isDate(selectedMonth, equalTo: .now, toGranularity: .month))
                }

                // Day-of-week headers
                LazyVGrid(columns: Array(repeating: .init(.flexible()), count: 7)) {
                    ForEach(["S","M","T","W","T","F","S"], id: \.self) { d in
                        Text(d)
                            .font(AppFonts.micro)
                            .foregroundStyle(AppColors.textTertiary)
                    }
                }

                // Day cells
                LazyVGrid(columns: Array(repeating: .init(.flexible()), count: 7), spacing: AppSpacing.sm) {
                    ForEach(Array(calendarDays.enumerated()), id: \.offset) { _, date in
                        dayCell(date: date, dosedDays: dosedDays)
                    }
                }
            }
        }
        .cardStyle()
    }

    private func dayCell(date: Date?, dosedDays: Set<DateComponents>) -> some View {
        let hasDose = date.map { d in
            dosedDays.contains(Calendar.current.dateComponents([.year, .month, .day], from: d))
        } ?? false
        let isToday = date.map { Calendar.current.isDateInToday($0) } ?? false

        return ZStack {
            if isToday {
                Circle().fill(AppColors.primary).frame(width: 32, height: 32)
            } else if hasDose {
                Circle().fill(AppColors.primarySubtle).frame(width: 32, height: 32)
            }

            if let date {
                VStack(spacing: 1) {
                    Text("\(Calendar.current.component(.day, from: date))")
                        .font(AppFonts.caption)
                        .foregroundStyle(isToday ? .white : AppColors.textPrimary)
                    if hasDose && !isToday {
                        Circle()
                            .fill(AppColors.primary)
                            .frame(width: 4, height: 4)
                    }
                }
            }
        }
        .frame(height: 36)
    }

    // ── Injection site rotation ───────────────────────────────────────────────

    private var injectionSiteSection: some View {
        VStack(alignment: .leading, spacing: AppSpacing.md) {
            SectionHeaderView(title: "Injection Site Rotation")

            VStack(spacing: AppSpacing.md) {
                InjectionBodyMapView(doses: cachedSiteDoses)
                    .frame(maxWidth: 200)
                    .frame(maxWidth: .infinity, alignment: .center)

                HStack(spacing: AppSpacing.md) {
                    legendItem(AppColors.primary.opacity(0.4), "Suggested")
                    legendItem(Color(.systemGray3).opacity(0.55), "Recently used")
                    legendItem(Color(.systemGray5).opacity(0.65), "Never used")
                }
                .frame(maxWidth: .infinity, alignment: .center)

                Divider()

                HStack(spacing: AppSpacing.lg) {
                    VStack(alignment: .leading, spacing: AppSpacing.xs) {
                        Label("Last used", systemImage: "clock.fill")
                            .font(AppFonts.micro)
                            .foregroundStyle(AppColors.textTertiary)
                        Text(lastSiteUsed)
                            .font(AppFonts.bodyMedium)
                            .foregroundStyle(AppColors.textPrimary)
                        if let lastDate = doses.first?.date {
                            Text(lastDate.formatted(date: .abbreviated, time: .omitted))
                                .font(AppFonts.caption)
                                .foregroundStyle(AppColors.textSecondary)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)

                    Divider().frame(height: 44)

                    VStack(alignment: .leading, spacing: AppSpacing.xs) {
                        Label("Suggested next", systemImage: "arrow.right.circle.fill")
                            .font(AppFonts.micro)
                            .foregroundStyle(AppColors.primary)
                        Text(suggestedNextSite)
                            .font(AppFonts.bodyMedium)
                            .foregroundStyle(AppColors.primary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
        }
        .cardStyle()
    }

    private func legendItem(_ color: Color, _ label: String) -> some View {
        HStack(spacing: AppSpacing.xs) {
            Circle().fill(color).frame(width: 10, height: 10)
            Text(label).font(AppFonts.micro).foregroundStyle(AppColors.textSecondary)
        }
    }

    // ── Dose history ──────────────────────────────────────────────────────────

    private var doseHistorySection: some View {
        VStack(spacing: AppSpacing.md) {
            SectionHeaderView(title: "Dose History")

            if doses.isEmpty {
                EmptyStateView(
                    icon: "syringe",
                    title: "No doses logged yet",
                    message: "Tap + to log your first injection.",
                    actionLabel: "Log Dose"
                ) { showLogSheet = true }
                .cardStyle()
            } else {
                LazyVStack(spacing: 0) {
                    ForEach(Array(doses.enumerated()), id: \.element.id) { index, dose in
                        DoseHistoryRow(dose: dose)
                            .contextMenu {
                                Button(role: .destructive) {
                                    modelContext.delete(dose)
                                } label: {
                                    Label("Delete", systemImage: "trash")
                                }
                            }
                        if index < doses.count - 1 {
                            Divider().padding(.leading, 56)
                        }
                    }
                }
                .cardStyle()
            }
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private var calendarDays: [Date?] {
        let cal = Calendar.current
        guard
            let range = cal.range(of: .day, in: .month, for: selectedMonth),
            let firstDay = cal.date(from: cal.dateComponents([.year, .month], from: selectedMonth))
        else { return [] }
        let weekdayOffset = cal.component(.weekday, from: firstDay) - 1
        return Array(repeating: nil, count: weekdayOffset)
            + range.compactMap { cal.date(byAdding: .day, value: $0 - 1, to: firstDay) }
    }

    private var lastSiteUsed: String {
        guard let last = doses.first else { return "None yet" }
        return last.injectionSiteEnum?.displayName ?? last.injectionSite
    }

    private var suggestedNextSite: String {
        nextInjectionSite(from: cachedSiteDoses).displayName
    }
}

// ── Dose history row ──────────────────────────────────────────────────────────

private struct DoseHistoryRow: View {
    let dose: DoseEntry

    private var isMissed: Bool { dose.isMissed }

    var body: some View {
        HStack(spacing: AppSpacing.md) {
            Circle()
                .fill(isMissed ? AppColors.error.opacity(0.1) : AppColors.primarySubtle)
                .frame(width: 40, height: 40)
                .overlay {
                    Image(systemName: isMissed ? "xmark.circle.fill" : "syringe.fill")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(isMissed ? AppColors.error : AppColors.primary)
                }

            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: AppSpacing.sm) {
                    Text(isMissed ? "Missed Dose" : String(format: "%.2g mg", dose.doseMg))
                        .font(AppFonts.bodyMedium)
                        .foregroundStyle(isMissed ? AppColors.error : AppColors.textPrimary)
                    if !dose.medicationID.isEmpty {
                        Text(dose.medicationID.capitalized)
                            .font(AppFonts.caption)
                            .foregroundStyle(AppColors.textSecondary)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(isMissed ? AppColors.error.opacity(0.1) : AppColors.primarySubtle,
                                        in: Capsule())
                    }
                }
                if !isMissed {
                    Text(dose.injectionSiteEnum?.displayName ?? dose.injectionSite)
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.textSecondary)
                }
                if !dose.notes.isEmpty && dose.notes != "Missed dose" {
                    Text(dose.notes)
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.textTertiary)
                        .lineLimit(1)
                }
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                Text(dose.date.formatted(date: .abbreviated, time: .omitted))
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textTertiary)
                if Calendar.current.isDateInToday(dose.date) {
                    Text("Today")
                        .font(AppFonts.micro)
                        .foregroundStyle(isMissed ? AppColors.error : AppColors.primary)
                }
            }
        }
        .padding(AppSpacing.cardPadding)
        .opacity(isMissed ? 0.75 : 1)
    }
}

// ── Injection site body map ───────────────────────────────────────────────────

private struct InjectionBodyMapView: View {
    let doses: [DoseEntry]

    private var lastUsedDates: [InjectionSite: Date] {
        var result: [InjectionSite: Date] = [:]
        for dose in doses where !dose.isMissed {
            if let site = dose.injectionSiteEnum, result[site] == nil {
                result[site] = dose.date
            }
        }
        return result
    }

    private var nextSuggested: InjectionSite { nextInjectionSite(from: doses) }

    private func zoneColor(for site: InjectionSite, suggested: InjectionSite, lastUsed: [InjectionSite: Date]) -> Color {
        if site == suggested { return AppColors.primary.opacity(0.4) }
        if lastUsed[site] != nil { return Color(.systemGray3).opacity(0.55) }
        return Color(.systemGray5).opacity(0.65)
    }

    private func logicalRect(for site: InjectionSite) -> CGRect {
        switch site {
        case .abdomenUpperLeft:  return CGRect(x: 60, y: 52, width: 40, height: 51)
        case .abdomenUpperRight: return CGRect(x: 100, y: 52, width: 40, height: 51)
        case .abdomenLowerLeft:  return CGRect(x: 60, y: 103, width: 40, height: 52)
        case .abdomenLowerRight: return CGRect(x: 100, y: 103, width: 40, height: 52)
        case .upperArmLeft:      return CGRect(x: 32, y: 52, width: 26, height: 65)
        case .upperArmRight:     return CGRect(x: 142, y: 52, width: 26, height: 65)
        case .thighLeft:         return CGRect(x: 62, y: 157, width: 32, height: 83)
        case .thighRight:        return CGRect(x: 106, y: 157, width: 32, height: 83)
        }
    }

    var body: some View {
        let lastUsed  = lastUsedDates
        let suggested = nextSuggested

        Canvas { context, size in
            let scale = size.width / 200
            let cs    = CGSize(width: 8 * scale, height: 8 * scale)
            let fill  = Color(UIColor.systemGray5)

            func rect(_ x: CGFloat, _ y: CGFloat, _ w: CGFloat, _ h: CGFloat) -> CGRect {
                CGRect(x: x * scale, y: y * scale, width: w * scale, height: h * scale)
            }

            // Silhouette
            context.fill(Path(ellipseIn: rect(82, 0, 36, 44)), with: .color(fill))
            context.fill(Path(roundedRect: rect(93, 42, 14, 12), cornerSize: CGSize(width: 2 * scale, height: 2 * scale)), with: .color(fill))
            context.fill(Path(roundedRect: rect(60, 52, 80, 103), cornerSize: cs), with: .color(fill))
            context.fill(Path(roundedRect: rect(32, 52, 26, 65), cornerSize: cs), with: .color(fill))
            context.fill(Path(roundedRect: rect(142, 52, 26, 65), cornerSize: cs), with: .color(fill))
            context.fill(Path(roundedRect: rect(62, 157, 32, 83), cornerSize: cs), with: .color(fill))
            context.fill(Path(roundedRect: rect(106, 157, 32, 83), cornerSize: cs), with: .color(fill))

            // Zone overlays
            for site in InjectionSite.allCases {
                let lr    = logicalRect(for: site)
                let sr    = CGRect(x: lr.minX * scale, y: lr.minY * scale, width: lr.width * scale, height: lr.height * scale)
                let color = zoneColor(for: site, suggested: suggested, lastUsed: lastUsed)
                context.fill(Path(roundedRect: sr, cornerSize: CGSize(width: 6 * scale, height: 6 * scale)), with: .color(color))
            }
        }
        .aspectRatio(200.0 / 242.0, contentMode: .fit)
    }
}
