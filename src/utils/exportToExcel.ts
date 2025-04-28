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
    'Gefahrene Kilometer', // This column is calculated, not used for import
    'Fahrer',
    'Fahrzeugkennzeichen', // This column is informational, not used for import
    'Fahrzeug', // This column is informational, not used for import
    'Notizen',
    'Status' // Added status column for export
  ].join(',');

  // Map purpose values to German
  const purposeMap: Record<string, string> = {
    'business': 'Geschäftlich',
    'private': 'Privat',
    'commute': 'Arbeitsweg'
  };

  // Map status values to German (or keep English)
   const statusMap: Record<string, string> = {
      'complete': 'Vollständig',
      'partial': 'Unvollständig'
   };


  // Convert each trip to CSV row
  const rows = trips.map(trip => {
    const vehicle = vehicles.find(v => v.id === trip.vehicleId);
    const vehicleInfo = vehicle ? `${vehicle.make} ${vehicle.model}` : '';

    const formattedPurpose = purposeMap[trip.purpose] || trip.purpose;
    // Calculate distance only for complete trips for export consistency
    const distance = trip.status === 'complete' ? calculateDistance(trip.startOdometer, trip.endOdometer) : 0;
    const formattedStatus = statusMap[trip.status] || trip.status;

    return [
      formatDate(trip.date),
      trip.startTime,
      trip.status === 'complete' ? trip.endTime : '', // Export empty if partial
      escapeCsvValue(trip.startLocation),
      trip.status === 'complete' ? escapeCsvValue(trip.endLocation) : '', // Export empty if partial
      formattedPurpose,
      trip.startOdometer,
      trip.status === 'complete' ? trip.endOdometer : '', // Export empty if partial
      distance, // Calculated distance
      escapeCsvValue(trip.driverName),
      escapeCsvValue(vehicle?.licensePlate || ''),
      escapeCsvValue(vehicleInfo),
      escapeCsvValue(trip.notes || ''),
      formattedStatus // Export status
    ].join(',');
  });

  // Combine headers and rows
  return `${headers}\n${rows.join('\n')}`;
};

// Function to create monthly summary CSV (only includes complete trips)
export const createMonthlySummary = (trips: Trip[], vehicles: Vehicle[]): string => {
  // Filter for complete trips
  const completeTrips = trips.filter(trip => trip.status === 'complete');

  if (completeTrips.length === 0) return '';

  // Group trips by month and purpose
  const monthlyData: Record<string, Record<string, number>> = {};

  completeTrips.forEach(trip => { // Use completeTrips here
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

// Function to create yearly summary CSV (only includes complete trips)
export const createYearlySummary = (trips: Trip[], vehicles: Vehicle[]): string => {
  // Filter for complete trips
  const completeTrips = trips.filter(trip => trip.status === 'complete');

  if (completeTrips.length === 0) return '';

  // Group trips by year and purpose
  const yearlyData: Record<string, Record<string, number>> = {};

  completeTrips.forEach(trip => { // Use completeTrips here
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

// Function to create tax authority report by year (only includes complete trips)
export const createTaxAuthorityReport = (trips: Trip[], vehicles: Vehicle[], year: number): string => {
  // Filter trips for the specified year AND status === 'complete'
  const yearCompleteTrips = trips.filter(trip => {
    const tripYear = new Date(trip.date).getFullYear();
    return tripYear === year && trip.status === 'complete';
  });

  if (yearCompleteTrips.length === 0) return '';

  // Group by vehicle and purpose
  const vehicleData: Record<string, {
    licensePlate: string;
    vehicleInfo: string;
    initialOdometer: number;
    finalOdometer: number;
    business: number;
    private: number;
    commute: number;
    total: number;
    businessPercentage: number;
  }> = {};

  // First pass: collect all data by vehicle
  yearCompleteTrips.forEach(trip => { // Use yearCompleteTrips here
    const vehicle = vehicles.find(v => v.id === trip.vehicleId);
    if (!vehicle) return;

    const vehicleKey = vehicle.id;
    const vehicleInfo = `${vehicle.make} ${vehicle.model} (${vehicle.year})`;

    if (!vehicleData[vehicleKey]) {
      vehicleData[vehicleKey] = {
        licensePlate: vehicle.licensePlate,
        vehicleInfo: vehicleInfo,
        initialOdometer: trip.startOdometer, // Initialize with first trip's start
        finalOdometer: trip.endOdometer, // Initialize with first trip's end
        business: 0,
        private: 0,
        commute: 0,
        total: 0,
        businessPercentage: 0
      };
    }

    // Update odometer readings (find min/max for the year among complete trips)
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

  // Second pass: calculate percentages
  Object.keys(vehicleData).forEach(vehicleKey => {
    const data = vehicleData[vehicleKey];
    data.businessPercentage = data.total > 0
      ? (data.business / data.total) * 100
      : 0;
  });

  // Create CSV headers
  const headers = [
    'Fahrzeugkennzeichen',
    'Fahrzeug',
    'Kilometerstand Jahresanfang',
    'Kilometerstand Jahresende',
    'Gesamtkilometer',
    'Geschäftliche Kilometer',
    'Private Kilometer',
    'Arbeitsweg Kilometer',
    'Geschäftlicher Anteil (%)'
  ].join(',');

  // Create CSV rows
  const rows = Object.values(vehicleData).map(data => {
    return [
      escapeCsvValue(data.licensePlate),
      escapeCsvValue(data.vehicleInfo),
      data.initialOdometer,
      data.finalOdometer,
      data.total.toFixed(1),
      data.business.toFixed(1),
      data.private.toFixed(1),
      data.commute.toFixed(1),
      data.businessPercentage.toFixed(2)
    ].join(',');
  });

  // Add a summary row for all vehicles combined
  const totalData = Object.values(vehicleData).reduce(
    (acc, data) => {
      acc.total += data.total;
      acc.business += data.business;
      acc.private += data.private;
      acc.commute += data.commute;
      return acc;
    },
    { total: 0, business: 0, private: 0, commute: 0 }
  );

  const businessPercentage = totalData.total > 0
    ? (totalData.business / totalData.total) * 100
    : 0;

  const summaryRow = [
    'GESAMT',
    `Steuerjahr ${year}`,
    '',
    '',
    totalData.total.toFixed(1),
    totalData.business.toFixed(1),
    totalData.private.toFixed(1),
    totalData.commute.toFixed(1),
    businessPercentage.toFixed(2)
  ].join(',');

  // Add title and metadata
  const title = `Fahrtenbuch-Auswertung für das Finanzamt - Steuerjahr ${year}`;
  const metadata = [
    `Erstellt am: ${new Date().toLocaleDateString('de-DE')}`,
    'Gemäß den Anforderungen des deutschen Steuerrechts'
  ].join(',');

  return `${title}\n${metadata}\n\n${headers}\n${rows.join('\n')}\n${summaryRow}`;
};

// Helper to escape CSV values
const escapeCsvValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return '';

  const stringValue = String(value);
  // If value contains comma, quote, or newline, wrap in quotes and escape existing quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};
