import SwiftUI

struct WelcomeStepView: View {
    @Bindable var vm: OnboardingViewModel
    @State private var currentPage = 0

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            VStack(spacing: 0) {
                TabView(selection: $currentPage) {
                    ForEach(0..<3) { i in
                        SlidePageView(index: i)
                            .tag(i)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
            }
            .safeAreaInset(edge: .bottom) {
                VStack(spacing: 12) {
                    pageDots
                    ctaSection
                        .padding(.horizontal, AppSpacing.screenPadding)
                }
                .padding(.vertical, AppSpacing.md)
                .background(Color.black)
            }
        }
    }

    private var pageDots: some View {
        HStack(spacing: 8) {
            ForEach(0..<3) { i in
                Capsule()
                    .fill(i == currentPage ? AppColors.primary : Color.white.opacity(0.2))
                    .frame(width: i == currentPage ? 22 : 8, height: 8)
                    .animation(.spring(response: 0.3), value: currentPage)
            }
        }
    }

    private var ctaSection: some View {
        VStack(spacing: 14) {
            Button {
                if currentPage < 2 {
                    withAnimation(.easeInOut(duration: 0.3)) { currentPage += 1 }
                } else {
                    UINotificationFeedbackGenerator().notificationOccurred(.success)
                    vm.advance()
                }
            } label: {
                Text(currentPage == 2 ? "Get Started" : "Continue")
            }
            .buttonStyle(PrimaryButtonStyle())

        }
    }
}

// ── Each slide ────────────────────────────────────────────────────────────────

private struct SlidePageView: View {
    let index: Int

    var body: some View {
        VStack(spacing: 0) {
            illustrationView
                .frame(maxWidth: .infinity)
                .padding(.top, 36)
                .padding(.bottom, 28)

            VStack(spacing: 14) {
                Text(headlines[index])
                    .font(AppFonts.display)
                    .foregroundStyle(.white)
                    .multilineTextAlignment(.center)
                    .lineSpacing(2)

                Text(bodies[index])
                    .font(AppFonts.callout)
                    .foregroundStyle(Color.white.opacity(0.55))
                    .multilineTextAlignment(.center)
                    .lineSpacing(4)
                    .padding(.horizontal, 28)
            }

            VStack(alignment: .leading, spacing: 12) {
                ForEach(Array(bullets[index].enumerated()), id: \.offset) { i, b in
                    HStack(spacing: 12) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundStyle(slideColors[index])
                        Text(b)
                            .font(AppFonts.body)
                            .foregroundStyle(.white)
                        if index == 2 && i == 0 {
                            Spacer()
                            TapRippleView()
                        }
                    }
                }
            }
            .padding(.top, 28)
            .padding(.horizontal, 40)

            Spacer()
        }
    }

    @ViewBuilder
    private var illustrationView: some View {
        switch index {
        case 1:
            Image("onboarding-medication")
                .resizable()
                .scaledToFit()
                .padding(.horizontal, 32)
        case 2:
            ReportIllustration()
                .padding(.horizontal, 20)
        default:
            WeightProgressChartView()
                .frame(maxWidth: .infinity)
                .frame(height: 280)
        }
    }
}

private let slideColors: [Color] = [Color(hex: "2AB5A2"), Color(hex: "8B67D8"), Color(hex: "FF8C5A")]

private let headlines = [
    "Your GLP-1 journey,\nclearly tracked.",
    "Know your medication\ninside and out.",
    "Share a report\nwith your doctor.",
]

private let bodies = [
    "One app for everything — doses, weight, side effects, and your doctor's report.",
    "Real clinical data — pharmacokinetic curves, dosing schedules, and side effect profiles.",
    "Export a structured PDF of your entire history — ready for your next appointment.",
]

private let bullets: [[String]] = [
    ["Dose tracking & injection site rotation", "Weight and progress charts", "Personalised dose reminders"],
    ["Blood-level PK curves per dose",           "Clinical trial efficacy data",  "Side effect frequencies"],
    ["One-tap PDF export",                       "Full dose and weight history",   "Professional, doctor-ready format"],
]

// ── Illustration 3: Doctor report card ───────────────────────────────────────

private struct ReportIllustration: View {
    @State private var lineProgress: Double = 0

