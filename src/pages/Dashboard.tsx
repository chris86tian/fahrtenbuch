import React, { useMemo, useState, useEffect } from 'react';
import { DashboardStats } from '../types';
import { useAppContext } from '../context/AppContext';
import { Car, MapPin, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import VehicleSelector from '../components/VehicleSelector';
import FahrtenbuchCheckSection from '../components/FahrtenbuchCheckSection';
import ReminderModal from '../components/ReminderModal';

const Dashboard: React.FC = () => {
  const { vehicles, trips, activeVehicle, setActiveVehicle, reminderSettings } = useAppContext();
  const [showReminder, setShowReminder] = useState(false);

  // Check if reminder should be shown
  useEffect(() => {
    if (reminderSettings.enabled) {
      const now = new Date();
      const currentDay = now.toLocaleLowerCase().substring(0, 3) as any; // 'mon', 'tue', etc.
      const currentTime = now.toTimeString().substring(0, 5); // 'HH:MM'
      
      // Simple check - in a real app, you'd want more sophisticated logic
      if (reminderSettings.day.substring(0, 3) === currentDay && 
          currentTime >= reminderSettings.time) {
        // Check if user has added trips recently (last 7 days)
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        
        const recentTrips = trips.filter(trip => 
          new Date(trip.date) >= lastWeek
        );
        
        if (recentTrips.length === 0) {
          setShowReminder(true);
        }
      }
    }
  }, [reminderSettings, trips]);

  const stats: DashboardStats = useMemo(() => {
    const filteredTrips = activeVehicle
      ? trips.filter(trip => trip.vehicleId === activeVehicle.id)
      : trips;

    const businessTrips = filteredTrips.filter(trip => trip.purpose === 'business');
    const privateTrips = filteredTrips.filter(trip => trip.purpose === 'private');
    const commuteTrips = filteredTrips.filter(trip => trip.purpose === 'commute');

    const calculateDistance = (trips: typeof filteredTrips) =>
      trips.reduce((total, trip) => total + (trip.endOdometer - trip.startOdometer), 0);

    return {
      totalTrips: filteredTrips.length,
      businessTrips: businessTrips.length,
      privateTrips: privateTrips.length,
      commuteTrips: commuteTrips.length,
      totalDistance: calculateDistance(filteredTrips),
      businessDistance: calculateDistance(businessTrips),
      privateDistance: calculateDistance(privateTrips),
      commuteDistance: calculateDistance(commuteTrips),
    };
  }, [trips, activeVehicle]);

  const recentTrips = useMemo(() => {
    const filteredTrips = activeVehicle
      ? trips.filter(trip => trip.vehicleId === activeVehicle.id)
      : trips;
    
    return filteredTrips
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [trips, activeVehicle]);

  const formatDistance = (distance: number) => {
    return `${distance.toLocaleString()} km`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const getPurposeLabel = (purpose: string) => {
    switch (purpose) {
      case 'business': return 'Geschäftlich';
      case 'private': return 'Privat';
      case 'commute': return 'Pendeln';
      default: return purpose;
    }
  };

  const getPurposeColor = (purpose: string) => {
    switch (purpose) {
      case 'business': return 'bg-blue-100 text-blue-800';
      case 'private': return 'bg-green-100 text-green-800';
      case 'commute': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Vehicle Selector */}
      <VehicleSelector
        vehicles={vehicles}
        activeVehicle={activeVehicle}
        onVehicleChange={setActiveVehicle}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Car className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Gesamte Fahrten
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalTrips}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPin className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Geschäftliche Fahrten
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.businessTrips}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Gesamte Kilometer
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatDistance(stats.totalDistance)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Geschäftliche Kilometer
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatDistance(stats.businessDistance)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fahrtenbuch Check Section */}
      <FahrtenbuchCheckSection
        totalTrips={stats.totalTrips}
        businessTrips={stats.businessTrips}
        privateTrips={stats.privateTrips}
        commuteTrips={stats.commuteTrips}
      />

      {/* Recent Trips */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Letzte Fahrten
          </h3>
          {recentTrips.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Fahrten</h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeVehicle 
                  ? `Keine Fahrten für ${activeVehicle.licensePlate} gefunden.`
                  : 'Noch keine Fahrten erfasst.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {recentTrips.map((trip) => {
                  const vehicle = vehicles.find(v => v.id === trip.vehicleId);
                  return (
                    <li key={trip.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {trip.startLocation} → {trip.endLocation}
                            </p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPurposeColor(trip.purpose)}`}>
                              {getPurposeLabel(trip.purpose)}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span>{formatDate(trip.date)}</span>
                            <span>{trip.startTime} - {trip.endTime}</span>
                            <span>{vehicle?.licensePlate}</span>
                            <span>{formatDistance(trip.endOdometer - trip.startOdometer)}</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={showReminder}
        onClose={() => setShowReminder(false)}
      />
    </div>
  );
};

export default Dashboard;
