/**
 * @fileoverview Auth Cookies - Read/write httpOnly auth cookies
 * @module utils/cookies
 */

import type { CookieOptions, Request, Response } from 'express';
import environment from '../configs/environment.js';
import { parseExpiryToMs } from './duration.js';

export const ACCESS_TOKEN_COOKIE = environment.cookies.accessTokenName;
export const REFRESH_TOKEN_COOKIE = environment.cookies.refreshTokenName;

/**
 * Shared cookie attributes — httpOnly so tokens are never readable from JS
 */
function baseCookieOptions(): CookieOptions {
  const sameSite = environment.cookies.sameSite;

  return {
    httpOnly: true,
    // SameSite=None is only accepted by browsers on secure cookies
    secure: sameSite === 'none' ? true : environment.cookies.secure,
    sameSite,
    domain: environment.cookies.domain,
    path: environment.cookies.path,
  };
}

/**
 * Store the access + refresh tokens in httpOnly cookies
 */
export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string }
): void {
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...baseCookieOptions(),
    maxAge: parseExpiryToMs(environment.jwt.access.expiresIn),
  });

  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...baseCookieOptions(),
    maxAge: parseExpiryToMs(environment.jwt.refresh.expiresIn),
  });
}

/**
 * Refresh only the access token cookie (used by the token refresh endpoint)
 */
export function setAccessTokenCookie(res: Response, accessToken: string): void {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...baseCookieOptions(),
    maxAge: parseExpiryToMs(environment.jwt.access.expiresIn),
  });
}

/**
 * Remove the auth cookies
 */
export function clearAuthCookies(res: Response): void {
  const options = baseCookieOptions();
  res.clearCookie(ACCESS_TOKEN_COOKIE, options);
  res.clearCookie(REFRESH_TOKEN_COOKIE, options);
}

/**
 * Read the access token from the request cookies
 */
export function getAccessTokenCookie(req: Request): string | undefined {
  return req.cookies?.[ACCESS_TOKEN_COOKIE];
}

/**
 * Read the refresh token from the request cookies
 */
export function getRefreshTokenCookie(req: Request): string | undefined {
  return req.cookies?.[REFRESH_TOKEN_COOKIE];
}

/**
 * Parse a raw `Cookie` header into a key/value map
 * (used where the express cookie parser is not available, e.g. socket handshakes)
 */
export function parseCookieHeader(header?: string): Record<string, string> {
  if (!header) return {};

  return header.split(';').reduce<Record<string, string>>((cookies, part) => {
    const separatorIndex = part.indexOf('=');
    if (separatorIndex < 0) return cookies;

    const key = part.slice(0, separatorIndex).trim();
    if (!key) return cookies;

    const rawValue = part.slice(separatorIndex + 1).trim();
    try {
      cookies[key] = decodeURIComponent(rawValue);
    } catch {
      cookies[key] = rawValue;
    }
    return cookies;
  }, {});
}
