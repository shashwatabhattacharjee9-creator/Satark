import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const WAITLIST_FILE = path.join(DATA_DIR, 'waitlist.json');

export type WaitlistChannel = 'email' | 'whatsapp';
export type WaitlistTrack = 'family' | 'partner';
export type DeliveryStatus =
  | 'sent'
  | 'preview_sent'
  | 'whatsapp_link_ready'
  | 'queued';

export type DeliveryProvider =
  | 'resend'
  | 'smtp'
  | 'ethereal-smtp'
  | 'meta-whatsapp'
  | 'twilio-whatsapp'
  | 'whatsapp-direct-link'
  | 'queued-local';

export interface WaitlistEntry {
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
  note?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
  lastDeliveryStatus?: DeliveryStatus;
  lastDeliveryProvider?: DeliveryProvider;
}

export interface WaitlistDeliveryResult {
  channel: WaitlistChannel;
  status: DeliveryStatus;
  provider: DeliveryProvider;
  headline: string;
  detail: string;
  messageText: string;
  messageId?: string | null;
  previewUrl?: string | null;
  whatsappUrl?: string | null;
  mailtoUrl?: string | null;
}

export interface WaitlistSubmissionInput {
  name: string;
  contact: string;
  track?: WaitlistTrack;
  familySize?: string;
  orgName?: string;
  partnerType?: string;
  note?: string;
  source?: string;
}

export interface WaitlistSubmissionResponse {
  ok: true;
  alreadyRegistered: boolean;
  entry: WaitlistEntry;
  delivery: WaitlistDeliveryResult;
  totalWaitlistCount: number;
}

interface EtherealCredentials {
  user: string;
  pass: string;
}

let cachedEtherealAccount: EtherealCredentials | null = null;

function ensureStore(): WaitlistEntry[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(WAITLIST_FILE)) {
    fs.writeFileSync(WAITLIST_FILE, '[]', 'utf8');
    return [];
  }
  try {
    const raw = fs.readFileSync(WAITLIST_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WaitlistEntry[]) : [];
  } catch {
    return [];
  }
}

