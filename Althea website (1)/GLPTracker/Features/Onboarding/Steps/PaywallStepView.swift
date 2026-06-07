import SwiftUI
import SwiftData

// ── Paywall plan options ──────────────────────────────────────────────────────

private enum PaywallOption: Hashable {
    case monthly    // charged now
    case annual     // 7-day free trial, then annual
}

struct PaywallStepView: View {
    @Bindable var vm: OnboardingViewModel
    @Environment(SubscriptionService.self) private var subscriptionService
    @Environment(HealthKitService.self) private var healthKitService
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \UserProfile.createdAt, order: .reverse) private var profiles: [UserProfile]

    @State private var isPurchasing = false
    @State private var errorMessage: String? = nil
    @State private var selectedOption: PaywallOption = .annual

    private let features = [
        "Site rotation\n& dose tracking",
        "Weight & progress charts",
        "Full GLP-1 drug library",
        "Personalised dose reminders",
        "PDF report for your doctor",
        "Achievements & milestones",
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                header.padding(.top, AppSpacing.xl)
                planOptions
                    .padding(.horizontal, AppSpacing.screenPadding)
                    .padding(.top, AppSpacing.xl)
                featureList.padding(.top, AppSpacing.xl)
                ctaSection
                    .padding(.top, AppSpacing.xl)
                    .padding(.horizontal, AppSpacing.screenPadding)
            }
        }
        .scrollBounceBehavior(.basedOnSize)
        // Capture auth if the magic link is tapped while the user is on this screen.
    }

    // ── Header ────────────────────────────────────────────────────────────────

    private var header: some View {
        VStack(spacing: AppSpacing.sm) {
            Text("Your GLP-1 journey,\nfully supported")
                .font(AppFonts.display)
                .foregroundStyle(.white)
                .multilineTextAlignment(.center)

            Text("Doses, progress, reminders, and insights\n— all in one app.")
                .font(AppFonts.callout)
                .foregroundStyle(Color.white.opacity(0.55))
                .multilineTextAlignment(.center)
                .lineSpacing(3)
        }
    }

    // ── Plan option cards ─────────────────────────────────────────────────────

    private var planOptions: some View {
        VStack(spacing: 10) {
            PlanOptionCard(
                badge: "7-DAY FREE TRIAL",
                badgeStyle: AnyShapeStyle(LinearGradient(
                    colors: [Color(hex: "35C07B"), Color(hex: "2AB5A2")],
                    startPoint: .leading,
                    endPoint: .trailing
                )),
                title: "Annual",
                priceMain: "$4.17/mo",
                strikethroughPrice: "$6.99/mo",
                priceSub: "7 days free · billed $49.99/yr",
                isSelected: selectedOption == .annual,
                isTrial: true
            ) { selectedOption = .annual }

            PlanOptionCard(
                badge: nil,
                title: "Monthly",
                priceMain: "$6.99/mo",
                priceSub: "per month, charged today",
                isSelected: selectedOption == .monthly
            ) { selectedOption = .monthly }
        }
    }

    // ── Feature list ──────────────────────────────────────────────────────────

    private var featureList: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], alignment: .leading, spacing: 14) {
            ForEach(features, id: \.self) { title in
                HStack(spacing: 8) {
                    Image(systemName: "checkmark")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(Color(hex: "35C07B"))
                    Text(title)
                        .font(AppFonts.caption)
                        .foregroundStyle(Color.white.opacity(0.75))
                        .fixedSize(horizontal: false, vertical: true)
                    Spacer()
                }
            }
        }
        .padding(.horizontal, AppSpacing.screenPadding)
    }

    // ── CTA ───────────────────────────────────────────────────────────────────

    private var ctaSection: some View {
        VStack(spacing: AppSpacing.md) {
            if let error = errorMessage {
                Text(error).font(AppFonts.caption).foregroundStyle(AppColors.error).multilineTextAlignment(.center)
            }

            Button { purchase() } label: {
                HStack(spacing: AppSpacing.sm) {
                    if !isPurchasing { Image(systemName: "crown.fill") }
                    Text(isPurchasing ? "Processing…" : ctaLabel)
                }
            }
            // PrimaryButtonStyle handles the spinner — no extra ProgressView needed in the label
            .buttonStyle(PrimaryButtonStyle(isLoading: isPurchasing))
            .disabled(isPurchasing)

            Button("Restore Purchases") {
                Task {
                    isPurchasing = true
                    await subscriptionService.restorePurchases()
                    isPurchasing = false
                    if subscriptionService.isSubscribed { advanceToCelebration() }
                }
            }
            .font(AppFonts.caption)
            .foregroundStyle(Color.white.opacity(0.4))

            legalFooter
        }
    }

    private var ctaLabel: String {
        switch selectedOption {
        case .annual:  return "Start My Free Trial"
        case .monthly: return "Subscribe Monthly"
        }
    }

    private var legalFooter: some View {
        VStack(spacing: AppSpacing.xs) {
            Text(legalText)
                .font(AppFonts.micro)
                .foregroundStyle(Color.white.opacity(0.3))
                .multilineTextAlignment(.center)
            HStack(spacing: AppSpacing.lg) {
                Button("Privacy Policy") { }.font(AppFonts.micro).foregroundStyle(Color.white.opacity(0.4))
                Button("Terms of Use")   { }.font(AppFonts.micro).foregroundStyle(Color.white.opacity(0.4))
            }
        }
        .padding(.top, AppSpacing.sm)
    }

    private var legalText: String {
        switch selectedOption {
        case .annual:
            return "After the 7-day free trial, you will be charged $49.99/year. Cancel any time in Settings › Apple ID › Subscriptions before the trial ends to avoid charges."
        case .monthly:
            return "You will be charged $6.99 today and monthly thereafter. Cancel any time in Settings › Apple ID › Subscriptions."
        }
    }

    // ── Actions ───────────────────────────────────────────────────────────────

    private func purchase() {
        errorMessage = nil
        Task {
            isPurchasing = true
            do {
                let plan: SubscriptionPlan = selectedOption == .annual ? .annual : .monthly
                try await subscriptionService.purchase(plan: plan)
                isPurchasing = false
                advanceToCelebration()
            } catch StoreError.userCancelled {
                isPurchasing = false
            } catch {
                isPurchasing = false
                errorMessage = "Purchase failed. Please try again."
            }
        }
    }

    // Apply every collected onboarding field to the profile so the data is
    // saved as soon as payment succeeds, then move to the celebration step.
    // The onboardingComplete gate is flipped by CelebrationStepView's CTA.
    private func advanceToCelebration() {
        guard let profile = profiles.first else { return }
        vm.applyToProfile(profile, healthKitEnabled: healthKitService.isGranted)
        try? modelContext.save()
        vm.advance()
    }
}

