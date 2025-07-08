import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Zap, ShieldCheck, BarChart3, Users } from 'lucide-react';

// Sub-components for a cleaner structure
const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <div className="bg-neutral-800/50 border border-neutral-700/80 rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/60 hover:bg-neutral-800/80">
    <div className="mb-4 flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 border border-primary/30 text-primary">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-neutral-100 mb-2">{title}</h3>
    <p className="text-neutral-400 leading-relaxed">{children}</p>
  </div>
);

const TrustLogo = ({ src, alt }: { src: string; alt: string }) => (
  <img src={src} alt={alt} className="h-8 object-contain" />
);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans">
      {/* Background Gradient & Grid */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(158,127,255,0.3),rgba(255,255,255,0))]"></div>
        <div
          className="absolute inset-0 bg-repeat"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23262626' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-neutral-900/50 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold tracking-tighter text-neutral-100">Flottlog</div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-neutral-300 hover:text-white transition-colors text-sm font-medium"
              >
                Anmelden
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-primary text-white px-4 py-2 rounded-full font-medium text-sm hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <span>Kostenlos starten</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-48 pb-32 text-center">
          <div className="max-w-4xl mx-auto px-6 sm:px-8">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-400 mb-6">
              Mehr als ein Fahrtenbuch.
              <br />
              <span className="bg-clip-text bg-gradient-to-r from-primary to-secondary">Ihr strategisches Finanztool.</span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10">
              Verwandeln Sie lästige Pflicht in wertvolle Daten. Erfassen Sie Fahrten rechtssicher, sparen Sie Steuern und gewinnen Sie Zeit für das, was wirklich zählt.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(158,127,255,0.5)]"
            >
              Jetzt 14 Tage kostenlos testen
            </button>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="py-12">
          <div className="max-w-5xl mx-auto px-6 sm:px-8">
            <p className="text-center text-sm text-neutral-500 mb-6">Vertraut von modernen Unternehmern und Selbstständigen</p>
            <div className="flex justify-center items-center space-x-12 opacity-50 grayscale">
              <span className="font-bold text-lg">DigitalWerk</span>
              <span className="font-bold text-lg">KreativKombinat</span>
              <span className="font-bold text-lg">CodeCrafters</span>
              <span className="font-bold text-lg">InnovateNow</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-neutral-900/50">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-neutral-100">Vom Chaos zur Klarheit</h2>
              <p className="text-lg text-neutral-400 max-w-2xl mx-auto mt-4">Flottlog wurde für maximale Effizienz und absolute Sorgenfreiheit entwickelt.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard icon={<Zap size={24} />} title="Automatisierte Präzision">
                Erfassen Sie Fahrten mit wenigen Klicks. Unsere intelligente Logik minimiert den Aufwand und maximiert die Genauigkeit.
              </FeatureCard>
              <FeatureCard icon={<ShieldCheck size={24} />} title="Revisionssichere Dokumentation">
                Schlafen Sie ruhig. Flottlog erfüllt alle Anforderungen des Finanzamts und erstellt lückenlose, unveränderbare Aufzeichnungen.
              </FeatureCard>
              <FeatureCard icon={<BarChart3 size={24} />} title="Intelligente Analysen">
                Exportieren Sie nicht nur Daten, sondern gewinnen Sie Einblicke. Erkennen Sie Kostenfaktoren und optimieren Sie Ihre Ausgaben.
              </FeatureCard>
              <FeatureCard icon={<Users size={24} />} title="Müheloses Flottenmanagement">
                Egal ob ein Fahrzeug oder zwanzig. Verwalten Sie Ihre gesamte Flotte zentral und behalten Sie stets den Überblick.
              </FeatureCard>
            </div>
          </div>
        </section>

        {/* How it works / Visual Showcase */}
        <section className="py-24">
            <div className="max-w-5xl mx-auto px-6 sm:px-8 text-center">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-neutral-100 mb-4">So einfach. So schnell.</h2>
                <p className="text-lg text-neutral-400 mb-12">In drei Schritten zum perfekten Fahrtenbuch.</p>
                <div className="relative">
                    <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-primary to-secondary opacity-20 blur-2xl"></div>
                    <img 
                        src="https://images.pexels.com/photos/18448931/pexels-photo-18448931/free-photo-of-a-person-s-hand-is-shown-on-a-laptop-screen.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                        alt="Flottlog App Interface" 
                        className="relative rounded-2xl border border-neutral-700 shadow-2xl shadow-primary/10"
                    />
                </div>
            </div>
        </section>


        {/* CTA Section */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-neutral-100 mb-6">Starten Sie in die Zukunft der Fahrtenbuchführung.</h2>
            <p className="text-lg text-neutral-400 mb-10">Keine Kreditkarte. Kein Risiko. Voller Funktionsumfang für 14 Tage.</p>
            <button
              onClick={() => navigate('/register')}
              className="bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(158,127,255,0.5)]"
            >
              Jetzt kostenlos registrieren
              <ArrowRight className="inline-block ml-2" size={20} />
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-lg font-bold text-neutral-100">Flottlog</div>
            <ul className="flex items-center space-x-6 text-sm text-neutral-400">
              <li><a href="#" className="hover:text-white transition-colors">Impressum</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Datenschutz</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AGB</a></li>
            </ul>
            <div className="text-sm text-neutral-500">
              © {new Date().getFullYear()} Flottlog. Alle Rechte vorbehalten.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
