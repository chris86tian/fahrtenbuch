import * as XLSX from 'xlsx';
import { Trip, Vehicle } from '../types';

export const exportToExcel = async (trips: Trip[], vehicles: Vehicle[]) => {
  // Create a map for quick vehicle lookup
  const vehicleMap = new Map(vehicles.map(v => [v.id, v]));

  // Prepare data for export
  const exportData = trips.map(trip => {
    const vehicle = vehicleMap.get(trip.vehicleId);
    const distance = trip.endOdometer - trip.startOdometer;
    
    return {
      'Datum': new Date(trip.date).toLocaleDateString('de-DE'),
      'Startzeit': trip.startTime,
      'Endzeit': trip.endTime,
      'Von': trip.startLocation,
      'Nach': trip.endLocation,
      'Zweck': trip.purpose === 'business' ? 'Geschäftlich' : 
               trip.purpose === 'private' ? 'Privat' : 'Pendeln',
      'Fahrzeug': vehicle ? `${vehicle.licensePlate} (${vehicle.make} ${vehicle.model})` : 'Unbekannt',
      'KM Start': trip.startOdometer,
      'KM Ende': trip.endOdometer,
      'Distanz': distance,
      'Fahrer': trip.driverName,
      'Notizen': trip.notes || '',
      'Status': trip.status === 'complete' ? 'Vollständig' : 'Unvollständig'
    };
  });

  // Sort by date (newest first)
  exportData.sort((a, b) => new Date(b.Datum).getTime() - new Date(a.Datum).getTime());

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  const colWidths = [
    { wch: 12 }, // Datum
    { wch: 10 }, // Startzeit
    { wch: 10 }, // Endzeit
    { wch: 20 }, // Von
    { wch: 20 }, // Nach
    { wch: 12 }, // Zweck
    { wch: 25 }, // Fahrzeug
    { wch: 10 }, // KM Start
    { wch: 10 }, // KM Ende
    { wch: 10 }, // Distanz
    { wch: 15 }, // Fahrer
    { wch: 30 }, // Notizen
    { wch: 12 }  // Status
  ];
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Fahrten');

  // Create summary sheet
  const businessTrips = trips.filter(t => t.purpose === 'business');
  const privateTrips = trips.filter(t => t.purpose === 'private');
  const commuteTrips = trips.filter(t => t.purpose === 'commute');

  const businessDistance = businessTrips.reduce((sum, trip) => sum + (trip.endOdometer - trip.startOdometer), 0);
  const privateDistance = privateTrips.reduce((sum, trip) => sum + (trip.endOdometer - trip.startOdometer), 0);
  const commuteDistance = commuteTrips.reduce((sum, trip) => sum + (trip.endOdometer - trip.startOdometer), 0);

  const summaryData = [
    { 'Kategorie': 'Geschäftliche Fahrten', 'Anzahl': businessTrips.length, 'Kilometer': businessDistance },
    { 'Kategorie': 'Private Fahrten', 'Anzahl': privateTrips.length, 'Kilometer': privateDistance },
    { 'Kategorie': 'Pendelfahrten', 'Anzahl': commuteTrips.length, 'Kilometer': commuteDistance },
    { 'Kategorie': 'Gesamt', 'Anzahl': trips.length, 'Kilometer': businessDistance + privateDistance + commuteDistance }
  ];

  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  summaryWs['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Zusammenfassung');

  // Generate filename with current date
  const now = new Date();
  const filename = `Fahrtenbuch_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.xlsx`;

  // Save file
  XLSX.writeFile(wb, filename);
};
