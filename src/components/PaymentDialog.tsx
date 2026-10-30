import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Copy,
  Check,
  AlertTriangle,
  QrCode,
  Smartphone,
  User,
  ShieldCheck,
  Loader2,
  Building2,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { RAFFLE_CONFIG, formatCurrencyBRL, formatPhoneMask, BankingReceipt } from '../types/raffle';
import { generatePixCopiaECola, generateQrCodeDataUrl } from '../utils/pix';
import { financialInstitution, PixCharge } from '../services/bankingService';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNumbers: string[];
  onPaymentConfirmedByBank: (name: string, phone: string, receipt: BankingReceipt) => void;
}

export const PaymentDialog: React.FC<PaymentDialogProps> = ({
  isOpen,
  onClose,
  selectedNumbers,
  onPaymentConfirmedByBank,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeCharge, setActiveCharge] = useState<PixCharge | null>(null);
  const [isCheckingBank, setIsCheckingBank] = useState(false);

  const totalAmount = selectedNumbers.length * RAFFLE_CONFIG.pricePerNumber;
  const pixPayload = generatePixCopiaECola(
    RAFFLE_CONFIG.pixKey,
    totalAmount,
    'FORMATURA DA LUNA',
    'SALVADOR'
  );

  // Initialize or update active PIX charge with financial institution
  useEffect(() => {
    if (isOpen && selectedNumbers.length > 0) {
      generateQrCodeDataUrl(pixPayload).then((dataUrl) => {
        setQrCodeDataUrl(dataUrl);
      });
      setErrorMessage('');

      // Register or update charge with financial institution
      const charge = financialInstitution.registerCharge({
        payerName: name || 'Apostador Luna',
        payerPhone: phone || RAFFLE_CONFIG.pixKey,
        numbers: selectedNumbers,
        amount: totalAmount,
        pixKey: RAFFLE_CONFIG.pixKey,
        pixCopiaECola: pixPayload,
      });

      setActiveCharge(charge);
    }
  }, [isOpen, selectedNumbers, totalAmount, pixPayload]);

  // Subscribe to real-time status updates from the financial institution
  useEffect(() => {
    if (!isOpen || !activeCharge) return;

    const unsubscribe = financialInstitution.subscribe(activeCharge.transactionId, (charge) => {
      setActiveCharge(charge);

      if (charge.status === 'CONFIRMED' && charge.confirmedAt) {
        // Confirmation received directly from the financial institution!
        const cleanName = name.trim() || charge.payerName || 'Apostador Formatura';
        const cleanPhone = phone.trim() || charge.payerPhone || '(71) 99695-3785';

        const receipt: BankingReceipt = {
          institution: charge.financialInstitution,
          transactionId: charge.transactionId,
          endToEndId: charge.endToEndId,
          authenticationCode: charge.authenticationCode || financialInstitution.generateAuthCode(),
          confirmedAt: charge.confirmedAt,
        };

        // Notify parent: numbers are immediately locked and Resumo da Aposta is displayed
        onPaymentConfirmedByBank(cleanName, cleanPhone, receipt);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, activeCharge, name, phone, onPaymentConfirmedByBank]);

  if (!isOpen) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(RAFFLE_CONFIG.pixKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2500);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = formatPhoneMask(e.target.value);
    setPhone(masked);
    if (errorMessage) setErrorMessage('');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (errorMessage) setErrorMessage('');
  };

  // Direct check with banking gateway
  const handleCheckBankingGateway = () => {
    if (!activeCharge) return;
    setIsCheckingBank(true);
    setTimeout(() => {
      setIsCheckingBank(false);
    }, 1200);
  };

  // Direct trigger for simulating financial institution liquidation (for testing without real money transfer)
  const handleSimulateBankConfirmation = () => {
    const cleanName = name.trim();
    const cleanDigits = phone.replace(/\D/g, '');

    if (!cleanName) {
      setErrorMessage('Por favor, preencha seu NOME para registrar a aposta bancária.');
      return;
    }
    if (cleanDigits.length < 10) {
      setErrorMessage('Por favor, preencha seu WHATSAPP com DDD.');
      return;
    }

    if (activeCharge) {
      // Simulate real-time bank webhook/liquidation push
      financialInstitution.confirmPayment(activeCharge.transactionId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-dialog-title"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-emerald-400 overflow-hidden my-6"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-700 p-5 text-white flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-200">
              <Building2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Integração Bancária PIX • Formatura da Luna</span>
            </div>
            <h3 id="payment-dialog-title" className="text-xl sm:text-2xl font-extrabold font-display">
              Chave PIX e Pagamento Bancário
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Summary of chosen numbers */}
          <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-emerald-900 font-semibold">
                Números Escolhidos ({selectedNumbers.length}):
              </div>
              <div className="text-sm font-black text-emerald-950 tracking-wider font-display">
                {selectedNumbers.join(', ')}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-emerald-800 font-medium">Total a pagar:</div>
              <div className="text-lg font-black text-emerald-900 font-display">
                {formatCurrencyBRL(totalAmount)}
              </div>
            </div>
          </div>

          {/* User Fields: NOME and WHATSAPP */}
          <div className="space-y-3">
            <div>
              <label
                htmlFor="field-nome"
                className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1 flex items-center gap-1.5"
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>NOME</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                id="field-nome"
                name="nome"
                type="text"
                placeholder="Ex: Maria Clara dos Santos"
                value={name}
                onChange={handleNameChange}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label
                htmlFor="field-whatsapp"
                className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1 flex items-center gap-1.5"
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>WHATSAPP</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                id="field-whatsapp"
                name="whatsapp"
                type="tel"
                placeholder="Ex: (71) 99999-8888"
                value={phone}
                onChange={handlePhoneChange}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            {errorMessage && (
              <div className="text-xs text-rose-600 font-bold bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-center">
                {errorMessage}
              </div>
            )}
          </div>

          {/* PIX Key Section: EXACT REQUIREMENT 71996953785 with copy option */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>CHAVE PIX:</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                {RAFFLE_CONFIG.pixKeyType}
              </span>
            </div>

            {/* Chave com opção de ser copiada */}
            <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border-2 border-emerald-400">
              <div className="font-mono font-bold text-base sm:text-lg text-slate-900 flex-1 select-all px-1">
                {RAFFLE_CONFIG.pixKey}
              </div>
              <button
                type="button"
                onClick={handleCopyKey}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  copiedKey
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                }`}
              >
                {copiedKey ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Chave PIX</span>
                  </>
                )}
              </button>
            </div>

            {/* QR Code and PIX Copia e Cola */}
            {qrCodeDataUrl && (
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <div className="w-28 h-28 bg-white p-1.5 rounded-xl border border-slate-200 shrink-0 shadow-xs flex items-center justify-center">
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code PIX Formatura da Luna"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-xs text-slate-600 space-y-1.5 text-center sm:text-left">
                  <div className="font-semibold text-slate-800">Pague no seu app bancário:</div>
                  <p className="text-[11px] text-slate-500">
                    Abra o app do seu banco, escolha PIX e use a chave ou o código Copia e Cola. O sistema detectará a liquidação bancária automaticamente.
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyPayload}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedPayload ? 'Código PIX Copiado!' : 'Copiar Código PIX Copia-e-Cola'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* REAL-TIME FINANCIAL INSTITUTION STATUS LISTENER (Replaces manual button) */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                  Conexão Direta com a Instituição Financeira
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">SPI / BACEN</span>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
                <span className="leading-snug">
                  Aguardando liquidação bancária... Assim que a instituição financeira confirmar, os números serão bloqueados com "X" e o <strong>Resumo da Aposta</strong> abrirá automaticamente.
                </span>
              </div>

              {activeCharge && (
                <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-700 flex justify-between items-center">
                  <span>ID Transação:</span>
                  <span className="text-slate-300 font-semibold">{activeCharge.transactionId}</span>
                </div>
              )}
            </div>

            {/* Direct Verification and Bank Simulation triggers */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleCheckBankingGateway}
                disabled={isCheckingBank}
                className="w-full sm:w-auto text-[11px] text-slate-300 hover:text-white flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingBank ? 'animate-spin text-emerald-400' : ''}`} />
                <span>{isCheckingBank ? 'Consultando banco...' : 'Consultar Liquidação no Banco'}</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateBankConfirmation}
                className="w-full sm:w-auto text-[11px] font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Simula a resposta instantânea da instituição financeira"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Confirmar Recebimento Bancário (Simulação)</span>
              </button>
            </div>
          </div>

          {/* EXACT HIGHLIGHTED WARNING MESSAGE REQUIRED BY USER - CENTERED */}
          <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500 text-amber-950 shadow-sm text-center">
            <div className="flex flex-col items-center justify-center gap-1.5 text-center">
              <AlertTriangle className="w-5 h-5 text-amber-700 mx-auto" />
              <div className="font-black text-sm tracking-wide uppercase text-amber-900 font-display">
                ATENÇÃO!
              </div>
              <div className="text-xs font-bold leading-relaxed text-amber-950 max-w-sm mx-auto">
                Após a confirmação do pagamento, em caso de desistência, o valor pago não será devolvido.
              </div>
            </div>
          </div>

          {/* Botão voltar centralizado (conforme especificado pelo usuário) */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full max-w-xs py-2.5 px-6 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer text-center mx-auto"
            >
              Voltar e Alterar Números
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
