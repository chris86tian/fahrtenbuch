import React from 'react';
import { Trip, DashboardStats } from '../types';
import { formatDistance } from '../utils/helpers';

interface YearlyStatsCardProps {
  trips: Trip[]; // Pass only the trips for the selected year
  year: number;
}

const calculateStats = (trips: Trip[]): DashboardStats => {
  const stats: DashboardStats = {
    totalTrips: trips.length,
    businessTrips: 0,
    privateTrips: 0,
    commuteTrips: 0,
    totalDistance: 0,
    businessDistance: 0,
    privateDistance: 0,
    commuteDistance: 0,
  };

  trips.forEach(trip => {
    const distance = trip.endOdometer - trip.startOdometer;
    stats.totalDistance += distance;

    switch (trip.purpose) {
      case 'business':
        stats.businessTrips++;
        stats.businessDistance += distance;
        break;
      case 'private':
        stats.privateTrips++;
        stats.privateDistance += distance;
        break;
      case 'commute':
        stats.commuteTrips++;
        stats.commuteDistance += distance;
        break;
    }
  });

  return stats;
};


const YearlyStatsCard: React.FC<YearlyStatsCardProps> = ({ trips, year }) => {
  const stats = calculateStats(trips);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-5">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Fahrtenstatistik {year}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700 font-medium">Gesamtstrecke</p>
            <p className="text-2xl font-bold text-blue-900">{formatDistance(stats.totalDistance)}</p>
            <p className="text-sm text-blue-700">{stats.totalTrips} Fahrten</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-700 font-medium">Geschäftlich</p>
            <p className="text-2xl font-bold text-green-900">{formatDistance(stats.businessDistance)}</p>
            <p className="text-sm text-green-700">{stats.businessTrips} Fahrten</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-700 font-medium">Privat</p>
            <p className="text-2xl font-bold text-yellow-900">{formatDistance(stats.privateDistance)}</p>
            <p className="text-sm text-yellow-700">{stats.privateTrips} Fahrten</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-700 font-medium">Arbeitsweg</p>
            <p className="text-2xl font-bold text-purple-900">{formatDistance(stats.commuteDistance)}</p>
            <p className="text-sm text-purple-700">{stats.commuteTrips} Fahrten</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">Geschäftlich</div>
              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-green-500 rounded-full"
                  style={{
                    width: `${stats.totalDistance ? (stats.businessDistance / stats.totalDistance) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="ml-2 text-sm text-gray-700 font-medium">
              {stats.totalDistance ? Math.round((stats.businessDistance / stats.totalDistance) * 100) : 0}%
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">Privat</div>
              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-yellow-500 rounded-full"
                  style={{
                    width: `${stats.totalDistance ? (stats.privateDistance / stats.totalDistance) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="ml-2 text-sm text-gray-700 font-medium">
              {stats.totalDistance ? Math.round((stats.privateDistance / stats.totalDistance) * 100) : 0}%
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">Arbeitsweg</div>
              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-purple-500 rounded-full"
                  style={{
                    width: `${stats.totalDistance ? (stats.commuteDistance / stats.totalDistance) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="ml-2 text-sm text-gray-700 font-medium">
              {stats.totalDistance ? Math.round((stats.commuteDistance / stats.totalDistance) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearlyStatsCard;
