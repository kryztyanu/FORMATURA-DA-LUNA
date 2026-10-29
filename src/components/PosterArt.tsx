import React from 'react';
import { Calendar, Award, Gift, Sparkles, ChevronDown, CheckCircle2, Flame, Heart } from 'lucide-react';
import { RAFFLE_CONFIG, formatCurrencyBRL } from '../types/raffle';

interface PosterArtProps {
  onChooseNumbersClick: () => void;
  availableCount: number;
  totalSold: number;
}

export const PosterArt: React.FC<PosterArtProps> = ({
  onChooseNumbersClick,
  availableCount,
  totalSold,
}) => {
  return (
    <div className="flex flex-col items-center w-full">
      {/* Dimension & Theme specification badge */}
      <div className="mb-3 flex flex-wrap items-center justify-center gap-2 text-xs text-amber-900 font-medium">
        <span className="bg-amber-100/90 border border-amber-300/80 px-2.5 py-1 rounded-full shadow-2xs flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Formato Oficial: <strong>{RAFFLE_CONFIG.artDimensions.label}</strong> (Proporção {RAFFLE_CONFIG.artDimensions.aspectRatio})</span>
        </span>
        <span className="bg-sky-100/90 border border-sky-300/80 px-2.5 py-1 rounded-full text-sky-900 shadow-2xs">
          Temática Escolar • Faixa Etária 9 Anos
        </span>
      </div>

      {/* 9,144cm x 16,256cm (9:16) Authentic Poster Frame */}
      <div
        className="relative w-full max-w-[420px] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-200/90 bg-gradient-to-b from-amber-50 via-amber-100/40 to-emerald-50 flex flex-col justify-between p-4 sm:p-5 select-none transition-transform hover:scale-[1.005]"
        style={{
          boxShadow: '0 20px 40px -15px rgba(16, 185, 129, 0.25), 0 0 0 1px rgba(245, 158, 11, 0.2)',
        }}
      >
        {/* Playful Notebook Header & Corner Doodles */}
        <div className="absolute top-2 left-2 right-2 flex justify-between pointer-events-none z-10 opacity-70">
          <div className="flex gap-1 text-sm">✏️ 📓 ⭐</div>
          <div className="flex gap-1 text-sm">🎈 🎓 ✨</div>
        </div>

        {/* Top Section: Title & School Graduation Header */}
        <div className="text-center pt-2 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/90 border border-amber-400/60 text-amber-950 text-[11px] font-bold tracking-wide uppercase shadow-xs mb-2">
            <GraduationCapIcon className="w-3.5 h-3.5 text-amber-800" />
            <span>Formatura Escolar • 9 Anos</span>
          </div>

          {/* EXACT TITLE REQUIRED BY USER */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-amber-950 font-display tracking-tight drop-shadow-xs">
            {RAFFLE_CONFIG.title}
          </h1>

          {/* EXACT SUBTITLE REQUIRED BY USER */}
          <div className="mt-1 px-3 py-1.5 bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white font-black text-lg sm:text-xl font-display rounded-2xl shadow-md border-2 border-amber-200 tracking-wide uppercase inline-flex items-center gap-2">
            <Flame className="w-5 h-5 text-yellow-300 animate-bounce" />
            <span>{RAFFLE_CONFIG.subtitle}</span>
          </div>
        </div>

        {/* Center: Main Visual Art Graphic & Prize Badge */}
        <div className="relative my-auto flex flex-col items-center z-10 w-full py-1">
          {/* Main Poster Art Visual */}
          <div className="relative w-full max-h-[260px] sm:max-h-[300px] rounded-2xl overflow-hidden border-2 border-amber-200 shadow-lg bg-white/70">
            <img
              src="/src/assets/images/luna_raffle_poster_1793316300597.jpg"
              alt="Formatura da Luna - Arte oficial temática escolar"
              className="w-full h-full object-cover object-top"
              referrerPolicy="no-referrer"
            />
            {/* Overlay Prize Cutout Badge */}
            <div className="absolute bottom-2 right-2 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md text-white p-1.5 rounded-xl border border-amber-300/60 shadow-xl max-w-[210px]">
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-amber-400">
                <img
                  src="/src/assets/images/kit_churrasco_prize_1793316300287.jpg"
                  alt="Kit Churrasco Completo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="leading-tight text-left">
                <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Prêmio Especial</div>
                <div className="text-xs font-bold text-white">Kit Churrasco Premium</div>
                <div className="text-[10px] text-emerald-300">Tábua, Faca, Garfo, Avental &amp; Temperos</div>
              </div>
            </div>
          </div>

          {/* Quick Draw Details Strip */}
          <div className="grid grid-cols-2 gap-2 w-full mt-2.5">
            <div className="bg-white/90 backdrop-blur-xs rounded-xl p-2 border border-amber-200 text-center shadow-xs">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Data do Sorteio</span>
              </div>
              <div className="text-sm font-extrabold text-slate-900 font-display">
                {RAFFLE_CONFIG.drawDate}
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xs rounded-xl p-2 border border-amber-200 text-center shadow-xs">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-600">
                <Gift className="w-3.5 h-3.5 text-red-500" />
                <span>Valor do Ponto</span>
              </div>
              <div className="text-sm font-extrabold text-emerald-700 font-display">
                {formatCurrencyBRL(RAFFLE_CONFIG.pricePerNumber)}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Official Action Button */}
        <div className="w-full z-10 pt-1 pb-1">
          {/* USER SPECIFIED EXACT BUTTON LABEL: "ESCOLHER NUMEROS" */}
          <button
            onClick={onChooseNumbersClick}
            type="button"
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:scale-[0.98] text-white font-black text-base sm:text-lg font-display tracking-wide uppercase shadow-lg shadow-emerald-700/30 border-2 border-emerald-300 flex items-center justify-center gap-2.5 cursor-pointer transition-all"
          >
            <span>ESCOLHER NÚMEROS</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </button>

          {/* Availability summary */}
          <div className="mt-2 text-center text-[11px] text-slate-600 flex items-center justify-center gap-3">
            <span className="flex items-center gap-1 font-medium text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {availableCount} Disponíveis (Verde)
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1 font-medium text-slate-500">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              {totalSold} Vendidos (X)
            </span>
          </div>
        </div>

        {/* Notebook Tape Effect in Top Corners */}
        <div className="absolute -top-3 left-10 w-16 h-6 bg-amber-200/80 -rotate-6 border border-amber-300/70 opacity-80 pointer-events-none"></div>
        <div className="absolute -top-3 right-10 w-16 h-6 bg-amber-200/80 rotate-6 border border-amber-300/70 opacity-80 pointer-events-none"></div>
      </div>
    </div>
  );
};

function GraduationCapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}
