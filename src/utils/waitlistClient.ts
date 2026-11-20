export type WaitlistChannel = 'email' | 'whatsapp';
export type WaitlistTrack = 'family' | 'partner';
export type DeliveryStatus =
  | 'sent'
  | 'preview_sent'
  | 'whatsapp_link_ready'
  | 'queued';

export interface WaitlistEntryDTO {
  id: string;
  ticketCode: string;
  position: number;
  name: string;
  contact: string;
  normalizedContact: string;
  channel: WaitlistChannel;
  track: WaitlistTrack;
  familySize?: string;
  orgName?: string;
  partnerType?: string;
  createdAt: string;
}

export interface WaitlistDeliveryDTO {
  channel: WaitlistChannel;
  status: DeliveryStatus;
  provider: string;
  headline: string;
  detail: string;
  messageText: string;
  messageId?: string | null;
  previewUrl?: string | null;
  whatsappUrl?: string | null;
  mailtoUrl?: string | null;
}

export interface WaitlistResponseDTO {
  ok: true;
  alreadyRegistered: boolean;
  entry: WaitlistEntryDTO;
  delivery: WaitlistDeliveryDTO;
  totalWaitlistCount: number;
}

export interface SubmitWaitlistPayload {
  name: string;
  contact: string;
  track: WaitlistTrack;
  familySize?: string;
  orgName?: string;
  partnerType?: string;
  note?: string;
  source?: string;
}

export function detectContactChannel(raw: string): WaitlistChannel | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
    return 'email';
  }
  const digitsOnly = trimmed.replace(/[\s\-().+]/g, '');
  if (/^\d{10,15}$/.test(digitsOnly)) {
    return 'whatsapp';
  }
  return null;
}

export async function submitWaitlist(
  payload: SubmitWaitlistPayload
): Promise<WaitlistResponseDTO> {
  const res = await fetch('/api/satark/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as
    | WaitlistResponseDTO
    | { error?: string };

  if (!res.ok || !('ok' in data && data.ok)) {
    throw new Error(
      ('error' in data && data.error) ||
        'Could not complete your waitlist registration. Please try again.'
    );
  }
  return data;
}

export async function resendWaitlistMessage(
  ticketCode: string
): Promise<WaitlistResponseDTO> {
  const res = await fetch('/api/satark/waitlist/resend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticketCode }),
  });
  const data = (await res.json().catch(() => ({}))) as
    | WaitlistResponseDTO
    | { error?: string };

  if (!res.ok || !('ok' in data && data.ok)) {
    throw new Error(
      ('error' in data && data.error) ||
        'Could not resend your waiting list confirmation.'
    );
  }
  return data;
}
