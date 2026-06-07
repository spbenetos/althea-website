import SwiftUI

enum AppColors {

    // ── Brand ─────────────────────────────────────────────────────────────────
    static let primary       = Color(hex: "2AB5A2")   // main teal
    static let primaryLight  = Color(hex: "5AD8C6")   // lighter teal
    static let primaryDark   = Color(hex: "1A8A7A")   // darker teal
    static var primarySubtle: Color { primary.opacity(0.12) }

    static let accent        = Color(hex: "FF8C5A")   // warm coral — achievements, highlights
    static let accentLight   = Color(hex: "FFBDA3")
    static var accentSubtle: Color { accent.opacity(0.12) }

    // ── Adaptive backgrounds (auto light/dark) ────────────────────────────────
    static let background        = Color(.systemBackground)
    static let surface           = Color(.secondarySystemBackground)
    static let surfaceSecondary  = Color(.secondarySystemBackground)
    static let separator         = Color(.separator)

    // ── Adaptive text ─────────────────────────────────────────────────────────
    static let textPrimary    = Color(.label)
    static let textSecondary  = Color(.secondaryLabel)
    static let textTertiary   = Color(.tertiaryLabel)
    static let textOnPrimary  = Color.white

    // ── Semantic states ───────────────────────────────────────────────────────
    static let success = Color(.systemGreen)
    static let warning = Color(.systemOrange)
    static let error   = Color(.systemRed)
    static let info    = Color(.systemBlue)
}
