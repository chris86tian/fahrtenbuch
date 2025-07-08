import * as XLSX from 'xlsx';

interface ConvertedTrip {
  vehicleId: string;
  date: string;
  startTime: string;
  endTime: string;
  startLocation: string;
  endLocation: string;
  purpose: 'business' | 'private' | 'commute';
  startOdometer: number;
  endOdometer: number;
  driverName: string;
  notes?: string;
  status: 'complete' | 'partial';
}

export const importTripsFromExcel = async (file: File): Promise<ConvertedTrip[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Convert to our trip format
        const convertedTrips: ConvertedTrip[] = jsonData.map((row: any) => {
          // Map common column names (flexible mapping)
          const getColumnValue = (possibleNames: string[]) => {
            for (const name of possibleNames) {
              if (row[name] !== undefined) return row[name];
            }
            return '';
          };

          const date = getColumnValue(['Datum', 'Date', 'datum']);
          const startTime = getColumnValue(['Startzeit', 'Start Time', 'startzeit', 'Start']);
          const endTime = getColumnValue(['Endzeit', 'End Time', 'endzeit', 'Ende']);
          const startLocation = getColumnValue(['Von', 'From', 'Start Location', 'von', 'startort']);
          const endLocation = getColumnValue(['Nach', 'To', 'End Location', 'nach', 'zielort']);
          const purpose = getColumnValue(['Zweck', 'Purpose', 'zweck', 'Grund']);
          const startOdometer = getColumnValue(['KM Start', 'Start KM', 'Start Odometer', 'km_start']);
          const endOdometer = getColumnValue(['KM Ende', 'End KM', 'End Odometer', 'km_ende']);
          const driverName = getColumnValue(['Fahrer', 'Driver', 'fahrer', 'Fahrzeugführer']);
          const notes = getColumnValue(['Notizen', 'Notes', 'notizen', 'Bemerkungen']);

          // Convert purpose to our format
          let convertedPurpose: 'business' | 'private' | 'commute' = 'business';
          if (typeof purpose === 'string') {
            const lowerPurpose = purpose.toLowerCase();
            if (lowerPurpose.includes('privat') || lowerPurpose.includes('private')) {
              convertedPurpose = 'private';
            } else if (lowerPurpose.includes('pendel') || lowerPurpose.includes('commute')) {
              convertedPurpose = 'commute';
            }
          }

          // Convert date format
          let convertedDate = '';
          if (date) {
            try {
              // Handle Excel date serial numbers
              if (typeof date === 'number') {
                const excelDate = new Date((date - 25569) * 86400 * 1000);
                convertedDate = excelDate.toISOString().split('T')[0];
              } else {
                // Handle string dates
                const parsedDate = new Date(date);
                convertedDate = parsedDate.toISOString().split('T')[0];
              }
            } catch {
              convertedDate = new Date().toISOString().split('T')[0];
            }
          }

          return {
            vehicleId: '', // Will need to be set by the user
            date: convertedDate,
            startTime: startTime?.toString() || '',
            endTime: endTime?.toString() || '',
            startLocation: startLocation?.toString() || '',
            endLocation: endLocation?.toString() || '',
            purpose: convertedPurpose,
            startOdometer: parseInt(startOdometer?.toString()) || 0,
            endOdometer: parseInt(endOdometer?.toString()) || 0,
            driverName: driverName?.toString() || '',
            notes: notes?.toString() || '',
            status: 'complete' as const,
          };
        });

        resolve(convertedTrips);
      } catch (error) {
        reject(new Error('Fehler beim Lesen der Excel-Datei: ' + (error as Error).message));
      }
    };

    reader.onerror = () => {
      reject(new Error('Fehler beim Lesen der Datei'));
    };

    reader.readAsArrayBuffer(file);
  });
};