function saveStore(entries: WaitlistEntry[]): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpFile = `${WAITLIST_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(entries, null, 2), 'utf8');
  fs.renameSync(tmpFile, WAITLIST_FILE);
}

export function detectAndNormalizeContact(rawContact: string): {
  channel: WaitlistChannel;
  normalized: string;
  display: string;
  whatsappDigits?: string;
} | null {
  const trimmed = rawContact.trim();
  if (!trimmed) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (emailRegex.test(trimmed)) {
    return {
      channel: 'email',
      normalized: trimmed.toLowerCase(),
      display: trimmed.toLowerCase(),
    };
  }

  // Normalize phone / WhatsApp numbers (India-first default +91 for 10-digit numbers)
  const cleaned = trimmed.replace(/[\s\-().]/g, '');
  const digitsOnly = cleaned.replace(/^\+/, '');
  if (!/^\d{10,15}$/.test(digitsOnly)) {
    return null;
  }

  let e164Digits = digitsOnly;
  if (digitsOnly.length === 10) {
    e164Digits = `91${digitsOnly}`;
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    e164Digits = `91${digitsOnly.slice(1)}`;
  }

  return {
    channel: 'whatsapp',
    normalized: `+${e164Digits}`,
    display: `+${e164Digits}`,
    whatsappDigits: e164Digits,
  };
}

function buildConfirmationCopy(entry: WaitlistEntry): {
  subject: string;
  plainText: string;
  whatsappText: string;
  html: string;
} {
  const firstName = entry.name.trim() || 'there';
  const trackLabel =
    entry.track === 'partner'
      ? `${entry.partnerType || 'Bank / Telecom SDK'} (${entry.orgName || 'Partner Pilot'})`
      : `Satark Live Android Family Beta (${entry.familySize || 'Family Shield'})`;

  const subject = `You are on the waiting list — Satark Live (${entry.ticketCode})`;

  const plainText = [
    `Hi ${firstName},`,
    '',
    'You are on the waiting list for Satark Live!',
    '',
    `Waitlist Ticket: ${entry.ticketCode}`,
    `Queue Position: #${entry.position}`,
    `Track: ${trackLabel}`,
    '',
    'We will notify you on this contact the moment your priority access invite opens.',
    '',
    'Parent Digital Arrest Safety Card (Share with your family today):',
    '1. No police, CBI, ED, or court in India ever conducts an arrest over video call or WhatsApp.',
    '2. Never merge an incoming call while speaking to an unknown caller — scammers use call-merge to capture bank voice OTPs.',
    '3. Hang up immediately, call a family member on a separate line, and report suspicious attempts on 1930 (cybercrime.gov.in).',
    '',
    'Stay protected,',
    'Team Satark Live — Hear the lie before you act on it.',
  ].join('\n');

  const whatsappText = [
    `🛡️ *Satark Live — You are on the waiting list!*`,
    '',
    `Hi ${firstName}, your priority spot is confirmed.`,
    `• *Waitlist Ticket:* ${entry.ticketCode}`,
    `• *Queue Position:* #${entry.position}`,
    `• *Track:* ${trackLabel}`,
    '',
    `We'll message you right here as soon as your beta access unlocks.`,
    '',
    `📋 *3 Rules to Share With Your Family Today:*`,
    `1. No CBI, Police, ED, or court in India ever conducts an arrest on a video call.`,
    `2. Never merge an incoming call during an unknown call — it may be your bank's voice OTP.`,
    `3. Hang up immediately & report fraud on *1930* (cybercrime.gov.in).`,
  ].join('\n');

  const safeName = escapeHtml(firstName);
  const safeTrack = escapeHtml(trackLabel);
  const safeTicket = escapeHtml(entry.ticketCode);

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background-color:#f4f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111111;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f6;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:580px;background-color:#ffffff;border:1px solid #e2e2e8;">
            <tr>
              <td style="background:#000000;padding:28px 32px;border-bottom:3px solid #0000EE;">
                <p style="margin:0 0 8px 0;font-family:monospace;font-size:11px;letter-spacing:0.08em;color:#BFBFFB;text-transform:uppercase;">
                  SATARK LIVE · PRIORITY WAITLIST
                </p>
                <h1 style="margin:0;font-size:26px;line-height:1.2;color:#ffffff;font-weight:700;">
                  You are on the waiting list.
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#222222;">
                  Hi <strong>${safeName}</strong>,
                </p>
                <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#333333;">
                  Your spot on the <strong>Satark Live</strong> waiting list is officially reserved. We will send your private onboarding link as soon as your cohort opens.
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f7f7fc;border:1px solid #d9d9f3;margin-bottom:24px;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <p style="margin:0 0 6px 0;font-family:monospace;font-size:11px;color:#0000EE;text-transform:uppercase;">
                        Confirmed Waitlist Pass
                      </p>
                      <p style="margin:0 0 4px 0;font-size:20px;font-weight:700;color:#000000;">
                        ${safeTicket} &nbsp;·&nbsp; Spot #${entry.position}
                      </p>
                      <p style="margin:0;font-size:13px;color:#555555;">
                        Track: ${safeTrack}
                      </p>
                    </td>
                  </tr>
                </table>

                <div style="border-left:3px solid #0000EE;padding:4px 0 4px 16px;margin-bottom:24px;">
                  <p style="margin:0 0 10px 0;font-size:13px;font-weight:700;color:#000000;text-transform:uppercase;letter-spacing:0.04em;">
                    Unlocked: 3-Rule Family Digital Arrest Safety Card
                  </p>
                  <ol style="margin:0;padding-left:18px;font-size:13px;line-height:1.65;color:#333333;">
                    <li style="margin-bottom:6px;">No police, CBI, ED, or court in India ever conducts an arrest over video call or WhatsApp.</li>
                    <li style="margin-bottom:6px;">Never merge an incoming call while talking to an unknown caller — scammers use call-merge to capture bank voice OTPs.</li>
                    <li>Hang up immediately, call a family member back on a separate line, and report fraud on <strong>1930</strong> or <strong>cybercrime.gov.in</strong>.</li>
                  </ol>
                </div>

                <p style="margin:0;font-size:12px;color:#666666;line-height:1.5;">
                  Satark Live — <em>Hear the lie before you act on it.</em>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, plainText, whatsappText, html };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isConfiguredEmailProvider(): 'resend' | 'smtp' | null {
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim().length > 5) {
    return 'resend';
  }
  if (
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_USER.trim().length > 0 &&
    process.env.SMTP_PASS.trim().length > 0
  ) {
    return 'smtp';
  }
  return null;
}

