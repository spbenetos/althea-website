// site-app.jsx — Althea landing page root with Tweaks

const TWEAK_DEFAULTS = {
  accentColor: '#2AB5A2',
  headline: 'Track every dose.\nSee every result.',
  subline: 'The companion app for your GLP-1 medication journey.',
  appStoreUrl: 'https://apps.apple.com',
  trialDays: 7,
  animChartDraw: true,
  animCountUp: true,
  animProgressRail: true,
  animHeroParallax: true,
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const anim = {
    animChartDraw: t.animChartDraw,
    animCountUp: t.animCountUp,
    animProgressRail: t.animProgressRail,
    animHeroParallax: t.animHeroParallax,
  };

  return (
    <TweaksContext.Provider value={t}>
      <AnimContext.Provider value={anim}>
        <NavBar />
        <HeroSection />
        <ImpactBand />
        <TrustBar />
        <ShowcaseSection />
        <FeaturePillarsSection />
        <FeatureDeepSection />
        <HowItWorksSection />
        <PricingSection />
        <FAQSection />
        <FinalCTASection />
        <FooterSection />
        <StickyMobileCTA />

        <TweaksPanel>
          <TweakSection label="Brand" />
          <TweakColor
            label="Accent colour"
            value={t.accentColor}
            options={['#2AB5A2', '#1E9E8C', '#0A84FF', '#64748B']}
            onChange={v => setTweak('accentColor', v)}
          />

          <TweakSection label="Animations" />
          <TweakToggle label="Self-drawing charts" value={t.animChartDraw} onChange={v => setTweak('animChartDraw', v)} />
          <TweakToggle label="Count-up stats" value={t.animCountUp} onChange={v => setTweak('animCountUp', v)} />
          <TweakToggle label="Scroll progress rail" value={t.animProgressRail} onChange={v => setTweak('animProgressRail', v)} />
          <TweakToggle label="Hero phone parallax" value={t.animHeroParallax} onChange={v => setTweak('animHeroParallax', v)} />

          <TweakSection label="Hero copy" />
          <TweakText
            label="Headline"
            value={t.headline}
            onChange={v => setTweak('headline', v)}
          />
          <TweakText
            label="Subline"
            value={t.subline}
            onChange={v => setTweak('subline', v)}
          />

          <TweakSection label="App Store" />
          <TweakText
            label="App Store URL"
            value={t.appStoreUrl}
            onChange={v => setTweak('appStoreUrl', v)}
          />
          <TweakNumber
            label="Free trial days"
            value={t.trialDays}
            min={1} max={30} step={1}
            onChange={v => setTweak('trialDays', v)}
          />
        </TweaksPanel>
      </AnimContext.Provider>
    </TweaksContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
