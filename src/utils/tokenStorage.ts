const ACCESS_KEY = 'scid_access_token'
const REFRESH_KEY = 'scid_refresh_token'

const LEGACY_ACCESS_KEY = 'access_token'
const LEGACY_REFRESH_KEY = 'refresh_token'

interface TokenPair {
  access: string | null
  refresh: string | null
}

function clearLegacy(): void {
  try {
    localStorage.removeItem(LEGACY_ACCESS_KEY)
    localStorage.removeItem(LEGACY_REFRESH_KEY)
  } catch {
    // Ignore storage access errors (e.g. private mode).
  }
}

/**
 * Read the current tokens.
 *
 * Tokens live in `sessionStorage` (they never survive the tab being closed).
 * Legacy keys previously written to `localStorage` are migrated once and
 * removed, so credentials left over from before the migration are upgraded to
 * the safer storage instead of being silently dropped.
 */
export function readTokens(): TokenPair {
  let access: string | null = null
  let refresh: string | null = null
  try {
    access = sessionStorage.getItem(ACCESS_KEY)
    refresh = sessionStorage.getItem(REFRESH_KEY)
  } catch {
    // Ignore storage access errors.
  }
  if (!access && !refresh) {
    let legacyAccess: string | null = null
    let legacyRefresh: string | null = null
    try {
      legacyAccess = localStorage.getItem(LEGACY_ACCESS_KEY)
      legacyRefresh = localStorage.getItem(LEGACY_REFRESH_KEY)
    } catch {
      // Ignore storage access errors.
    }
    if (legacyAccess || legacyRefresh) {
      writeTokens({ access: legacyAccess, refresh: legacyRefresh })
      return { access: legacyAccess, refresh: legacyRefresh }
    }
  }
  return { access, refresh }
}

export function writeTokens(tokens: TokenPair): void {
  try {
    if (tokens.access) {
      sessionStorage.setItem(ACCESS_KEY, tokens.access)
    } else {
      sessionStorage.removeItem(ACCESS_KEY)
    }
    if (tokens.refresh) {
      sessionStorage.setItem(REFRESH_KEY, tokens.refresh)
    } else {
      sessionStorage.removeItem(REFRESH_KEY)
    }
  } catch {
    // Ignore storage access errors.
  }
  clearLegacy()
}

export function clearTokens(): void {
  try {
    sessionStorage.removeItem(ACCESS_KEY)
    sessionStorage.removeItem(REFRESH_KEY)
  } catch {
    // Ignore storage access errors.
  }
  clearLegacy()
}
