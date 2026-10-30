import React from 'react';
import { generateNumbersList } from '../types/raffle';
import { schoolSoundtrack } from '../utils/audio';

interface NumbersGridProps {
  selectedNumbers: string[];
  paidNumbersMap: Map<string, { name: string; phone: string }>;
  onToggleNumber: (num: string) => void;
}

export const NumbersGrid: React.FC<NumbersGridProps> = ({
  selectedNumbers,
  paidNumbersMap,
  onToggleNumber,
}) => {
  const allNumbers = generateNumbersList(); // 100 sequential numbers from "00" to "99"

  const handleNumberClick = (num: string) => {
    if (paidNumbersMap.has(num)) {
      // Inaccessible
      return;
    }
    const isCurrentlySelected = selectedNumbers.includes(num);
    schoolSoundtrack.playClickSound(!isCurrentlySelected);
    onToggleNumber(num);
  };

  return (
    <div id="painel-numeros" className="w-full max-w-3xl mx-auto px-2">
      {/* 100 sequential number buttons from 00 to 99 */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-2.5 p-3 sm:p-4 bg-white/95 backdrop-blur-sm rounded-3xl border border-amber-200/90 shadow-xl">
        {allNumbers.map((num) => {
          const isPaid = paidNumbersMap.has(num);
          const isSelected = selectedNumbers.includes(num);

          if (isPaid) {
            // INACESSÍVEL / PAGO (Stylized X marking as requested)
            return (
              <button
                key={num}
                type="button"
                disabled
                aria-label={`Número ${num} pago`}
                className="relative h-12 sm:h-14 rounded-2xl bg-slate-200/85 text-slate-400 border border-slate-300 cursor-not-allowed select-none flex items-center justify-center overflow-hidden shadow-inner"
              >
                {/* Stylized prominent X */}
                <span className="absolute inset-0 flex items-center justify-center text-rose-600 font-black text-2xl sm:text-3xl opacity-85 select-none pointer-events-none drop-shadow-xs rotate-6">
                  ✕
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-400 line-through decoration-rose-500/80 decoration-2">
                  {num}
                </span>
              </button>
            );
          }

          if (isSelected) {
            // VERDE ESCURA (Selected by user as requested)
            return (
              <button
                key={num}
                type="button"
                onClick={() => handleNumberClick(num)}
                aria-label={`Número ${num} selecionado`}
                className="relative h-12 sm:h-14 rounded-2xl bg-emerald-950 text-white hover:bg-emerald-900 border-2 border-emerald-400 shadow-md ring-2 ring-emerald-300 font-black text-base sm:text-lg font-display flex items-center justify-center transition-all cursor-pointer scale-105 z-10"
              >
                <span>{num}</span>
              </button>
            );
          }

          // VERDE (Available for selection as requested)
          return (
            <button
              key={num}
              type="button"
              onClick={() => handleNumberClick(num)}
              aria-label={`Número ${num} disponível`}
              className="relative h-12 sm:h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 active:scale-95 text-white border border-emerald-400 shadow-sm hover:shadow-md font-black text-base sm:text-lg font-display flex items-center justify-center transition-all cursor-pointer"
            >
              <span className="drop-shadow-2xs">{num}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
