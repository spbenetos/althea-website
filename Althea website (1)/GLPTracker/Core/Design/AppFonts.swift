import SwiftUI
import UIKit

// All fonts scale with the user's Dynamic Type size preference.
// UIFontMetrics maps each custom size to the nearest semantic text style
// so it grows/shrinks proportionally when the user adjusts accessibility text size.

enum AppFonts {

    // ── Display / Hero ────────────────────────────────────────────────────────
    static var displayLarge: Font { scaled(38, .bold,     .rounded,  .largeTitle) }
    static var display:      Font { scaled(30, .bold,     .rounded,  .largeTitle) }

    // ── Titles ────────────────────────────────────────────────────────────────
    static var title:        Font { scaled(24, .bold,     .rounded,  .title1)     }
    static var title2:       Font { scaled(20, .semibold, .rounded,  .title2)     }
    static var title3:       Font { scaled(18, .semibold, .rounded,  .title3)     }

    // ── Body ──────────────────────────────────────────────────────────────────
    static var headline:     Font { scaled(16, .semibold, .default,  .headline)   }
    static var body:         Font { scaled(16, .regular,  .default,  .body)       }
    static var bodyMedium:   Font { scaled(16, .medium,   .default,  .body)       }
    static var callout:      Font { scaled(15, .regular,  .default,  .callout)    }
    static var subheadline:  Font { scaled(14, .medium,   .default,  .subheadline)}

    // ── Small ─────────────────────────────────────────────────────────────────
    static var caption:      Font { scaled(13, .regular,  .default,  .footnote)   }
    static var captionBold:  Font { scaled(13, .semibold, .default,  .footnote)   }
    static var micro:        Font { scaled(11, .medium,   .rounded,  .caption2)   }

    // ── Stats / Numbers ───────────────────────────────────────────────────────
    static var statHero:     Font { scaled(48, .bold,     .rounded,  .largeTitle) }
    static var statLarge:    Font { scaled(34, .bold,     .rounded,  .title1)     }
    static var stat:         Font { scaled(26, .bold,     .rounded,  .title2)     }
    static var statSmall:    Font { scaled(20, .semibold, .rounded,  .title3)     }

    // ── Core helper ───────────────────────────────────────────────────────────

    private static func scaled(
        _ size: CGFloat,
        _ weight: UIFont.Weight,
        _ design: UIFontDescriptor.SystemDesign,
        _ textStyle: UIFont.TextStyle
    ) -> Font {
        let base = UIFont.systemFont(ofSize: size, weight: weight)
        let descriptor = base.fontDescriptor.withDesign(design) ?? base.fontDescriptor
        let designedFont = UIFont(descriptor: descriptor, size: size)
        let scaledFont = UIFontMetrics(forTextStyle: textStyle).scaledFont(for: designedFont)
        return Font(scaledFont)
    }
}
