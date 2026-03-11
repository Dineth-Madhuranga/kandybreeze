import { useState, useEffect } from 'react';
import { getSriLankaDate, getNextSaturday, formatDate } from '../utils/dateUtils';

export function useBookingWindow() {
  const [nextSaturday, setNextSaturday] = useState(null);
  const [formattedNextSaturday, setFormattedNextSaturday] = useState('');

  useEffect(() => {
    const checkBookingWindow = () => {
      const sriLankaDate = getSriLankaDate();
      const nextSat = getNextSaturday(sriLankaDate);
      setNextSaturday(nextSat);
      setFormattedNextSaturday(formatDate(nextSat));
    };

    checkBookingWindow();

    const interval = setInterval(checkBookingWindow, 60000);

    return () => clearInterval(interval);
  }, []);

  return {
    nextSaturday,
    formattedNextSaturday
  };
}

export default useBookingWindow;
