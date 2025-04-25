import React from 'react';
import { useNavigate } from 'react-router-dom';
import TripForm from '../components/TripForm';
import { useAppContext } from '../context/AppContext';
import { Trip } from '../types';

const RecordTrip: React.FC = () => {
  const { addTrip, activeVehicle } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (tripData: Omit<Trip, 'id' | 'user_id'>) => {
    await addTrip(tripData);
    // Redirect back to dashboard after successful submission
    navigate('/app/dashboard');
  };

  const handleCancel = () => {
    // Redirect back to dashboard on cancel
    navigate('/app/dashboard');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Neue Fahrt erfassen</h2>
        <TripForm
          vehicleId={activeVehicle?.id} // Pass active vehicle ID if available
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default RecordTrip;