function isConfiguredWhatsAppProvider(): 'meta-whatsapp' | 'twilio-whatsapp' | null {
  if (
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
    process.env.WHATSAPP_ACCESS_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID.trim().length > 0 &&
    process.env.WHATSAPP_ACCESS_TOKEN.trim().length > 10
  ) {
    return 'meta-whatsapp';
  }
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_WHATSAPP_FROM
  ) {
    return 'twilio-whatsapp';
  }
  return null;
}

async function dispatchEmail(entry: WaitlistEntry): Promise<WaitlistDeliveryResult> {
  const copy = buildConfirmationCopy(entry);
  const mailtoUrl = `mailto:${encodeURIComponent(entry.normalizedContact)}?subject=${encodeURIComponent(copy.subject)}&body=${encodeURIComponent(copy.plainText)}`;

  // 1. Live Resend HTTP API
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim().length > 5) {
    try {
      const from = process.env.RESEND_FROM?.trim() || 'Satark Live <onboarding@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [entry.normalizedContact],
          subject: copy.subject,
          html: copy.html,
          text: copy.plainText,
        }),
        signal: AbortSignal.timeout(12_000),
      });

      if (res.ok) {
        const data = (await res.json()) as { id?: string };
        return {
          channel: 'email',
          status: 'sent',
          provider: 'resend',
          headline: `Confirmation email sent to ${entry.normalizedContact}`,
          detail: 'Check your inbox (or spam folder) for your Satark Live waiting list pass and Parent Safety Card.',
          messageText: copy.plainText,
          messageId: data.id ?? null,
          mailtoUrl,
        };
      }
      const errText = await res.text();
      console.error('Resend API dispatch failed:', res.status, errText);
    } catch (err) {
      console.error('Resend API error:', err);
    }
  }

  // 2. Live SMTP (Gmail App Password, Outlook, Zoho, or custom SMTP)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const smtpUser = process.env.SMTP_USER.trim();
      const smtpPass = process.env.SMTP_PASS.trim();
      const defaultHost = smtpUser.toLowerCase().endsWith('@gmail.com')
        ? 'smtp.gmail.com'
        : 'smtp.gmail.com';
      const host = process.env.SMTP_HOST?.trim() || defaultHost;
      const port = Number(process.env.SMTP_PORT) || 465;
      const secure = port === 465;
      const from = process.env.SMTP_FROM?.trim() || `Satark Live <${smtpUser}>`;

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user: smtpUser, pass: smtpPass },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
      });

      const info = await transporter.sendMail({
        from,
        to: entry.normalizedContact,
        subject: copy.subject,
        text: copy.plainText,
        html: copy.html,
      });

      return {
        channel: 'email',
        status: 'sent',
        provider: 'smtp',
        headline: `Confirmation email sent to ${entry.normalizedContact}`,
        detail: 'Check your inbox for your Satark Live waiting list pass and Parent Safety Card.',
        messageText: copy.plainText,
        messageId: info.messageId,
        mailtoUrl,
      };
    } catch (err) {
      console.error('SMTP dispatch failed:', err);
    }
  }

  // 3. Zero-config Real SMTP Preview Delivery (Ethereal Email) so judges/users can open & inspect the exact sent email immediately
  try {
    if (!cachedEtherealAccount) {
      const account = await nodemailer.createTestAccount();
      cachedEtherealAccount = { user: account.user, pass: account.pass };
    }
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: cachedEtherealAccount.user,
        pass: cachedEtherealAccount.pass,
      },
      connectionTimeout: 8_000,
      greetingTimeout: 8_000,
    });

    const info = await transporter.sendMail({
      from: '"Satark Live Waitlist" <waitlist@satark.live>',
      to: entry.normalizedContact,
      subject: copy.subject,
      text: copy.plainText,
      html: copy.html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || null;
    return {
      channel: 'email',
      status: 'preview_sent',
      provider: 'ethereal-smtp',
      headline: `Waiting list email dispatched for ${entry.normalizedContact}`,
      detail:
        'Dispatched via sandbox SMTP. Open the delivered email below, or add RESEND_API_KEY / SMTP_USER + SMTP_PASS in Secrets for direct inbox delivery.',
      messageText: copy.plainText,
      messageId: info.messageId,
      previewUrl,
      mailtoUrl,
    };
  } catch (err) {
    console.error('Ethereal preview SMTP unavailable:', err);
    return {
      channel: 'email',
      status: 'queued',
      provider: 'queued-local',
      headline: `Waitlist spot saved for ${entry.normalizedContact}`,
      detail:
        'Add RESEND_API_KEY or SMTP_USER + SMTP_PASS in Secrets to enable automatic inbox delivery.',
      messageText: copy.plainText,
      mailtoUrl,
    };
  }
}

