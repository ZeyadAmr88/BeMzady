import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

const CAIRO_TIMEZONE = 'Africa/Cairo';

/**
 * Converts a UTC date string to Cairo timezone
 * @param {string|Date} date - The date to convert
 * @returns {Date} Date object in Cairo timezone
 */
export const toCairoTime = (date) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return utcToZonedTime(dateObj, CAIRO_TIMEZONE);
};

/**
 * Formats a date in Cairo timezone with the specified format
 * @param {string|Date} date - The date to format
 * @param {string} formatStr - The format string (default: 'yyyy-MM-dd HH:mm')
 * @returns {string} Formatted date string
 */
export const formatCairoDate = (date, formatStr = 'yyyy-MM-dd HH:mm') => {
    const cairoDate = toCairoTime(date);
    return format(cairoDate, formatStr);
};

/**
 * Formats a date in Cairo timezone with relative time (e.g., "2 hours ago")
 * @param {string|Date} date - The date to format
 * @returns {string} Relative time string
 */
export const formatCairoRelativeTime = (date) => {
    const cairoDate = toCairoTime(date);
    return formatDistanceToNow(cairoDate, { addSuffix: true });
};

/**
 * Converts a Cairo timezone date to UTC for API calls
 * @param {string|Date} date - The date to convert
 * @returns {Date} UTC date object
 */
export const cairoToUTC = (date) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return zonedTimeToUtc(dateObj, CAIRO_TIMEZONE);
};

/**
 * Formats a date in Cairo timezone with full date and time
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string (e.g., "January 1, 2024 12:00 PM")
 */
export const formatCairoFullDateTime = (date) => {
    return formatCairoDate(date, 'MMMM d, yyyy h:mm a');
};

/**
 * Formats a date in Cairo timezone with date only
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string (e.g., "January 1, 2024")
 */
export const formatCairoDateOnly = (date) => {
    return formatCairoDate(date, 'MMMM d, yyyy');
}; 