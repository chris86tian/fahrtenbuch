export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const formatDistance = (distance: number): string => {
  return `${distance.toLocaleString('de-DE')} km`;
};

export const calculateDistance = (start: number, end: number): number => {
  return end - start;
};

export const formatExcelDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
};

export const formatExcelDateTime = (dateString: string, timeString: string): string => {
  const [hours, minutes] = timeString.split(':');
  const date = new Date(dateString);
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
  
  return date.toISOString();
};

export const groupTripsByMonth = (trips: any[]) => {
  return trips.reduce((acc, trip) => {
    const date = new Date(trip.date);
    const month = date.getMonth();
    const year = date.getFullYear();
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;
    
    if (!acc[key]) {
      acc[key] = [];
    }
    
    acc[key].push(trip);
    return acc;
  }, {});
};

export const groupTripsByYear = (trips: any[]) => {
  return trips.reduce((acc, trip) => {
    const date = new Date(trip.date);
    const year = date.getFullYear();
    
    if (!acc[year]) {
      acc[year] = [];
    }
    
    acc[year].push(trip);
    return acc;
  }, {});
};

export const checkForReminder = (
  lastReminderShown: string | null,
  reminderDay: string,
  reminderTime: string
): boolean => {
  const now = new Date();
  const day = now.getDay();
  
  // Map day names to day index (0 = Sunday, 1 = Monday, etc.)
  const dayMap: Record<string, number> = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6,
  };
  
  // If day doesn't match, no reminder
  if (day !== dayMap[reminderDay]) {
    return false;
  }
  
  // Parse reminder time
  const [hours, minutes] = reminderTime.split(':').map(Number);
  const reminderDate = new Date();
  reminderDate.setHours(hours, minutes, 0, 0);
  
  // If current time is before reminder time, no reminder
  if (now.getTime() < reminderDate.getTime()) {
    return false;
  }
  
  // If we've already shown a reminder today, no reminder
  if (lastReminderShown) {
    const lastReminder = new Date(lastReminderShown);
    if (
      lastReminder.getDate() === now.getDate() &&
      lastReminder.getMonth() === now.getMonth() &&
      lastReminder.getFullYear() === now.getFullYear()
    ) {
      return false;
    }
  }
  
  // If we've reached here, show a reminder
  return true;
};

export const downloadExcel = (data: string, filename: string): void => {
  const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};