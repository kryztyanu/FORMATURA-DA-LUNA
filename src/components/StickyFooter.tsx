import React from 'react';
import { CreditCard, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { RAFFLE_CONFIG, formatCurrencyBRL } from '../types/raffle';

interface StickyFooterProps {
  selectedNumbers: string[];
  onOpenPaymentDialog: () => void;
  onScrollToNumbers: () => void;
}

export const StickyFooter: React.FC<StickyFooterProps> = ({
  selectedNumbers,
  onOpenPaymentDialog,
  onScrollToNumbers,
}) => {
  const count = selectedNumbers.length;
  const totalAmount = count * RAFFLE_CONFIG.pricePerNumber;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl py-3 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Selection details */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 text-emerald-800">
            <ShoppingBag className="w-5 h-5" />
          </div>

          <div className="min-w-0 leading-tight">
            {count > 0 ? (
              <>
                <div className="text-xs text-slate-500 font-medium">
                  {count} {count === 1 ? 'número selecionado' : 'números selecionados'}
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900 font-display flex items-center gap-2">
                  <span>{formatCurrencyBRL(totalAmount)}</span>
                  <span className="text-[11px] font-sans font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 hidden sm:inline-block truncate max-w-[180px]">
                    Nº {selectedNumbers.slice(0, 5).join(', ')}{selectedNumbers.length > 5 ? '...' : ''}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="text-xs text-slate-500">Nenhum número selecionado</div>
                <div className="text-sm font-bold text-slate-800">R$ 10,00 cada ponto</div>
              </>
            )}
          </div>
        </div>

        {/* Right: EXACT REQUIRED BUTTON "PAGAR" */}
        <div className="shrink-0">
          {count > 0 ? (
            <button
              onClick={onOpenPaymentDialog}
              type="button"
              className="py-3 px-6 sm:px-8 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:scale-[0.98] text-white font-black text-base sm:text-lg font-display tracking-wider uppercase shadow-lg shadow-emerald-700/30 border-2 border-emerald-300 flex items-center gap-2.5 cursor-pointer transition-all animate-pulse hover:animate-none"
            >
              <span>PAGAR</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onScrollToNumbers}
              type="button"
              className="py-2.5 px-4 sm:px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors border border-slate-300 flex items-center gap-2"
            >
              <span>Escolher Números</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
