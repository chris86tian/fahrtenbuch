import React from 'react';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrip: () => void;
}

const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, onAddTrip }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl animate-fadeIn" 
        style={{ animation: 'fadeIn 0.3s ease-out' }}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Fahrtenbuch-Erinnerung</h2>
        <p className="text-gray-600 mb-6">
          Haben Sie alle Ihre Fahrten der letzten Woche im Fahrtenbuch erfasst? 
          Vergessen Sie nicht, Ihre geschäftlichen Fahrten zu dokumentieren, um steuerliche Vorteile zu nutzen.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition-colors"
          >
            Später erinnern
          </button>
          <button
            onClick={() => {
              onAddTrip();
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors"
          >
            Fahrt hinzufügen
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ReminderModal;