async function dispatchWhatsApp(
  entry: WaitlistEntry,
  whatsappDigits: string
): Promise<WaitlistDeliveryResult> {
  const copy = buildConfirmationCopy(entry);
  const whatsappUrl = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(copy.whatsappText)}`;

  // 1. Live Meta WhatsApp Cloud API
  if (process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN) {
    try {
      const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID.trim();
      const token = process.env.WHATSAPP_ACCESS_TOKEN.trim();
      const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: whatsappDigits,
          type: 'text',
          text: {
            preview_url: false,
            body: copy.whatsappText,
          },
        }),
        signal: AbortSignal.timeout(12_000),
      });

      if (res.ok) {
        const data = (await res.json()) as { messages?: Array<{ id?: string }> };
        return {
          channel: 'whatsapp',
          status: 'sent',
          provider: 'meta-whatsapp',
          headline: `WhatsApp confirmation sent to ${entry.normalizedContact}`,
          detail: 'Your waiting list pass and Parent Safety Card have been delivered directly on WhatsApp.',
          messageText: copy.whatsappText,
          messageId: data.messages?.[0]?.id ?? null,
          whatsappUrl,
        };
      }
      const errText = await res.text();
      console.error('Meta WhatsApp Cloud API error:', res.status, errText);
    } catch (err) {
      console.error('Meta WhatsApp Cloud API network error:', err);
    }
  }

  // 2. Live Twilio WhatsApp API
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_WHATSAPP_FROM
  ) {
    try {
      const sid = process.env.TWILIO_ACCOUNT_SID.trim();
      const authToken = process.env.TWILIO_AUTH_TOKEN.trim();
      const from = process.env.TWILIO_WHATSAPP_FROM.trim().startsWith('whatsapp:')
        ? process.env.TWILIO_WHATSAPP_FROM.trim()
        : `whatsapp:${process.env.TWILIO_WHATSAPP_FROM.trim()}`;

      const params = new URLSearchParams({
        From: from,
        To: `whatsapp:+${whatsappDigits}`,
        Body: copy.whatsappText,
      });

      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${sid}:${authToken}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
          signal: AbortSignal.timeout(12_000),
        }
      );

      if (res.ok) {
        const data = (await res.json()) as { sid?: string };
        return {
          channel: 'whatsapp',
          status: 'sent',
          provider: 'twilio-whatsapp',
          headline: `WhatsApp confirmation sent to ${entry.normalizedContact}`,
          detail: 'Your waiting list pass and Parent Safety Card have been delivered directly on WhatsApp.',
          messageText: copy.whatsappText,
          messageId: data.sid ?? null,
          whatsappUrl,
        };
      }
      const errText = await res.text();
      console.error('Twilio WhatsApp API error:', res.status, errText);
    } catch (err) {
      console.error('Twilio WhatsApp API network error:', err);
    }
  }

  // 3. Zero-config WhatsApp Direct Dispatch Link (works immediately on mobile & desktop WhatsApp)
  return {
    channel: 'whatsapp',
    status: 'whatsapp_link_ready',
    provider: 'whatsapp-direct-link',
    headline: `WhatsApp waiting list pass ready for ${entry.normalizedContact}`,
    detail:
      'Tap "Open in WhatsApp" below to receive your waiting list pass immediately, or add Meta WhatsApp / Twilio credentials in Secrets for automatic background push.',
    messageText: copy.whatsappText,
    whatsappUrl,
  };
}

export async function registerWaitlistLead(
  input: WaitlistSubmissionInput
): Promise<WaitlistSubmissionResponse> {
  const cleanName = (input.name || '').trim().slice(0, 100);
  const parsed = detectAndNormalizeContact(input.contact || '');

  if (!cleanName) {
    throw Object.assign(new Error('Please enter your full name.'), { status: 400 });
  }
  if (!parsed) {
    throw Object.assign(
      new Error('Please enter a valid email address or 10-digit WhatsApp number.'),
      { status: 400 }
    );
  }

  const track: WaitlistTrack = input.track === 'partner' ? 'partner' : 'family';
  if (track === 'partner' && (!input.orgName || !input.orgName.trim())) {
    throw Object.assign(
      new Error('Please enter your bank, UPI app, or organization name.'),
      { status: 400 }
    );
  }

  const entries = ensureStore();
  const now = new Date().toISOString();
  const existingIdx = entries.findIndex(
    (e) => e.normalizedContact === parsed.normalized
  );

  let entry: WaitlistEntry;
  let alreadyRegistered = false;

  if (existingIdx >= 0) {
    alreadyRegistered = true;
    const prev = entries[existingIdx];
    entry = {
      ...prev,
      name: cleanName || prev.name,
      track,
      familySize: input.familySize?.trim() || prev.familySize,
      orgName: input.orgName?.trim() || prev.orgName,
      partnerType: input.partnerType?.trim() || prev.partnerType,
      note: input.note?.trim() || prev.note,
      updatedAt: now,
    };
    entries[existingIdx] = entry;
  } else {
    const position = entries.length + 1;
    const ticketCode = `SATARK-${String(position).padStart(4, '0')}`;
    entry = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      ticketCode,
      position,
      name: cleanName,
      contact: input.contact.trim(),
      normalizedContact: parsed.normalized,
      channel: parsed.channel,
      track,
      familySize: input.familySize?.trim() || undefined,
      orgName: input.orgName?.trim() || undefined,
      partnerType: input.partnerType?.trim() || undefined,
      note: input.note?.trim() || undefined,
      source: input.source?.trim() || 'landing',
      createdAt: now,
      updatedAt: now,
    };
    entries.push(entry);
  }

  const delivery =
    parsed.channel === 'email'
      ? await dispatchEmail(entry)
      : await dispatchWhatsApp(entry, parsed.whatsappDigits || parsed.normalized.replace(/^\+/, ''));

  entry.lastDeliveryStatus = delivery.status;
  entry.lastDeliveryProvider = delivery.provider;
  entry.updatedAt = new Date().toISOString();

  if (existingIdx >= 0) {
    entries[existingIdx] = entry;
  } else {
    entries[entries.length - 1] = entry;
  }
  saveStore(entries);

  return {
    ok: true,
    alreadyRegistered,
    entry,
    delivery,
    totalWaitlistCount: entries.length,
  };
}

export async function resendWaitlistConfirmation(
  ticketCodeOrContact: string
): Promise<WaitlistSubmissionResponse> {
  const key = (ticketCodeOrContact || '').trim();
  if (!key) {
    throw Object.assign(new Error('Missing waitlist ticket or contact.'), { status: 400 });
  }
  const entries = ensureStore();
  const parsed = detectAndNormalizeContact(key);
  const idx = entries.findIndex(
    (e) =>
      e.ticketCode.toUpperCase() === key.toUpperCase() ||
      (parsed && e.normalizedContact === parsed.normalized)
  );
  if (idx < 0) {
    throw Object.assign(new Error('Waitlist registration not found.'), { status: 404 });
  }
  const entry = entries[idx];
  const digits = entry.normalizedContact.replace(/^\+/, '');
  const delivery =
    entry.channel === 'email'
      ? await dispatchEmail(entry)
      : await dispatchWhatsApp(entry, digits);

  entry.lastDeliveryStatus = delivery.status;
  entry.lastDeliveryProvider = delivery.provider;
  entry.updatedAt = new Date().toISOString();
  entries[idx] = entry;
  saveStore(entries);

  return {
    ok: true,
    alreadyRegistered: true,
    entry,
    delivery,
    totalWaitlistCount: entries.length,
  };
}

export function getWaitlistStats() {
  const entries = ensureStore();
  return {
    totalRegistered: entries.length,
    emailLiveProvider: isConfiguredEmailProvider(),
    whatsappLiveProvider: isConfiguredWhatsAppProvider(),
  };
}
