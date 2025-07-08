import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface FahrtenbuchCheckSectionProps {
  totalTrips: number;
  businessTrips: number;
  privateTrips: number;
  commuteTrips: number;
}

const FahrtenbuchCheckSection: React.FC<FahrtenbuchCheckSectionProps> = ({
  totalTrips,
  businessTrips,
  privateTrips,
  commuteTrips
}) => {
  // Calculate compliance score based on trip distribution
  const getComplianceStatus = () => {
    if (totalTrips === 0) {
      return { status: 'warning', message: 'Keine Fahrten erfasst', icon: Clock };
    }
    
    if (businessTrips > 0) {
      return { status: 'good', message: 'Fahrtenbuch ordnungsgemäß geführt', icon: CheckCircle };
    }
    
    return { status: 'warning', message: 'Keine geschäftlichen Fahrten erfasst', icon: Clock };
  };

  const compliance = getComplianceStatus();
  const StatusIcon = compliance.icon;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Fahrtenbuch-Status</h3>
      
      <div className="flex items-center space-x-3 mb-4">
        <StatusIcon 
          size={24} 
          className={`${
            compliance.status === 'good' ? 'text-green-500' : 
            compliance.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
          }`} 
        />
        <span className={`font-medium ${
          compliance.status === 'good' ? 'text-green-700' : 
          compliance.status === 'warning' ? 'text-yellow-700' : 'text-red-700'
        }`}>
          {compliance.message}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Geschäftlich:</span>
          <span className="ml-2 font-medium">{businessTrips}</span>
        </div>
        <div>
          <span className="text-gray-500">Privat:</span>
          <span className="ml-2 font-medium">{privateTrips}</span>
        </div>
        <div>
          <span className="text-gray-500">Pendeln:</span>
          <span className="ml-2 font-medium">{commuteTrips}</span>
        </div>
        <div>
          <span className="text-gray-500">Gesamt:</span>
          <span className="ml-2 font-medium">{totalTrips}</span>
        </div>
      </div>
    </div>
  );
};

export default FahrtenbuchCheckSection;
