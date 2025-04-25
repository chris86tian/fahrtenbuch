import { Trip, Vehicle } from '../types';
import { formatDate, formatDistance, calculateDistance } from './helpers';

// Function to convert trips data to CSV format
export const tripsToCSV = (trips: Trip[], vehicles: Vehicle[]): string => {
  if (trips.length === 0) return '';

  // Define headers in German
  const headers = [
    'Datum',
    'Uhrzeit (von)',
    'Uhrzeit (bis)',
    'Startort',
    'Zielort',
    'Zweck',
    'Kilometerstand (Start)',
    'Kilometerstand (Ende)',
    'Gefahrene Kilometer',
    'Fahrer',
    'Fahrzeugkennzeichen',
    'Fahrzeug',
    'Notizen'
  ].join(',');

  // Map purpose values to German
  const purposeMap: Record<string, string> = {
    'business': 'Geschäftlich',
    'private': 'Privat',
    'commute': 'Arbeitsweg'
  };

  // Convert each trip to CSV row
  const rows = trips.map(trip => {
    const vehicle = vehicles.find(v => v.id === trip.vehicleId);
    const vehicleInfo = vehicle ? `${vehicle.make} ${vehicle.model}` : '';
    
    const formattedPurpose = purposeMap[trip.purpose] || trip.purpose;
    const distance = calculateDistance(trip.startOdometer, trip.endOdometer);
    
    return [
      formatDate(trip.date),
      trip.startTime,
      trip.endTime,
      escapeCsvValue(trip.startLocation),
      escapeCsvValue(trip.endLocation),
      formattedPurpose,
      trip.startOdometer,
      trip.endOdometer,
      distance,
      escapeCsvValue(trip.driverName),
      escapeCsvValue(vehicle?.licensePlate || ''),
      escapeCsvValue(vehicleInfo),
      escapeCsvValue(trip.notes || '')
    ].join(',');
  });

  // Combine headers and rows
  return `${headers}\n${rows.join('\n')}`;
};

// Function to create monthly summary CSV
export const createMonthlySummary = (trips: Trip[], vehicles: Vehicle[]): string => {
  if (trips.length === 0) return '';
  
  // Group trips by month and purpose
  const monthlyData: Record<string, Record<string, number>> = {};
  
  trips.forEach(trip => {
    const date = new Date(trip.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        'business': 0,
        'private': 0,
        'commute': 0,
        'total': 0
      };
    }
    
    const distance = trip.endOdometer - trip.startOdometer;
    monthlyData[monthKey][trip.purpose] += distance;
    monthlyData[monthKey]['total'] += distance;
  });
  
  // Define headers in German
  const headers = [
    'Monat',
    'Geschäftlich (km)',
    'Privat (km)',
    'Arbeitsweg (km)', 
    'Gesamt (km)'
  ].join(',');
  
  // Convert monthly data to CSV rows
  const rows = Object.entries(monthlyData).map(([month, data]) => {
    const [year, monthNum] = month.split('-');
    const monthName = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
      .toLocaleString('de-DE', { month: 'long', year: 'numeric' });
    
    return [
      monthName,
      data.business.toFixed(1),
      data.private.toFixed(1),
      data.commute.toFixed(1),
      data.total.toFixed(1)
    ].join(',');
  });
  
  return `${headers}\n${rows.join('\n')}`;
};

// Function to create yearly summary CSV
export const createYearlySummary = (trips: Trip[], vehicles: Vehicle[]): string => {
  if (trips.length === 0) return '';
  
  // Group trips by year and purpose
  const yearlyData: Record<string, Record<string, number>> = {};
  
  trips.forEach(trip => {
    const date = new Date(trip.date);
    const yearKey = `${date.getFullYear()}`;
    
    if (!yearlyData[yearKey]) {
      yearlyData[yearKey] = {
        'business': 0,
        'private': 0,
        'commute': 0,
        'total': 0
      };
    }
    
    const distance = trip.endOdometer - trip.startOdometer;
    yearlyData[yearKey][trip.purpose] += distance;
    yearlyData[yearKey]['total'] += distance;
  });
  
  // Define headers in German
  const headers = [
    'Jahr',
    'Geschäftlich (km)',
    'Privat (km)',
    'Arbeitsweg (km)', 
    'Gesamt (km)'
  ].join(',');
  
  // Convert yearly data to CSV rows
  const rows = Object.entries(yearlyData).map(([year, data]) => {
    return [
      year,
      data.business.toFixed(1),
      data.private.toFixed(1),
      data.commute.toFixed(1),
      data.total.toFixed(1)
    ].join(',');
  });
  
  return `${headers}\n${rows.join('\n')}`;
};

// Helper to escape CSV values
const escapeCsvValue = (value: string): string => {
  if (value === null || value === undefined) return '';
  
  const stringValue = String(value);
  // If value contains comma, quote, or newline, wrap in quotes and escape existing quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};