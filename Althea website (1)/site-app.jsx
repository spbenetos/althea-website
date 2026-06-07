// site-app.jsx — Althea landing page root with Tweaks

const TWEAK_DEFAULTS = {
  accentColor: '#2AB5A2',
  headline: 'Track every dose.\nSee every result.',
  subline: 'The companion app for your GLP-1 medication journey — dose logging, weight tracking, and side effect monitoring in one place.',
  appStoreUrl: 'https://apps.apple.com',
  trialDays: 7,
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  return (
    <TweaksContext.Provider value={t}>
      <NavBar />
      <HeroSection />
      <TrustBar />
      <FeaturePillarsSection />
      <FeatureDeepSection />
      <HowItWorksSection />
      <PricingSection />
      <FinalCTASection />
      <FooterSection />

      <TweaksPanel>
        <TweakSection label="Brand" />
        <TweakColor
          label="Accent colour"
          value={t.accentColor}
          options={['#2AB5A2', '#1E9E8C', '#0A84FF', '#FF6B35']}
          onChange={v => setTweak('accentColor', v)}
        />

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
    </TweaksContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
