import React from 'react';
import { Car, Shield, Clock, FileSpreadsheet, ChevronRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-white text-2xl font-bold">Flottlog</div>
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
            >
              Anmelden
            </button>
          </div>
        </nav>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Digitales Fahrtenbuch für Ihre Flotte
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Erfassen Sie Ihre Fahrten einfach und rechtskonform. 
              Sparen Sie Zeit und Geld mit unserem digitalen Fahrtenbuch.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-medium text-lg hover:bg-blue-50 transition-colors inline-flex items-center"
            >
              Jetzt kostenlos testen
              <ChevronRight className="ml-2" />
            </button>
          </div>
        </div>
      </header>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Ihre Vorteile mit Flottlog
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="text-blue-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Rechtssicher & Finanzamtkonform
              </h3>
              <p className="text-gray-600">
                Entspricht allen Anforderungen des Finanzamts für die steuerliche Anerkennung.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="text-blue-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Zeitsparend & Effizient
              </h3>
              <p className="text-gray-600">
                Schnelle Erfassung von Fahrten mit automatischer Berechnung und Erinnerungsfunktion.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FileSpreadsheet className="text-blue-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Flexible Auswertungen
              </h3>
              <p className="text-gray-600">
                Exportieren Sie Ihre Daten im Excel-Format für monatliche und jährliche Auswertungen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Alles was Sie brauchen
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle className="text-green-500 w-6 h-6 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Mehrere Fahrzeuge verwalten</h3>
                  <p className="text-gray-600">Verwalten Sie beliebig viele Fahrzeuge in einem Account.</p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="text-green-500 w-6 h-6 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Automatische Berechnungen</h3>
                  <p className="text-gray-600">Kilometerstand und Fahrtkosten werden automatisch berechnet.</p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="text-green-500 w-6 h-6 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Erinnerungsfunktion</h3>
                  <p className="text-gray-600">Wöchentliche Erinnerungen zum Nachtragen von Fahrten.</p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="text-green-500 w-6 h-6 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Excel-Export</h3>
                  <p className="text-gray-600">Exportieren Sie Ihre Daten im Excel-Format für die Buchhaltung.</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-8">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <Car className="text-blue-600 w-6 h-6 mr-2" />
                  <h3 className="font-semibold text-gray-900">Beispielfahrt</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Datum:</span>
                    <span className="font-medium">01.03.2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start:</span>
                    <span className="font-medium">München, Hauptbahnhof</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ziel:</span>
                    <span className="font-medium">Stuttgart, Messe</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zweck:</span>
                    <span className="font-medium">Geschäftlich</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kilometer:</span>
                    <span className="font-medium">237 km</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Starten Sie noch heute mit Flottlog
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            14 Tage kostenlos testen. Keine Kreditkarte erforderlich.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-medium text-lg hover:bg-blue-50 transition-colors inline-flex items-center"
          >
            Kostenlos registrieren
            <ChevronRight className="ml-2" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Flottlog</h3>
              <p className="text-sm">
                Ihr digitales Fahrtenbuch für eine effiziente und rechtskonforme Fahrzeugverwaltung.
              </p>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Kontakt</h3>
              <p className="text-sm">
                E-Mail: info@flottlog.de<br />
                Tel: +49 (0) 123 456789
              </p>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Rechtliches</h3>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white">Impressum</a></li>
                <li><a href="#" className="hover:text-white">Datenschutz</a></li>
                <li><a href="#" className="hover:text-white">AGB</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-center">
            © {new Date().getFullYear()} Flottlog. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;