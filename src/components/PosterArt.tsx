import React from 'react';

interface PosterArtProps {
  onChooseNumbersClick: () => void;
}

export const PosterArt: React.FC<PosterArtProps> = ({
  onChooseNumbersClick,
}) => {
  return (
    <div className="flex flex-col items-center w-full">
      {/* 9,144cm x 16,256cm (9:16) Authentic Poster Frame */}
      <div
        className="relative w-full max-w-[440px] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 bg-amber-100 flex flex-col justify-end select-none transition-transform"
        style={{
          boxShadow: '0 25px 50px -12px rgba(245, 158, 11, 0.35), 0 0 0 1px rgba(245, 158, 11, 0.3)',
        }}
      >
        {/* The Exact User Artwork as the First Screen */}
        <img
          src="/assets/aistudio/Rifa_de_Formatura_Escolar_da_Luna_de429944.png"
          alt="Rifa de Formatura da Luna - Concorra a um Kit Churrasco"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          referrerPolicy="no-referrer"
        />

        {/* Clickable interactive button positioned directly over the artwork's printed "ESCOLHER NUMEROS" button */}
        <button
          onClick={onChooseNumbersClick}
          type="button"
          aria-label="Escolher Números"
          title="Clique para escolher seus números da sorte de 00 a 99"
          className="absolute bottom-[4.2%] left-1/2 -translate-x-1/2 w-[74%] h-[7.2%] rounded-full cursor-pointer z-30 group/btn focus:outline-none focus:ring-4 focus:ring-yellow-300"
        >
          <span className="sr-only">ESCOLHER NÚMEROS</span>
          {/* Subtle interactive hover shimmer indicator and tactile feedback */}
          <span className="absolute -inset-1 rounded-full border-2 border-yellow-300/80 opacity-0 group-hover/btn:opacity-100 group-focus/btn:opacity-100 transition-opacity animate-pulse pointer-events-none"></span>
          <span className="absolute inset-0 rounded-full bg-white/0 group-hover/btn:bg-white/20 active:bg-black/15 transition-colors pointer-events-none"></span>
        </button>
      </div>
    </div>
  );
};