// ── Plan option card ──────────────────────────────────────────────────────────

private struct PlanOptionCard: View {
    let badge: String?
    var badgeStyle: AnyShapeStyle = AnyShapeStyle(Color.clear)
    let title: String
    let priceMain: String
    var strikethroughPrice: String? = nil
    let priceSub: String
    let isSelected: Bool
    var isTrial: Bool = false
    let onTap: () -> Void

    private let trialColor = Color(hex: "35C07B")
    private var accentColor: Color { isTrial ? trialColor : AppColors.primary }

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: AppSpacing.md) {
                ZStack {
                    Circle()
                        .stroke(isSelected ? accentColor : Color.white.opacity(0.25), lineWidth: 1.5)
                        .frame(width: 22, height: 22)
                    if isSelected {
                        Circle()
                            .fill(accentColor)
                            .frame(width: 12, height: 12)
                    }
                }

                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 6) {
                        Text(title)
                            .font(AppFonts.headline)
                            .foregroundStyle(.white)
                        if let badge {
                            Text(badge)
                                .font(.system(size: 9, weight: .bold))
                                .foregroundStyle(.black)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(badgeStyle, in: Capsule())
                        }
                    }
                    Text(priceSub)
                        .font(AppFonts.caption)
                        // Trial sub-price is shown at higher opacity so the conversion cost is clear
                        .foregroundStyle(Color.white.opacity(isTrial ? 0.75 : 0.5))
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 1) {
                    if let strikethroughPrice {
                        Text(strikethroughPrice)
                            .font(AppFonts.caption)
                            .strikethrough(true, color: Color.white.opacity(0.35))
                            .foregroundStyle(Color.white.opacity(0.35))
                    }
                    Text(priceMain)
                        .font(AppFonts.bodyMedium)
                        .foregroundStyle(isSelected ? accentColor : .white)
                }
            }
            .padding(AppSpacing.cardPadding)
            .background(cardBackground)
        }
        .buttonStyle(.plain)
        .animation(.easeInOut(duration: 0.15), value: isSelected)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(title). \(priceMain)\(strikethroughPrice != nil ? ", down from \(strikethroughPrice!)" : ""). \(priceSub)")
        .accessibilityAddTraits(isSelected ? [.isButton, .isSelected] : .isButton)
    }

    @ViewBuilder
    private var cardBackground: some View {
        if isTrial {
            RoundedRectangle(cornerRadius: AppSpacing.cardRadius, style: .continuous)
                .fill(LinearGradient(
                    colors: [trialColor.opacity(0.18), Color(hex: "2AB5A2").opacity(0.08)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                ))
                .overlay(
                    RoundedRectangle(cornerRadius: AppSpacing.cardRadius, style: .continuous)
                        .stroke(isSelected ? trialColor : trialColor.opacity(0.30), lineWidth: 1.5)
                )
        } else {
            RoundedRectangle(cornerRadius: AppSpacing.cardRadius, style: .continuous)
                .fill(Color.white.opacity(0.07))
                .overlay(
                    RoundedRectangle(cornerRadius: AppSpacing.cardRadius, style: .continuous)
                        .stroke(isSelected ? AppColors.primary : Color.clear, lineWidth: 1.5)
                )
        }
    }
}
