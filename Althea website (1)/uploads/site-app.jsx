// site-app.jsx — Main App component with Tweaks for the Althea landing page

function App() {
  return (
    <React.Fragment>
      <NavBar />
      <HeroClinical />
      <FeaturesSection />
      <PricingSection />
      <FooterSection />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
