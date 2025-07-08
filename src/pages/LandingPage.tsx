import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, FileText, Shield, TrendingUp, Users, ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: 'Digitales Fahrtenbuch',
      description: 'Erfassen Sie Ihre Fahrten schnell und einfach digital. Keine Papierzettel mehr.',
    },
    {
      icon: Shield,
      title: 'Steuerkonform',
      description: 'Alle Aufzeichnungen entsprechen den deutschen Steuervorschriften und sind finanzamtstauglich.',
    },
    {
      icon: TrendingUp,
      title: 'Automatische Auswertungen',
      description: 'Erhalten Sie detaillierte Statistiken und Berichte für Ihre Steuererklärung.',
    },
    {
      icon: Users,
      title: 'Mehrere Fahrzeuge',
      description: 'Verwalten Sie beliebig viele Fahrzeuge in einem System.',
    },
  ];

  const benefits = [
    'Zeitersparnis bei der Fahrtenbuchführung',
    'Automatische Kilometerberechnung',
    'Export für Steuerberater',
    'Sichere Cloud-Speicherung',
    'Mobile Nutzung unterwegs',
    'Erinnerungsfunktionen',
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Fahrtenbuch</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Anmelden
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Kostenlos starten
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Digitales Fahrtenbuch für Unternehmer
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Erfassen Sie Ihre Geschäftsfahrten einfach, schnell und steuerkonform
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold inline-flex items-center"
            >
              Jetzt kostenlos starten
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Warum unser Fahrtenbuch?
            </h2>
            <p className="text-xl text-gray-600">
              Sparen Sie Zeit und Nerven bei der Fahrtenbuchführung
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Ihre Vorteile auf einen Blick
              </h2>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <div className="text-center">
                <Car className="h-24 w-24 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Bereit loszulegen?
                </h3>
                <p className="text-gray-600 mb-6">
                  Starten Sie noch heute mit Ihrem digitalen Fahrtenbuch
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Kostenlos registrieren
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Car className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold">Fahrtenbuch</span>
            </div>
            <p className="text-gray-400">
              Das digitale Fahrtenbuch für moderne Unternehmer
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
