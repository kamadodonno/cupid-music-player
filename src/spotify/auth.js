/**
 * Spotify OAuth 2.0 PKCE Authorization Flow
 *
 * No backend needed — the entire flow runs in the browser / Electron.
 * Requires VITE_SPOTIFY_CLIENT_ID to be set in your .env file.
 */

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;

export function getRedirectUri() {
  if (import.meta.env.VITE_SPOTIFY_REDIRECT_URI) {
    return import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
  }
  if (window.Android) {
    return 'com.mehul.cupidplayer://callback';
  }
  return 'http://127.0.0.1:5173/callback';
}

const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
];

const TOKEN_KEY = 'spotify_token';
const REFRESH_KEY = 'spotify_refresh_token';
const EXPIRY_KEY = 'spotify_token_expiry';
const CODE_VERIFIER_KEY = 'spotify_code_verifier';

// ── Helpers ──────────────────────────────────────────────────

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (v) => chars[v % chars.length]).join('');
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  return crypto.subtle.digest('SHA-256', encoder.encode(plain));
}

function base64UrlEncode(buffer) {
  const bytes = new Uint8Array(buffer);
  const str = String.fromCharCode(...bytes);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generateCodeChallenge(verifier) {
  const hashed = await sha256(verifier);
  return base64UrlEncode(hashed);
}

// ── Public API ────────────────────────────────────────────────

/**
 * Initiate the Spotify login flow.
 * Redirects the browser or opens Electron auth window to Spotify's authorize endpoint.
 */
export async function login() {
  if (!CLIENT_ID) {
    throw new Error('Missing VITE_SPOTIFY_CLIENT_ID in .env');
  }

  const verifier = generateRandomString(64);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem(CODE_VERIFIER_KEY, verifier);

  const redirectUri = getRedirectUri();

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SCOPES.join(' '),
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });

  const authUrl = `https://accounts.spotify.com/authorize?${params}`;

  if (window.Android?.openSpotifyLogin) {
    Android.openSpotifyLogin(authUrl);
  } else if (window.cupid?.openExternal) {
    window.cupid.openExternal(authUrl);
  } else {
    window.location.href = authUrl;
  }
}

/**
 * Handle the OAuth callback — exchange the authorization code for tokens.
 */
let _callbackInFlight = false;

export async function handleCallback() {
  let code = null;
  let error = null;

  if (window.Android?.getAuthRedirect) {
    try {
      const callbackUrl = Android.getAuthRedirect();
      if (callbackUrl) {
        if (callbackUrl.includes('?')) {
          const searchParams = new URLSearchParams(callbackUrl.split('?')[1]);
          code = searchParams.get('code');
          error = searchParams.get('error');
        } else if (callbackUrl.startsWith('http://') || callbackUrl.startsWith('https://')) {
          const parsed = new URL(callbackUrl);
          code = parsed.searchParams.get('code');
          error = parsed.searchParams.get('error');
        }
      }
    } catch (e) {
      console.warn('Error reading Android auth redirect:', e);
    }
  }

  // Fallback to window.location.search (Desktop / Electron / Web)
  if (!code && !error) {
    const params = new URLSearchParams(window.location.search);
    code = params.get('code');
    error = params.get('error');
  }

  if (error) {
    throw new Error(`Spotify auth error: ${error}`);
  }

  if (!code) return null;

  if (_callbackInFlight) return null;
  _callbackInFlight = true;

  try {
    const verifier = localStorage.getItem(CODE_VERIFIER_KEY);
    if (!verifier) {
      throw new Error('Missing PKCE code verifier — please try logging in again.');
    }

    const redirectUri = getRedirectUri();

    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    });

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Token exchange failed (${response.status}): ${text}`);
    }

    const data = await response.json();
    storeTokens(data);
    localStorage.removeItem(CODE_VERIFIER_KEY);

    // Clean the URL so the code isn't re-used
    window.history.replaceState({}, '', window.location.pathname || '/');

    return data.access_token;
  } finally {
    _callbackInFlight = false;
  }
}

function storeTokens({ access_token, refresh_token, expires_in }) {
  if (access_token) localStorage.setItem(TOKEN_KEY, access_token);
  if (refresh_token) localStorage.setItem(REFRESH_KEY, refresh_token);
  if (expires_in) localStorage.setItem(EXPIRY_KEY, String(Date.now() + expires_in * 1000));
}

/**
 * Get a valid access token, refreshing if necessary.
 */
export async function getAccessToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = Number(localStorage.getItem(EXPIRY_KEY) || '0');

  // Token still valid
  if (token && Date.now() < expiry - 60_000) {
    return token;
  }

  // Try to refresh
  const refreshed = await refreshAccessToken();
  if (refreshed) return refreshed;

  // No refresh token but we have a token — use it anyway (may be expired)
  return token || null;
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) {
    return null;
  }

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    logout();
    return null;
  }

  const data = await response.json();
  storeTokens(data);
  return data.access_token;
}

export function isLoggedIn() {
  return !!localStorage.getItem(TOKEN_KEY);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(EXPIRY_KEY);
  localStorage.removeItem(CODE_VERIFIER_KEY);
}
