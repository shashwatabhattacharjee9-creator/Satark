/**
 * Renders a realistic forged CBI "Digital Arrest Notice" PNG on an HTML5 canvas
 * containing deliberate scammer red flags (non-existent Section 999 BNS,
 * fake RBI Safe-Custody personal UPI ID, video-call secrecy threats, and
 * mismatched amateur seals/typography) so Gemini Vision performs authentic
 * multimodal forensic analysis on real document pixels.
 */
export function generateSampleForgedWarrantDataUrl(): string {
  const width = 820;
  const height = 1100;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Slightly aged scanned-paper background
  ctx.fillStyle = '#f8f5ee';
  ctx.fillRect(0, 0, width, height);

  // Subtle scan-paper noise lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.025)';
  ctx.lineWidth = 1;
  for (let y = 0; y < height; y += 6) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Outer double border (classic scammer notice template)
  ctx.strokeStyle = '#1d2b4f';
  ctx.lineWidth = 4;
  ctx.strokeRect(28, 28, width - 56, height - 56);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(38, 38, width - 76, height - 76);

  // Top Header Banner
  ctx.fillStyle = '#182442';
  ctx.fillRect(46, 46, width - 92, 128);

  // Amateur emblem circle on top-left of header
  ctx.save();
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(112, 110, 38, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(112, 110, 30, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#f3d476';
  ctx.font = 'bold 16px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('CBI', 112, 108);
  ctx.font = 'bold 9px Arial, sans-serif';
  ctx.fillText('CYBER WING', 112, 123);
  ctx.restore();

  // Header Title
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText('CENTRAL BUREAU OF INVESTIGATION', width / 2 + 24, 92);
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillStyle = '#f3d476';
  ctx.fillText('SPECIAL CYBER CRIME & DIGITAL CUSTODY ENFORCEMENT CELL, NEW DELHI', width / 2 + 24, 118);
  ctx.font = '12px Courier New, monospace';
  ctx.fillStyle = '#d8e2ff';
  ctx.fillText('WHATSAPP / SKYPE VIDEO SURVEILLANCE WARRANT  ·  IMMEDIATE EXECUTION', width / 2 + 24, 145);

  // Red Alert Strip
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(46, 186, width - 92, 42);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('NON-BAILABLE DIGITAL ARREST NOTICE', width / 2, 214);

  // Case Reference Metadata Row
  ctx.textAlign = 'left';
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 14px Courier New, monospace';
  ctx.fillText('CASE NO: FIR/CBI-CYB/2026/009482-IND', 60, 264);
  ctx.textAlign = 'right';
  ctx.fillText('DATE: 20 NOV 2026  |  PRIORITY: HIGH', width - 60, 264);

  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 278);
  ctx.lineTo(width - 60, 278);
  ctx.stroke();

  // Body Text with blatant legal & coercion red flags
  ctx.textAlign = 'left';
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 16px Georgia, serif';
  ctx.fillText('TO: THE SUSPECTED AADHAAR & BANK ACCOUNT HOLDER', 60, 314);

  const paragraphs: Array<{ text: string; bold?: boolean; color?: string; font?: string }> = [
    {
      text: '1. Pursuant to urgent orders under Section 999 BNS (Bharatiya Nyaya Sanhita) and Section 66Z Digital Custody Act, your Aadhaar ID has been linked to an illegal FedEx parcel and ₹2.40 Crore money laundering syndicate.',
    },
    {
      text: '2. You are hereby placed under IMMEDIATE DIGITAL ARREST via live WhatsApp / Skype video monitoring. Do NOT disconnect the video call, do NOT leave your room, and do NOT inform any family member or lawyer until clearance is issued.',
      bold: true,
      color: '#991b1b',
    },
    {
      text: '3. MANDATORY FINANCIAL AUDIT: To prove your savings are legitimate and cancel physical police dispatch within 20 minutes, transfer 100% of your liquid balance to the official RBI Safe-Custody Verification Account below:',
    },
  ];

  let cursorY = 352;
  const maxTextWidth = width - 120;

  for (const para of paragraphs) {
    ctx.fillStyle = para.color ?? '#1f2937';
    ctx.font = para.bold
      ? 'bold 15px Arial, sans-serif'
      : (para.font ?? '15px Georgia, serif');
    cursorY = drawWrappedText(ctx, para.text, 60, cursorY, maxTextWidth, 24);
    cursorY += 16;
  }

  // Highlighted Fake RBI Safe-Custody / Personal UPI Box
  const boxY = cursorY + 4;
  ctx.fillStyle = '#fef2f2';
  ctx.fillRect(60, boxY, width - 120, 152);
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 2;
  ctx.strokeRect(60, boxY, width - 120, 152);

  ctx.fillStyle = '#991b1b';
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.fillText('RBI SAFE-CUSTODY CLEARANCE TRANSFER DETAILS (REFUNDABLE IN 30 MINS)', 78, boxY + 30);

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 14px Courier New, monospace';
  ctx.fillText('BENEFICIARY NAME :  RBI DIGITAL VERIFICATION TRUST (MR. VIKRAM K.)', 78, boxY + 62);
  ctx.fillText('ACCOUNT NUMBER   :  40928174650019  (IFSC: UTIB0004912)', 78, boxY + 88);
  ctx.fillText('URGENT UPI ID    :  rbi.safecustody.verify@okaxis', 78, boxY + 114);
  ctx.fillStyle = '#b91c1c';
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillText('WARNING: FAILURE TO TRANSFER WITHIN 20 MINS = IMMEDIATE ARREST & ASSET FREEZE', 78, boxY + 139);

  // Secrecy clause
  const secrecyY = boxY + 188;
  ctx.fillStyle = '#1f2937';
  ctx.font = 'italic 14px Georgia, serif';
  drawWrappedText(
    ctx,
    'NON-DISCLOSURE DIRECTIVE: This Digital Arrest Warrant is strictly secret under National Security Protocol. Disclosing this WhatsApp document to bank staff, local police, or relatives will result in immediate 7-year imprisonment.',
    60,
    secrecyY,
    maxTextWidth,
    22
  );

  // Fake crooked red rubber stamp (classic scammer visual tell)
  ctx.save();
  ctx.translate(615, 890);
  ctx.rotate(-0.22);
  ctx.strokeStyle = 'rgba(185, 28, 28, 0.85)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 74, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 64, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(185, 28, 28, 0.9)';
  ctx.textAlign = 'center';
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillText('SUPREME COURT', 0, -24);
  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.fillText('DIGITAL ARREST', 0, 2);
  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.fillText('APPROVED · CBI', 0, 24);
  ctx.restore();

  // Signature block on bottom-left
  ctx.textAlign = 'left';
  ctx.strokeStyle = '#1d4ed8';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(76, 912);
  ctx.bezierCurveTo(105, 875, 130, 938, 175, 895);
  ctx.bezierCurveTo(205, 870, 232, 922, 268, 902);
  ctx.stroke();

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillText('DCP / INSPECTOR RAJESH VERMA (IPS)', 64, 946);
  ctx.font = '13px Georgia, serif';
  ctx.fillStyle = '#374151';
  ctx.fillText('Central Bureau of Investigation · Cyber Enforcement', 64, 968);
  ctx.fillText('Contact: WhatsApp Official Desk Only (Do Not Call 1930)', 64, 988);

  // Subtle footer watermark
  ctx.fillStyle = '#6b7280';
  ctx.font = '11px Courier New, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SAMPLE SIMULATED SCAM DOCUMENT FOR SATARK LIVE FORENSIC DEMO', width / 2, 1048);

  return canvas.toDataURL('image/png');
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = words[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}
