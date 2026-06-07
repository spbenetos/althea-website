import SwiftUI

// ── Tracking card style ───────────────────────────────────────────────────────

extension View {
    /// Bordered card with a corner glint gradient — used for the daily tracking cards in TrackView.
    func trackingCardStyle() -> some View {
        self
            .padding(AppSpacing.md)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background {
                ZStack {
                    RoundedRectangle(cornerRadius: AppSpacing.cardRadius, style: .continuous)
                        .fill(AppColors.surface)
                    // Top-leading corner glint that fades diagonally to transparent
                    RoundedRectangle(cornerRadius: AppSpacing.cardRadius, style: .continuous)
                        .fill(LinearGradient(
                            stops: [
                                .init(color: .white.opacity(0.15), location: 0),
                                .init(color: .white.opacity(0.05), location: 0.42),
                                .init(color: .clear, location: 0.70)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ))
                    // Visible outline
                    RoundedRectangle(cornerRadius: AppSpacing.cardRadius, style: .continuous)
                        .strokeBorder(Color(.separator).opacity(0.5), lineWidth: 1)
                }
            }
            .shadow(color: .black.opacity(0.07), radius: 14, x: 0, y: 5)
    }
}

// ── Button styles ─────────────────────────────────────────────────────────────

struct PrimaryButtonStyle: ButtonStyle {
    var isLoading: Bool = false
    var isDisabled: Bool = false

    func makeBody(configuration: Configuration) -> some View {
        HStack(spacing: AppSpacing.sm) {
            if isLoading {
                ProgressView()
                    .tint(AppColors.textOnPrimary)
                    .scaleEffect(0.85)
            }
            configuration.label
        }
        .font(AppFonts.headline)
        .foregroundStyle(AppColors.textOnPrimary)
        .frame(maxWidth: .infinity)
        .frame(height: AppSpacing.buttonHeight)
        .background(
            (isDisabled ? AppColors.textTertiary : AppColors.primary)
                .opacity(configuration.isPressed ? 0.80 : 1),
            in: RoundedRectangle(cornerRadius: AppSpacing.buttonRadius, style: .continuous)
        )
        .scaleEffect(configuration.isPressed && !isDisabled ? 0.975 : 1)
        .animation(.easeOut(duration: 0.14), value: configuration.isPressed)
        .onChange(of: configuration.isPressed) { _, isPressed in
            if isPressed && !isDisabled && !isLoading {
                UIImpactFeedbackGenerator(style: .rigid).impactOccurred()
            }
        }
    }
}

struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(AppFonts.headline)
            .foregroundStyle(AppColors.primary)
            .frame(maxWidth: .infinity)
            .frame(height: AppSpacing.buttonHeight)
            .background(
                AppColors.primarySubtle,
                in: RoundedRectangle(cornerRadius: AppSpacing.buttonRadius, style: .continuous)
            )
            .scaleEffect(configuration.isPressed ? 0.975 : 1)
            .animation(.easeOut(duration: 0.14), value: configuration.isPressed)
    }
}

struct DestructiveButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(AppFonts.headline)
            .foregroundStyle(AppColors.error)
            .frame(maxWidth: .infinity)
            .frame(height: AppSpacing.buttonHeight)
            .background(
                AppColors.error.opacity(0.10),
                in: RoundedRectangle(cornerRadius: AppSpacing.buttonRadius, style: .continuous)
            )
            .scaleEffect(configuration.isPressed ? 0.975 : 1)
            .animation(.easeOut(duration: 0.14), value: configuration.isPressed)
    }
}

// ── Chip / pill button ────────────────────────────────────────────────────────

struct ChipButtonStyle: ButtonStyle {
    var isSelected: Bool = false
    var isSmall: Bool = false

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(isSmall ? AppFonts.micro : AppFonts.captionBold)
            .foregroundStyle(isSelected ? AppColors.textOnPrimary : AppColors.textSecondary)
            .padding(.horizontal, isSmall ? AppSpacing.sm : AppSpacing.md)
            .padding(.vertical, isSmall ? 4 : 0)
            .frame(height: isSmall ? nil : AppSpacing.chipHeight)
            .background(
                isSelected ? AppColors.primary : AppColors.surfaceSecondary,
                in: Capsule()
            )
            .scaleEffect(configuration.isPressed ? (isSmall ? 0.93 : 0.95) : 1)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}

// ── Icon button ───────────────────────────────────────────────────────────────

struct IconButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .foregroundStyle(AppColors.primary)
            .frame(width: 40, height: 40)
            .background(
                AppColors.primarySubtle,
                in: Circle()
            )
            .scaleEffect(configuration.isPressed ? 0.92 : 1)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}

// ── Section header style ──────────────────────────────────────────────────────

struct SectionHeaderView: View {
    let title: String
    var actionLabel: String? = nil
    var action: (() -> Void)? = nil

    var body: some View {
        HStack {
            Text(title)
                .font(AppFonts.title3)
                .foregroundStyle(AppColors.textPrimary)
            Spacer()
            if let label = actionLabel, let action {
                Button(label, action: action)
                    .font(AppFonts.subheadline)
                    .foregroundStyle(AppColors.primary)
            }
        }
    }
}

// ── Empty state ───────────────────────────────────────────────────────────────

struct EmptyStateView: View {
    let icon: String
    let title: String
    let message: String
    var actionLabel: String? = nil
    var action: (() -> Void)? = nil

    var body: some View {
        VStack(spacing: AppSpacing.md) {
            Image(systemName: icon)
                .font(.system(size: 44))
                .foregroundStyle(AppColors.primary.opacity(0.5))

            VStack(spacing: AppSpacing.xs) {
                Text(title)
                    .font(AppFonts.title3)
                    .foregroundStyle(AppColors.textPrimary)
                Text(message)
                    .font(AppFonts.callout)
                    .foregroundStyle(AppColors.textSecondary)
                    .multilineTextAlignment(.center)
            }

            if let label = actionLabel, let action {
                Button(label, action: action)
                    .buttonStyle(PrimaryButtonStyle())
                    .frame(width: 220)
                    .padding(.top, AppSpacing.sm)
            }
        }
        .padding(AppSpacing.xl)
        .frame(maxWidth: .infinity)
    }
}

// ── Stat tile ─────────────────────────────────────────────────────────────────

struct StatTileView: View {
    let value: String
    let unit: String
    let label: String
    var tintColor: Color = AppColors.primary

    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.xs) {
            HStack(alignment: .lastTextBaseline, spacing: 3) {
                Text(value)
                    .font(AppFonts.stat)
                    .foregroundStyle(tintColor)
                Text(unit)
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textSecondary)
            }
            Text(label)
                .font(AppFonts.caption)
                .foregroundStyle(AppColors.textSecondary)
        }
    }
}
