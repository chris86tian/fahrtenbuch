import React from 'react';
import { Trip, Vehicle } from '../types';
import { formatDistance } from '../utils/helpers';

interface TaxReportCardProps {
  trips: Trip[];
  vehicles: Vehicle[];
  year: number;
}

const TaxReportCard: React.FC<TaxReportCardProps> = ({ trips, vehicles, year }) => {
  // Filter trips for the specified year
  const yearTrips = trips.filter(trip => {
    const tripYear = new Date(trip.date).getFullYear();
    return tripYear === year;
  });

  if (yearTrips.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Finanzamtbericht {year}</h2>
        <p className="text-gray-500">Keine Fahrten für das Jahr {year} vorhanden.</p>
      </div>
    );
  }

  // Group by vehicle and purpose
  const vehicleData: Record<string, {
    vehicle: Vehicle;
    initialOdometer: number;
    finalOdometer: number;
    business: number;
    private: number;
    commute: number;
    total: number;
  }> = {};

  // First pass: collect all data by vehicle
  yearTrips.forEach(trip => {
    const vehicle = vehicles.find(v => v.id === trip.vehicleId);
    if (!vehicle) return;
    
    const vehicleKey = vehicle.id;
    
    if (!vehicleData[vehicleKey]) {
      vehicleData[vehicleKey] = {
        vehicle,
        initialOdometer: trip.startOdometer,
        finalOdometer: trip.endOdometer,
        business: 0,
        private: 0,
        commute: 0,
        total: 0
      };
    }
    
    // Update odometer readings (find min/max for the year)
    vehicleData[vehicleKey].initialOdometer = Math.min(
      vehicleData[vehicleKey].initialOdometer, 
      trip.startOdometer
    );
    vehicleData[vehicleKey].finalOdometer = Math.max(
      vehicleData[vehicleKey].finalOdometer, 
      trip.endOdometer
    );
    
    // Add distances by purpose
    const distance = trip.endOdometer - trip.startOdometer;
    vehicleData[vehicleKey][trip.purpose] += distance;
    vehicleData[vehicleKey].total += distance;
  });

  // Calculate totals across all vehicles
  const totals = Object.values(vehicleData).reduce(
    (acc, data) => {
      acc.business += data.business;
      acc.private += data.private;
      acc.commute += data.commute;
      acc.total += data.total;
      return acc;
    },
    { business: 0, private: 0, commute: 0, total: 0 }
  );

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-5">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Finanzamtbericht {year}</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fahrzeug
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KM Anfang/Ende
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Geschäftlich
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Privat
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Arbeitsweg
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gesamt
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Geschäftl. %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.values(vehicleData).map((data) => {
                const businessPercentage = data.total > 0 
                  ? (data.business / data.total) * 100 
                  : 0;
                
                return (
                  <tr key={data.vehicle.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">{data.vehicle.licensePlate}</div>
                      <div className="text-xs text-gray-500">
                        {data.vehicle.make} {data.vehicle.model}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{formatDistance(data.initialOdometer)}</div>
                      <div>{formatDistance(data.finalOdometer)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDistance(data.business)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDistance(data.private)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDistance(data.commute)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDistance(data.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {businessPercentage.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Gesamt
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatDistance(totals.business)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatDistance(totals.private)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatDistance(totals.commute)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatDistance(totals.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {totals.total > 0 ? ((totals.business / totals.total) * 100).toFixed(2) : "0.00"}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-1">Hinweis für die Steuererklärung</h3>
          <p className="text-sm text-blue-700">
            Für die Steuererklärung ist der geschäftliche Anteil in Prozent relevant. 
            Dieser Wert kann für die Berechnung der absetzbaren Fahrzeugkosten verwendet werden.
            Bewahren Sie diesen Bericht zusammen mit den detaillierten Fahrtenbucheinträgen als Nachweis für das Finanzamt auf.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaxReportCard;
