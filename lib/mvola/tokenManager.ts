import 'server-only';
import { MvolaError } from './errors';

export interface MvolaToken {
  accessToken: string;
  expiresAt: number;
}

let cachedToken: MvolaToken | null = null;

export async function getMvolaAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.accessToken;
  }

  const tokenUrl = process.env.MVOLA_TOKEN_URL?.trim();
  const clientId = process.env.MVOLA_CLIENT_ID?.trim();
  const clientSecret = process.env.MVOLA_CLIENT_SECRET?.trim();

  if (!tokenUrl || !clientId || !clientSecret) {
    throw new MvolaError('Mvola configuration is incomplete', 500);
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  const body = new URLSearchParams();
  body.append('grant_type', 'client_credentials');
  body.append('scope', 'EXT_INT_MVOLA_SCOPE');

  try {
    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      body: body.toString(),
      // We don't cache this fetch via Next.js cache; we use in-memory `cachedToken`
      cache: 'no-store',
    });

    if (!res.ok) {
      cachedToken = null;
      throw new MvolaError('Authentification Mvola échouée', 401);
    }

    const data = await res.json();
    
    if (!data.access_token || !data.expires_in) {
      cachedToken = null;
      throw new MvolaError('Authentification Mvola échouée', 401);
    }

    cachedToken = {
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    return cachedToken.accessToken;
  } catch (error) {
    cachedToken = null;
    if (error instanceof MvolaError) {
      throw error;
    }
    throw new MvolaError('Authentification Mvola échouée', 401);
  }
}
