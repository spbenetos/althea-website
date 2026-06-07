import SwiftUI

enum AppSpacing {

    // ── Base scale ────────────────────────────────────────────────────────────
    static let xs:   CGFloat =  4
    static let sm:   CGFloat =  8
    static let md:   CGFloat = 16
    static let lg:   CGFloat = 24
    static let xl:   CGFloat = 32
    static let xxl:  CGFloat = 48
    static let xxxl: CGFloat = 64

    // ── Semantic ──────────────────────────────────────────────────────────────
    static let screenPadding:  CGFloat = 20
    static let cardPadding:    CGFloat = 16
    static let sectionSpacing: CGFloat = 28
    static let itemSpacing:    CGFloat = 12

    // ── Component sizes ───────────────────────────────────────────────────────
    static let buttonHeight:   CGFloat = 56
    static let inputHeight:    CGFloat = 52
    static let chipHeight:     CGFloat = 36
    static let iconSizeSm:     CGFloat = 20
    static let iconSizeMd:     CGFloat = 24
    static let iconSizeLg:     CGFloat = 32

    // ── Corner radii ──────────────────────────────────────────────────────────
    static let radiusSm:   CGFloat = 10
    static let radiusMd:   CGFloat = 16
    static let radiusLg:   CGFloat = 22
    static let radiusXl:   CGFloat = 30
    static let radiusFull: CGFloat = 999

    // Convenience aliases
    static let buttonRadius:   CGFloat = radiusMd
    static let cardRadius:     CGFloat = radiusLg
    static let inputRadius:    CGFloat = radiusMd
    static let sheetRadius:    CGFloat = radiusXl
}

// ── Reusable view modifiers ───────────────────────────────────────────────────

extension View {
    /// Applies standard card styling: white surface, rounded corners, soft shadow.
    func cardStyle(padding: CGFloat = AppSpacing.cardPadding) -> some View {
        self
            .padding(padding)
            .background(AppColors.surface, in: RoundedRectangle(cornerRadius: AppSpacing.cardRadius, style: .continuous))
            .shadow(color: .black.opacity(0.055), radius: 12, x: 0, y: 4)
    }

    /// Applies a subtle tinted card with the primary brand color.
    func primaryCardStyle(padding: CGFloat = AppSpacing.cardPadding) -> some View {
        self
            .padding(padding)
            .background(AppColors.primarySubtle, in: RoundedRectangle(cornerRadius: AppSpacing.cardRadius, style: .continuous))
    }
}
