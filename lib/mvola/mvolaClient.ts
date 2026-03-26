import 'server-only';
import { getMvolaAccessToken } from './tokenManager';
import { MvolaError, getMvolaUserFacingMessage } from './errors';

export interface MvolaInitiateRequest {
  clientMsisdn: string;       // debitParty - customer phone
  amountMga: number;          // integer
  bookingId: string;          // requestingOrganisationTransactionReference
  description: string;        // max 50 chars
}

export interface MvolaInitiateResponse {
  serverCorrelationId: string;
  status: 'pending';
  notificationMethod: 'callback' | 'polling';
}

export interface MvolaStatusResponse {
  status: 'pending' | 'completed' | 'failed';
  serverCorrelationId: string;
  notificationMethod: string;
  objectReference?: string;   // transactionReference
}

export interface MvolaTransactionDetails {
  amount: string;
  currency: string;
  transactionReference: string;
  transactionStatus: string;
  createDate: string;
  debitParty: { key: string; value: string }[];
  creditParty: { key: string; value: string }[];
  fees: { feeAmount: string }[];
}

function sanitizeDescription(text: string): string {
  // Replace any char not in [a-zA-Z0-9 \-._,] with ''
  const sanitized = text.replace(/[^a-zA-Z0-9 \-._,]/g, '').trim();
  return sanitized.slice(0, 50);
}

export async function initiateMvolaPayment(
  req: MvolaInitiateRequest
): Promise<MvolaInitiateResponse> {
  const token = await getMvolaAccessToken();
  const correlationId = crypto.randomUUID();
  // Force standard UTC format to satisfy Mvola Sandbox 4001 validations
  const requestDate = new Date().toISOString().replace(/\.\d{3}Z$/, '.000Z');
  const sanitizedDescription = sanitizeDescription(req.description);

  const payload = {
    amount: req.amountMga.toString(),
    currency: "Ar",
    descriptionText: sanitizedDescription,
    requestingOrganisationTransactionReference: req.bookingId.slice(0, 50),
    requestDate: requestDate,
    debitParty: [{ key: "msisdn", value: req.clientMsisdn }],
    creditParty: [{ key: "msisdn", value: process.env.MVOLA_PARTNER_MSISDN! }],
    metadata: [
      { key: "partnerName", value: process.env.MVOLA_PARTNER_NAME! },
      { key: "fc", value: "MGA" },
      { key: "amountFc", value: req.amountMga.toString() }
    ]
  };

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'Version': '1.0',
    'X-CorrelationID': correlationId,
    'UserLanguage': 'FR',
    'UserAccountIdentifier': `msisdn;${process.env.MVOLA_PARTNER_MSISDN}`,
    'partnerName': process.env.MVOLA_PARTNER_NAME!,
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  };

  if (process.env.MVOLA_CALLBACK_URL) {
    headers['X-Callback-URL'] = process.env.MVOLA_CALLBACK_URL;
  }

  const endpoint = `${process.env.MVOLA_BASE_URL}/mvola/mm/transactions/type/merchantpay/1.0.0/`;

  try {
    console.log("Mvola Payload:", JSON.stringify(payload, null, 2));

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      cache: 'no-store'
    });

    if (res.status === 200 || res.status === 202) {
      const data = await res.json();
      return {
        serverCorrelationId: data.serverCorrelationId,
        status: data.status,
        notificationMethod: data.notificationMethod
      };
    }

    if (res.status === 400) {
      const errText = await res.text();
      console.error("Mvola 400 Bad Request Body:", errText);
      throw new MvolaError('Bad Request', 400);
    }
    if (res.status === 401) {
      throw new MvolaError('Unauthorized', 401);
    }
    if (res.status === 409) {
      throw new MvolaError('Conflict', 409);
    }
    if (res.status === 429) {
      throw new MvolaError('Too Many Requests', 429);
    }
    
    throw new MvolaError('Service Unavailable', 503);
    
  } catch (error) {
    if (error instanceof MvolaError) {
      // we just rethrow so we can translate it at the action boundary using getMvolaUserFacingMessage
      throw error;
    }
    throw new MvolaError('Service Mvola inaccessible.', 503);
  }
}

export async function getMvolaTransactionStatus(
  serverCorrelationId: string
): Promise<MvolaStatusResponse> {
  const token = await getMvolaAccessToken();
  const correlationId = crypto.randomUUID();

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'Version': '1.0',
    'X-CorrelationID': correlationId,
    'UserLanguage': 'FR',
    'UserAccountIdentifier': `msisdn;${process.env.MVOLA_PARTNER_MSISDN}`,
    'partnerName': process.env.MVOLA_PARTNER_NAME!,
    'Cache-Control': 'no-cache',
  };

  const endpoint = `${process.env.MVOLA_BASE_URL}/mvola/mm/transactions/type/merchantpay/1.0.0/status/${serverCorrelationId}`;

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new MvolaError(`Failed to fetch status: ${res.status}`, res.status);
    }

    return await res.json();
  } catch (error) {
    if (error instanceof MvolaError) throw error;
    throw new MvolaError('Service Mvola inaccessible.', 503);
  }
}

export async function getMvolaTransactionDetails(
  transactionReference: string
): Promise<MvolaTransactionDetails> {
  const token = await getMvolaAccessToken();
  const correlationId = crypto.randomUUID();

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'Version': '1.0',
    'X-CorrelationID': correlationId,
    'UserLanguage': 'FR',
    'UserAccountIdentifier': `msisdn;${process.env.MVOLA_PARTNER_MSISDN}`,
    'partnerName': process.env.MVOLA_PARTNER_NAME!,
    'Cache-Control': 'no-cache',
  };

  const endpoint = `${process.env.MVOLA_BASE_URL}/mvola/mm/transactions/type/merchantpay/1.0.0/${transactionReference}`;

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new MvolaError(`Failed to fetch details: ${res.status}`, res.status);
    }

    return await res.json();
  } catch (error) {
    if (error instanceof MvolaError) throw error;
    throw new MvolaError('Service Mvola inaccessible.', 503);
  }
}
