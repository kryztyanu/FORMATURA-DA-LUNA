export interface BankingReceipt {
  institution: string;
  transactionId: string;
  endToEndId: string;
  authenticationCode: string;
  confirmedAt: string;
}

export interface BetRecord {
  id: string;
  name: string;
  phone: string;
  numbers: string[];
  totalAmount: number;
  paidAt: string;
  txHash?: string;
  banking?: BankingReceipt;
}

export const RAFFLE_CONFIG = {
  title: 'FORMATURA DA LUNA',
  subtitle: 'Concorra a um KIT CHURRASCO!',
  drawDate: '29/11/2026',
  pixKey: '71984791666',
  pixKeyType: 'Telefone (Celular)',
  pixRecipient: 'Luna / Responsável (Formatura da Luna)',
  organizerPhone: '5571991610882',
  organizerPhoneDisplay: '(71) 99161-0882',
  pricePerNumber: 10.00,
  totalNumbers: 100, // 00 to 99
  artDimensions: {
    widthCm: 9.144,
    heightCm: 16.256,
    aspectRatio: '9:16',
    label: '9,144cm × 16,256cm',
  },
};

/**
 * Generate formatted array of numbers from "00" to "99"
 */
export function generateNumbersList(): string[] {
  return Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'));
}

/**
 * Format currency to Brazilian Real: R$ XX,XX
 */
export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Clean phone string for wa.me links
 */
export function cleanPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length >= 12) {
    return digits;
  }
  if (digits.length >= 10) {
    return `55${digits}`;
  }
  return digits;
}

/**
 * Phone mask formatter: (71) 99695-3785
 */
export function formatPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Build exact message for apostador as requested:
 * FORMATURA DA LUNA
 * Sorteio: 29/11/2026
 * Números escolhidos: (exibir os numeros referentes aos botoes escolhidos)
 * Valor Pago: R$ (exibir o montato total pago referente aos botoes escolhidos)
 * Obrigado por participar, BOA SORTE!
 */
export function buildApostadorConfirmationMessage(
  numbers: string[],
  totalAmount: number
): string {
  const sortedNumbers = [...numbers].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  return `FORMATURA DA LUNA
Sorteio: ${RAFFLE_CONFIG.drawDate}
Números escolhidos: ${sortedNumbers.join(', ')}
Valor Pago: ${formatCurrencyBRL(totalAmount)}
Obrigado por participar, BOA SORTE!`;
}

/**
 * Build exact message for organizer WhatsApp (71) 99695-3785 as requested:
 * NOME DO APOSTADOR: ...
 * WHATSAPP DO APOSTADOR: ...
 * Números escolhidos: (exibir os numeros referentes aos botoes escolhidos)
 * Valor Pago: R$ (exibir o montato total pago referente aos botoes escolhidos)
 */
export function buildOrganizerNotificationMessage(
  name: string,
  phone: string,
  numbers: string[]
): string {
  const sortedNumbers = [...numbers].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  return `*RIFA DE FORMATURA DA LUNA*
*Nome do Apostador:* ${name.trim()}
*Whatspp do Apostador:* ${phone.trim()}
*Números escolhidos:* ${sortedNumbers.join(', ')}`;
}
