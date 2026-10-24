/**
 * @fileoverview Duration helpers - Parse JWT-style expiry strings into seconds/ms
 * @module utils/duration
 */

/**
 * Convert a JWT-style expiry string (e.g. '7d', '24h', '15m') to seconds
 */
export function parseExpiryToSeconds(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)(s|m|h|d|w)$/);
  if (!match) return 3600;
  const num = parseInt(match[1]);
  switch (match[2]) {
    case 's':
      return num;
    case 'm':
      return num * 60;
    case 'h':
      return num * 60 * 60;
    case 'd':
      return num * 60 * 60 * 24;
    case 'w':
      return num * 60 * 60 * 24 * 7;
    default:
      return 3600;
  }
}

/**
 * Convert a JWT-style expiry string (e.g. '7d', '24h', '15m') to milliseconds
 */
export function parseExpiryToMs(expiresIn: string): number {
  return parseExpiryToSeconds(expiresIn) * 1000;
}
