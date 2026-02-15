/**
 * Converts a JavaScript Date to a start-of-day timestamp in nanoseconds (backend Time format)
 */
export function dateToStartOfDayTime(date: Date): bigint {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return BigInt(startOfDay.getTime()) * BigInt(1_000_000);
}

/**
 * Converts a backend Time (nanoseconds) to a JavaScript Date
 */
export function timeToDate(time: bigint): Date {
  return new Date(Number(time / BigInt(1_000_000)));
}

/**
 * Checks if two Time values represent the same day
 */
export function isSameDay(time1: bigint, time2: bigint): boolean {
  const date1 = timeToDate(time1);
  const date2 = timeToDate(time2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
