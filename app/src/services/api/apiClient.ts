import { ApiException, AuthTokenResponse, BeerTierlistClient } from './generatedClient';

const configuredApiBaseUrl = process.env.REACT_APP_API_BASE_URL?.trim();
if (!configuredApiBaseUrl) {
  throw new Error('REACT_APP_API_BASE_URL must be configured before starting the frontend.');
}

export const API_BASE_URL = configuredApiBaseUrl.replace(/\/+$/, '');
export const SESSION_EXPIRED_EVENT = 'beer-tierlist:session-expired';
export const SESSION_REFRESHED_EVENT = 'beer-tierlist:session-refreshed';

let accessToken: string | null = null;
let refreshPromise: Promise<AuthTokenResponse | null> | null = null;
let client: BeerTierlistClient;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

function isAccountEndpoint(url: RequestInfo): boolean {
  const requestUrl = url instanceof Request ? url.url : String(url);
  const path = new URL(requestUrl, API_BASE_URL).pathname.toLowerCase();
  return [
    '/account/login',
    '/account/register',
    '/account/refresh',
    '/account/logout',
  ].some((endpoint) => path.endsWith(endpoint));
}

async function refreshSession(): Promise<AuthTokenResponse | null> {
  if (!refreshPromise) {
    refreshPromise = client
      .refresh()
      .then((session) => {
        setAccessToken(session.token);
        window.dispatchEvent(
          new CustomEvent(SESSION_REFRESHED_EVENT, { detail: { username: session.username } }),
        );
        return session;
      })
      .catch((error: unknown) => {
        if (error instanceof ApiException && error.status === 401) return null;
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function expireSession(): void {
  setAccessToken(null);
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

const http = {
  async fetch(url: RequestInfo, init?: RequestInit): Promise<Response> {
    const send = (token: string | null) => {
      const headers = new Headers(init?.headers);
      if (token) headers.set('Authorization', `Bearer ${token}`);

      return window.fetch(url, {
        ...init,
        headers,
        credentials: 'include',
      });
    };

    const response = await send(accessToken);
    if (response.status !== 401 || !accessToken || isAccountEndpoint(url)) return response;

    try {
      const refreshed = await refreshSession();
      if (!refreshed) {
        expireSession();
        return response;
      }
      const retryResponse = await send(refreshed.token);
      if (retryResponse.status === 401) expireSession();
      return retryResponse;
    } catch (error) {
      expireSession();
      throw error;
    }
  },
};

client = new BeerTierlistClient(API_BASE_URL, http);
export const apiClient = client;
export { refreshSession };
