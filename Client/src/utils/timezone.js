// Timezone utility functions for handling IST (Asia/Kolkata) timezone on client

/**
 * Convert UTC date to IST for display
 * @param {string|Date} utcDate - UTC date string or Date object
 * @returns {Object} - Object with formatted date and time strings
 */
export const formatDateTimeIST = (utcDate) => {
  const date = new Date(utcDate);
  
  const dateStr = date.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const timeStr = date.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return { dateStr, timeStr };
};

/**
 * Convert local datetime-local input to UTC ISO string for server
 * @param {string} localDateTime - datetime-local input value
 * @returns {string} - UTC ISO string
 */
export const localDateTimeToUTC = (localDateTime) => {
  // When user selects a datetime-local, it's in their local timezone
  // We need to treat it as IST and convert to UTC for server
  const localDate = new Date(localDateTime);
  
  // Create a date in IST timezone
  const istOffset = 5.5 * 60; // IST is UTC+5:30
  const localOffset = localDate.getTimezoneOffset(); // Local timezone offset in minutes
  const utcDate = new Date(localDate.getTime() + (localOffset * 60000) + (istOffset * 60000));
  
  return utcDate.toISOString();
};

/**
 * Convert UTC date to local datetime-local format for input
 * @param {string|Date} utcDate - UTC date
 * @returns {string} - Local datetime string for input
 */
export const utcToLocalDateTime = (utcDate) => {
  const date = new Date(utcDate);
  
  // Convert UTC to IST for display in datetime-local input
  const istDate = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  
  // Format for datetime-local input (YYYY-MM-DDTHH:mm)
  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  const hours = String(istDate.getHours()).padStart(2, '0');
  const minutes = String(istDate.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Get current date in IST timezone as YYYY-MM-DD format
 * @returns {string} - Date string in IST
 */
export const getCurrentDateIST = () => {
  const now = new Date();
  return now.toLocaleDateString('en-CA', {
    timeZone: 'Asia/Kolkata',
  });
};

/**
 * Get current datetime in IST timezone for datetime-local input
 * @returns {string} - Current datetime in IST as YYYY-MM-DDTHH:mm
 */
export const getCurrentDateTimeIST = () => {
  const now = new Date();
  const istDate = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  
  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  const hours = String(istDate.getHours()).padStart(2, '0');
  const minutes = String(istDate.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Compare dates in IST timezone
 * @param {string|Date} date1 
 * @param {string|Date} date2 
 * @returns {number} - -1, 0, or 1 for comparison
 */
export const compareDatesIST = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  // Convert to IST for comparison
  const d1IST = new Date(d1.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  const d2IST = new Date(d2.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  
  if (d1IST < d2IST) return -1;
  if (d1IST > d2IST) return 1;
  return 0;
};

/**
 * Check if a date is today in IST timezone
 * @param {string|Date} date 
 * @returns {boolean}
 */
export const isToday = (date) => {
  const inputDate = new Date(date);
  const today = getCurrentDateIST();
  const inputDateIST = inputDate.toLocaleDateString('en-CA', {
    timeZone: 'Asia/Kolkata',
  });
  
  return inputDateIST === today;
};

/**
 * Get timezone debugging information
 * @returns {Object} - Timezone info for debugging
 */
export const getTimezoneDebugInfo = () => {
  const now = new Date();
  return {
    local: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      time: now.toString(),
      iso: now.toISOString(),
      offset: now.getTimezoneOffset()
    },
    ist: {
      time: now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}),
      date: getCurrentDateIST(),
      datetime: getCurrentDateTimeIST()
    },
    utc: {
      time: now.toISOString(),
      timestamp: now.getTime()
    }
  };
};
