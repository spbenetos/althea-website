import SwiftUI
import SwiftData

struct DashboardView: View {
    @Query(sort: \UserProfile.createdAt, order: .reverse) private var profiles: [UserProfile]
    @Query(sort: \DoseEntry.date,        order: .reverse) private var doses:    [DoseEntry]
    @Query(sort: \WeightEntry.date,      order: .reverse) private var weights:  [WeightEntry]
    @Query(sort: \SideEffectEntry.date,  order: .reverse) private var effects:  [SideEffectEntry]
    @Query(sort: \FoodEntry.date,        order: .reverse) private var food:     [FoodEntry]
    @Environment(\.modelContext) private var modelContext
    @Environment(HealthKitService.self) private var healthKit
    @Environment(NotificationService.self) private var notificationService
    @Environment(\.openProfile) private var openProfile
    @State private var showLogDose        = false
    @State private var showLogWeight      = false
    @State private var activityExpanded   = false

    private var profile: UserProfile? { profiles.first }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: AppSpacing.sectionSpacing) {
                    HomeWeightGraphCard(
                        weights: weights,
                        doses: doses,
                        profile: profile,
                        onLogDose: { showLogDose = true },
                        onLogWeight: { showLogWeight = true }
                    )
                    .padding(.horizontal, AppSpacing.sm)

                    HomePKCard(doses: doses, profile: profile)
                        .padding(.horizontal, AppSpacing.sm)

                    if isDoseDueNudgeVisible {
                        doseNudgeCard.padding(.horizontal, AppSpacing.screenPadding)
                    }
                    recentActivitySection
                        .padding(.horizontal, AppSpacing.screenPadding)
                }
                .padding(.bottom, AppSpacing.xxxl)
            }
            .background(AppColors.background)
            .navigationTitle(greeting)
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                // DEBUG — remove before release
                ToolbarItem(placement: .topBarLeading) {
                    Button { resetToNewUser() } label: {
                        Image(systemName: "arrow.uturn.backward.circle")
                            .font(.system(size: 17, weight: .medium))
                            .foregroundStyle(.orange)
                    }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button { openProfile() } label: { profileButtonLabel }
                }
            }
            .sheet(isPresented: $showLogDose) {
                LogDoseView(recentDoses: Array(doses.prefix(20)), totalDoseCount: doses.count, profile: profile)
            }
            .sheet(isPresented: $showLogWeight) { LogWeightView(weights: weights, profile: profile) }
        }
    }


    // ── Dose nudge ────────────────────────────────────────────────────────────

    private var isDoseDueNudgeVisible: Bool {
        guard profile != nil else { return false }
        return !doses.contains { !$0.isMissed && Calendar.current.isDateInToday($0.date) }
    }

    private var doseNudgeCard: some View {
        let streak = profile?.currentStreakDays ?? 0
        let message = streak > 1
            ? "You're on a \(streak)-dose streak — don't break it!"
            : "Staying on schedule helps your medication work effectively."
        return HStack(spacing: AppSpacing.md) {
            Image(systemName: "bell.fill")
                .font(.system(size: 18, weight: .semibold))
                .foregroundStyle(AppColors.primary)
                .frame(width: 36, height: 36)
                .background(AppColors.primarySubtle, in: Circle())
            VStack(alignment: .leading, spacing: AppSpacing.xs) {
                Text("Your dose is due")
                    .font(AppFonts.subheadline)
                    .foregroundStyle(AppColors.textPrimary)
                Text(message)
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textSecondary)
            }
            Spacer()
        }
        .padding(AppSpacing.md)
        .background(AppColors.primarySubtle, in: RoundedRectangle(cornerRadius: AppSpacing.radiusMd, style: .continuous))
    }


    // ── Recent activity ───────────────────────────────────────────────────────

    @ViewBuilder
    private var recentActivitySection: some View {
        let items     = activityItems
        let hasMore   = !activityExpanded && (doses.count + weights.count + effects.count > items.count)

        VStack(spacing: AppSpacing.md) {
            SectionHeaderView(title: "Recent Activity")

            if items.isEmpty {
                EmptyStateView(
                    icon: "tray",
                    title: "Nothing logged yet",
                    message: "Log your first dose or weight to see your activity here."
                )
                .cardStyle()
            } else {
                VStack(spacing: 0) {
                    ForEach(Array(items.enumerated()), id: \.element.id) { index, item in
                        SwipeToDeleteRow(onDelete: item.onDelete) {
                            VStack(spacing: 0) {
                                activityRow(item: item)
                                if index < items.count - 1 {
                                    Divider().padding(.leading, 52)
                                }
                            }
                        }
                    }

                    if hasMore || activityExpanded {
                        Divider()
                        Button {
                            withAnimation(.easeInOut(duration: 0.2)) { activityExpanded.toggle() }
                        } label: {
                            HStack(spacing: AppSpacing.sm) {
                                Text(activityExpanded ? "Show less" : "Show more")
                                    .font(AppFonts.caption)
                                    .foregroundStyle(AppColors.textSecondary)
                                Spacer()
                                Image(systemName: activityExpanded ? "chevron.up" : "chevron.down")
                                    .font(.system(size: 11, weight: .medium))
                                    .foregroundStyle(AppColors.textTertiary)
                            }
                            .contentShape(Rectangle())
                            .padding(AppSpacing.cardPadding)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .cardStyle(padding: 0)
            }
        }
    }

    private struct ActivityItem {
        let icon:     String
        let color:    Color
        let title:    String
        let subtitle: String
        let date:     Date
        let onDelete: (() -> Void)?

        var id: String { "\(date.timeIntervalSince1970)-\(title)" }
    }

    private var activityItems: [ActivityItem] {
        var items: [ActivityItem] = []
        let doseLimit   = activityExpanded ? 20 : 3
        let weightLimit = activityExpanded ? 20 : 3
        let effectLimit = activityExpanded ? 10 : 2
        let totalLimit  = activityExpanded ? 50 : 5

        for dose in doses.prefix(doseLimit) {
            items.append(.init(
                icon: dose.isMissed ? "xmark.circle.fill" : "syringe.fill",
                color: dose.isMissed ? AppColors.error : AppColors.primary,
                title: dose.isMissed ? "Dose missed" : "Dose logged — \(String(format: "%.2g mg", dose.doseMg))",
                subtitle: dose.isMissed ? dose.medicationID.capitalized : (dose.injectionSiteEnum?.displayName ?? dose.injectionSite),
                date: dose.date,
                onDelete: { modelContext.delete(dose) }
            ))
        }
        for weight in weights.prefix(weightLimit) {
            items.append(.init(
                icon: "scalemass.fill", color: AppColors.primary,
                title: "Weight logged",
                subtitle: weight.displayWeight(unit: profile?.unitSystem ?? "metric"),
                date: weight.date,
                onDelete: { modelContext.delete(weight) }
            ))
        }
        for effect in effects.prefix(effectLimit) {
            items.append(.init(
                icon: "waveform.path.ecg", color: AppColors.accent,
                title: effect.effectTypeEnums.map(\.rawValue).prefix(2).joined(separator: ", "),
                subtitle: "Severity: \(effect.severityLabel)",
                date: effect.date,
                onDelete: { modelContext.delete(effect) }
            ))
        }

        return items.sorted { $0.date > $1.date }.prefix(totalLimit).map { $0 }
    }

    private func activityRow(item: ActivityItem) -> some View {
        HStack(spacing: AppSpacing.md) {
            Image(systemName: item.icon)
                .font(.system(size: 15, weight: .semibold))
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

            Text(relativeDate(item.date))
                .font(AppFonts.caption)
                .foregroundStyle(AppColors.textTertiary)
        }
        .padding(AppSpacing.cardPadding)
    }

    // ── Computed helpers ──────────────────────────────────────────────────────

    private var greeting: String {
        let name = profile?.displayName.isEmpty == false ? ", \(profile!.displayName)" : ""
        let hour = Calendar.current.component(.hour, from: .now)
        switch hour {
        case 5..<12: return "Good morning\(name)"
        case 12..<17: return "Good afternoon\(name)"
        default:     return "Good evening\(name)"
        }
    }

    private func relativeDate(_ date: Date) -> String {
        if Calendar.current.isDateInToday(date) {
            return date.formatted(date: .omitted, time: .shortened)
        }
        if Calendar.current.isDateInYesterday(date) { return "Yesterday" }
        return date.formatted(date: .abbreviated, time: .omitted)
    }

    private var profileButtonLabel: some View {
        Image("althea-profile-icon")
            .renderingMode(.original)
            .resizable()
            .scaledToFit()
            .frame(width: 28, height: 28)
    }

    private func resetToNewUser() {
        profiles.forEach { modelContext.delete($0) }
        doses.forEach    { modelContext.delete($0) }
        weights.forEach  { modelContext.delete($0) }
        effects.forEach  { modelContext.delete($0) }
        food.forEach     { modelContext.delete($0) }
        try? modelContext.delete(model: BodyMeasurement.self)
        if let visits = try? modelContext.fetch(FetchDescriptor<DoctorVisit>()) {
            visits.forEach { notificationService.cancelAppointmentReminder(id: $0.notificationID) }
        }
        try? modelContext.delete(model: DoctorVisit.self)
        OnboardingProgressStore.live.clear()
        healthKit.reset()
        notificationService.removeAllDoseReminders()
    }
}

private struct SwipeToDeleteRow<Content: View>: View {
    let onDelete: (() -> Void)?
    @ViewBuilder let content: () -> Content
    @State private var offset: CGFloat = 0

    private let revealWidth: CGFloat = 60

    var body: some View {
        ZStack(alignment: .trailing) {
            if let onDelete, offset < -4 {
                Button(action: onDelete) {
                    Image(systemName: "xmark")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundStyle(.white)
                        .frame(width: 34, height: 34)
                        .background(AppColors.error, in: Circle())
                }
                .padding(.trailing, 13)
            }

            content()
                .background(AppColors.surface)
                .offset(x: offset)
                .simultaneousGesture(
                    DragGesture(minimumDistance: 15, coordinateSpace: .local)
                        .onChanged { value in
                            guard onDelete != nil else { return }
                            let w = value.translation.width
                            let h = value.translation.height
                            guard abs(w) > abs(h) else { return }
                            if w < 0 {
                                withAnimation(.interactiveSpring()) {
                                    offset = max(w, -revealWidth)
                                }
                            } else if offset < 0 {
                                withAnimation(.interactiveSpring()) {
                                    offset = min(0, -revealWidth + w)
                                }
                            }
                        }
                        .onEnded { value in
                            guard onDelete != nil else { return }
                            let w = value.translation.width
                            let h = value.translation.height
                            guard abs(w) > abs(h) else {
                                withAnimation(.spring(response: 0.3, dampingFraction: 0.75)) { offset = 0 }
                                return
                            }
                            let reveal = w < -revealWidth * 0.4 || value.velocity.width < -300
                            withAnimation(.spring(response: 0.3, dampingFraction: 0.75)) {
                                offset = reveal ? -revealWidth : 0
                            }
                        }
                )
        }
        .clipped()
    }
}

#Preview {
    MainTabView()
        .environment(HealthKitService())
        .modelContainer(for: [UserProfile.self, DoseEntry.self, WeightEntry.self, SideEffectEntry.self, FoodEntry.self], inMemory: true)
}
