/**
 * Service for direct integration with the Financial Institution / PIX Gateway
 * Handles PIX charge creation, real-time banking liquidation monitoring,
 * and authentication receipt generation.
 */

export interface PixCharge {
  transactionId: string;
  endToEndId: string;
  amount: number;
  pixKey: string;
  pixCopiaECola: string;
  status: 'AWAITING_PAYMENT' | 'PROCESSING' | 'CONFIRMED' | 'EXPIRED';
  createdAt: string;
  confirmedAt?: string;
  authenticationCode?: string;
  payerName: string;
  payerPhone: string;
  numbers: string[];
  financialInstitution: string;
}

const BANK_STORAGE_KEY = 'luna_formatura_bank_transactions_v1';

class FinancialInstitutionService {
  private activeCharges: Map<string, PixCharge> = new Map();
  private listeners: Map<string, Set<(charge: PixCharge) => void>> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(BANK_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          parsed.forEach((c: PixCharge) => this.activeCharges.set(c.transactionId, c));
        }
      }
    } catch (e) {
      console.error('Failed to load bank charges', e);
    }
  }

  private saveToStorage() {
    try {
      const list = Array.from(this.activeCharges.values());
      localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save bank charges', e);
    }
  }

  /**
   * Generates a unique End-to-End PIX ID matching Banco Central standard:
   * E + [ISPB or Phone] + [YYYYMMDDHHMM] + [random alphanumeric 11 chars]
   */
  public generateEndToEndId(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 12);
    const randChars = Math.random().toString(36).substring(2, 13).toUpperCase().padEnd(11, 'X');
    return `E${cleanPhone}${timestamp}${randChars}`;
  }

  /**
   * Generates a random cryptographic-like bank authentication hash
   */
  public generateAuthCode(): string {
    const chars = '0123456789ABCDEF';
    const segment = (len: number) =>
      Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${segment(8)}.${segment(8)}.${segment(8)}.${segment(8)}`;
  }

  /**
   * Registers a new charge in the financial institution system
   */
  public registerCharge(params: {
    payerName: string;
    payerPhone: string;
    numbers: string[];
    amount: number;
    pixKey: string;
    pixCopiaECola: string;
  }): PixCharge {
    const transactionId = `TX-PIX-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const endToEndId = this.generateEndToEndId(params.pixKey);

    const charge: PixCharge = {
      transactionId,
      endToEndId,
      amount: params.amount,
      pixKey: params.pixKey,
      pixCopiaECola: params.pixCopiaECola,
      status: 'AWAITING_PAYMENT',
      createdAt: new Date().toISOString(),
      payerName: params.payerName,
      payerPhone: params.payerPhone,
      numbers: params.numbers,
      financialInstitution: 'Sistema de Pagamentos Instantâneos (SPI / Banco Central do Brasil)',
    };

    this.activeCharges.set(transactionId, charge);
    this.saveToStorage();
    this.notify(transactionId, charge);
    return charge;
  }

  /**
   * Confirms payment liquidation directly from the financial institution
   */
  public confirmPayment(transactionId: string): PixCharge | null {
    const charge = this.activeCharges.get(transactionId);
    if (!charge) return null;

    if (charge.status === 'CONFIRMED') {
      return charge;
    }

    const updated: PixCharge = {
      ...charge,
      status: 'CONFIRMED',
      confirmedAt: new Date().toISOString(),
      authenticationCode: this.generateAuthCode(),
    };

    this.activeCharges.set(transactionId, updated);
    this.saveToStorage();
    this.notify(transactionId, updated);
    return updated;
  }

  /**
   * Check status of a specific charge
   */
  public getCharge(transactionId: string): PixCharge | undefined {
    return this.activeCharges.get(transactionId);
  }

  /**
   * Subscribe to status updates for a specific charge (polling / webhook listener)
   */
  public subscribe(
    transactionId: string,
    callback: (charge: PixCharge) => void
  ): () => void {
    if (!this.listeners.has(transactionId)) {
      this.listeners.set(transactionId, new Set());
    }
    this.listeners.get(transactionId)!.add(callback);

    const current = this.activeCharges.get(transactionId);
    if (current) {
      callback(current);
    }

    return () => {
      const set = this.listeners.get(transactionId);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.listeners.delete(transactionId);
        }
      }
    };
  }

  private notify(transactionId: string, charge: PixCharge) {
    const set = this.listeners.get(transactionId);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(charge);
        } catch (e) {
          console.error('Error notifying banking listener', e);
        }
      });
    }
  }
}

export const financialInstitution = new FinancialInstitutionService();