    private let orange = Color(hex: "FF8C5A")
    private let rows: [(label: String, fraction: Double)] = [
        ("Current dosage",  0.92),
        ("Injection log",   0.74),
        ("Side effects",    0.84),
        ("Lab results",     0.56),
        ("Progress notes",  0.70),
    ]
    private let chartBars: [Double] = [0.92, 0.82, 0.72, 0.62, 0.50, 0.40, 0.30]

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {

            // ── Header ────────────────────────────────────────────────────────
            HStack(spacing: 8) {
                Circle().fill(orange).frame(width: 8, height: 8)
                Text("Patient Info")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(orange)
                Spacer()
                RoundedRectangle(cornerRadius: 2)
                    .fill(orange.opacity(0.75))
                    .frame(width: 60 * CGFloat(lineProgress), height: 7)
            }
            .padding(.bottom, 12)
            .animation(.easeOut(duration: 0.45).delay(0.2), value: lineProgress)

            Rectangle().fill(Color.white.opacity(0.10)).frame(height: 0.5)
                .padding(.bottom, 12)

            // ── Content rows ──────────────────────────────────────────────────
            ForEach(Array(rows.enumerated()), id: \.offset) { i, row in
                HStack(spacing: 10) {
                    Text(row.label)
                        .font(.system(size: 9.5, weight: .medium))
                        .foregroundStyle(Color.white.opacity(0.45))
                        .frame(width: 92, alignment: .leading)

                    GeometryReader { g in
                        ZStack(alignment: .leading) {
                            Capsule()
                                .fill(Color.white.opacity(0.07))
                                .frame(height: 5)
                            Capsule()
                                .fill(Color.white.opacity(i == 0 ? 0.38 : 0.24))
                                .frame(width: g.size.width * CGFloat(row.fraction * lineProgress), height: 5)
                        }
                        .frame(height: 5)
                    }
                    .frame(height: 5)
                }
                .padding(.bottom, i < rows.count - 1 ? 10 : 14)
                .animation(.easeOut(duration: 0.55).delay(Double(i) * 0.22 + 0.4), value: lineProgress)
            }

            Rectangle().fill(Color.white.opacity(0.10)).frame(height: 0.5)
                .padding(.bottom, 10)

            // ── Weight trend ──────────────────────────────────────────────────
            HStack(spacing: 4) {
                Text("Weight trend")
                    .font(.system(size: 9.5, weight: .semibold))
                    .foregroundStyle(orange.opacity(0.85))
                Image(systemName: "arrow.down")
                    .font(.system(size: 8, weight: .bold))
                    .foregroundStyle(orange.opacity(0.85))
            }
            .padding(.bottom, 8)

            HStack(alignment: .bottom, spacing: 3) {
                ForEach(Array(chartBars.enumerated()), id: \.offset) { _, bh in
                    RoundedRectangle(cornerRadius: 2)
                        .fill(
                            LinearGradient(
                                stops: [
                                    .init(color: orange.opacity(0.30), location: 0),
                                    .init(color: orange.opacity(0.80), location: 1)
                                ],
                                startPoint: .bottom,
                                endPoint: .top
                            )
                        )
                        .frame(maxWidth: .infinity)
                        .frame(height: 40 * CGFloat(bh * lineProgress))
                }
            }
            .frame(height: 40)
            .animation(.spring(response: 0.70).delay(1.9), value: lineProgress)
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(Color.white.opacity(0.07))
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .stroke(Color.white.opacity(0.10), lineWidth: 0.75)
                )
        )
        .frame(maxWidth: .infinity)
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { lineProgress = 1 }
        }
    }
}

// ── Tap-ripple animation ──────────────────────────────────────────────────────

private struct TapRippleView: View {
    @State private var pressing       = false
    @State private var ring1Expanding = false
    @State private var ring2Expanding = false
    @State private var driftX: CGFloat = 0
    @State private var driftY: CGFloat = 0

    private let color = Color(hex: "FF8C5A")

    var body: some View {
        ZStack {
            Circle()
                .stroke(color.opacity(ring1Expanding ? 0 : 0.55), lineWidth: 1.5)
                .scaleEffect(ring1Expanding ? 2.6 : 0.15)
                .frame(width: 24, height: 24)

            Circle()
                .stroke(color.opacity(ring2Expanding ? 0 : 0.38), lineWidth: 1.5)
                .scaleEffect(ring2Expanding ? 2.6 : 0.15)
                .frame(width: 24, height: 24)

            Image(systemName: "hand.tap.fill")
                .font(.system(size: 17, weight: .medium))
                .foregroundStyle(color)
                .scaleEffect(pressing ? 0.78 : 1.0)
                .offset(x: driftX, y: (pressing ? 2 : 0) + driftY)
        }
        .frame(width: 30, height: 30)
        .task { await loop() }
    }

    @MainActor
    private func loop() async {
        while !Task.isCancelled {
            // 1. Press down
            withAnimation(.easeIn(duration: 0.09)) { pressing = true }
            try? await Task.sleep(for: .milliseconds(110))
            guard !Task.isCancelled else { return }

            // 2. Release + fire ring 1
            withAnimation(.spring(response: 0.22, dampingFraction: 0.5)) { pressing = false }
            ring1Expanding = false
            withAnimation(.easeOut(duration: 0.55)) { ring1Expanding = true }
            try? await Task.sleep(for: .milliseconds(140))
            guard !Task.isCancelled else { return }

            // 3. Fire ring 2
            ring2Expanding = false
            withAnimation(.easeOut(duration: 0.55)) { ring2Expanding = true }
            try? await Task.sleep(for: .milliseconds(460))
            guard !Task.isCancelled else { return }

            // 4. Drift down-right
            withAnimation(.easeInOut(duration: 0.50)) { driftX = 6; driftY = 5 }
            try? await Task.sleep(for: .milliseconds(650))
            guard !Task.isCancelled else { return }

            // 5. Float back to origin
            withAnimation(.easeInOut(duration: 0.40)) { driftX = 0; driftY = 0 }
            try? await Task.sleep(for: .milliseconds(550))
        }
    }
}
