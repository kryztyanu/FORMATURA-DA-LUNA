import QRCode from 'qrcode';

/**
 * CRC16 calculation according to CCITT standard for PIX BR Code
 */
function crc16(str: string): string {
  let crc = 0xffff;
  const strlen = str.length;
  for (let c = 0; c < strlen; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  const hex = (crc & 0xffff).toString(16).toUpperCase();
  return hex.padStart(4, '0');
}

function formatEmvField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

/**
 * Generate standard Brazilian PIX EMV BR Code string
 */
export function generatePixCopiaECola(
  pixKey: string,
  amount: number,
  merchantName: string = 'LUNA FORMATURA',
  merchantCity: string = 'SALVADOR',
  txId: string = 'LUNA2026'
): string {
  const cleanKey = pixKey.trim();
  const formattedAmount = amount > 0 ? amount.toFixed(2) : '10.00';

  // 26 Merchant Account Info
  const gui = formatEmvField('00', 'br.gov.bcb.pix');
  const keyField = formatEmvField('01', cleanKey);
  const merchantAccountInfo = formatEmvField('26', `${gui}${keyField}`);

  // 62 Additional Data Field Template (txid)
  const txField = formatEmvField('05', txId.slice(0, 25));
  const additionalDataField = formatEmvField('62', txField);

  // Clean name and city (ASCII only, max 25 chars)
  const cleanName = merchantName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 25).toUpperCase();
  const cleanCity = merchantCity.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 15).toUpperCase();

  const rawPayload =
    formatEmvField('00', '01') + // Format indicator
    formatEmvField('01', '12') + // Dynamic QR Code
    merchantAccountInfo +
    formatEmvField('52', '0000') + // Merchant category code
    formatEmvField('53', '986') + // Currency BRL
    formatEmvField('54', formattedAmount) +
    formatEmvField('58', 'BR') + // Country
    formatEmvField('59', cleanName) +
    formatEmvField('60', cleanCity) +
    additionalDataField +
    '6304';

  const crc = crc16(rawPayload);
  return `${rawPayload}${crc}`;
}

/**
 * Generate QR code data URL (PNG)
 */
export async function generateQrCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 280,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Error generating QR code', err);
    return '';
  }
}
