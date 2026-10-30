/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { PosterArt } from './components/PosterArt';
import { NumbersGrid } from './components/NumbersGrid';
import { StickyFooter } from './components/StickyFooter';
import { PaymentDialog } from './components/PaymentDialog';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { BetRecord, RAFFLE_CONFIG } from './types/raffle';
import { schoolSoundtrack } from './utils/audio';

const STORAGE_KEY = 'luna_formatura_rifa_bets_v1';

// All 100 buttons start 100% available/eligible, getting an 'X' only when chosen and paid
const INITIAL_BETS: BetRecord[] = [];

export default function App() {
  // Screen state: 'poster' (first screen) or 'numbers' (second screen, shown only after clicking ESCOLHER NUMEROS)
  const [currentScreen, setCurrentScreen] = useState<'poster' | 'numbers'>('poster');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [bets, setBets] = useState<BetRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // If previous mock bets were stored, filter them out so only genuine user bets exist
          return parsed.filter((b: BetRecord) => !b.id.startsWith('bet-init-'));
        }
      }
    } catch (e) {
      console.error('Failed to load saved bets', e);
    }
    return INITIAL_BETS;
  });

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [lastConfirmedBet, setLastConfirmedBet] = useState<BetRecord | null>(null);

  // Automatic audio start on app launch (volume 30%) with user gesture fallback for browser policy
  const audioStartedRef = useRef(false);

  useEffect(() => {
    const unsub = schoolSoundtrack.subscribe((playing) => {
      setIsAudioPlaying(playing);
    });

    // Start playback immediately at 30% volume
    schoolSoundtrack.setVolume(0.3);
    schoolSoundtrack.start();

    // Fallback for browsers with strict autoplay policies:
    // Any click, tap or keypress synchronously resumes/starts the audio pipeline
    const handleSynchronousGesture = () => {
      schoolSoundtrack.setVolume(0.3);
      schoolSoundtrack.start();
    };

    const events = ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown', 'mousedown'];
    events.forEach((evt) => {
      window.addEventListener(evt, handleSynchronousGesture, { capture: true, passive: true });
      document.addEventListener(evt, handleSynchronousGesture, { capture: true, passive: true });
    });

    return () => {
      unsub();
      events.forEach((evt) => {
        window.removeEventListener(evt, handleSynchronousGesture, true);
        document.removeEventListener(evt, handleSynchronousGesture, true);
      });
    };
  }, []);

  // Sync bets to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bets));
    } catch (e) {
      console.error('Failed to save bets', e);
    }
  }, [bets]);

  // Fast map of paid numbers -> apostador info
  const paidNumbersMap = useMemo(() => {
    const map = new Map<string, { name: string; phone: string }>();
    bets.forEach((bet) => {
      bet.numbers.forEach((num) => {
        map.set(num, { name: bet.name, phone: bet.phone });
      });
    });
    return map;
  }, [bets]);

  // Toggle selection for a single number button
  const handleToggleNumber = (num: string) => {
    if (paidNumbersMap.has(num)) return; // Inaccessible
    setSelectedNumbers((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  // Called when user clicks "ESCOLHER NUMEROS" on the first screen
  const handleChooseNumbers = () => {
    // Explicitly start audio on this user gesture
    schoolSoundtrack.setVolume(0.3);
    schoolSoundtrack.start();
    audioStartedRef.current = true;

    setCurrentScreen('numbers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToPoster = () => {
    // Return to start screen and undo chosen numbers
    setSelectedNumbers([]);
    setCurrentScreen('poster');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPayment = () => {
    if (selectedNumbers.length === 0) return;
    setIsPaymentOpen(true);
  };

  // Confirmation of payment
  const handleConfirmPayment = (name: string, phone: string) => {
    const totalAmount = selectedNumbers.length * RAFFLE_CONFIG.pricePerNumber;
    const newBet: BetRecord = {
      id: `bet-${Date.now()}`,
      name,
      phone,
      numbers: [...selectedNumbers],
      totalAmount,
      paidAt: new Date().toISOString(),
    };

    setBets((prev) => [newBet, ...prev]);
    setLastConfirmedBet(newBet);
    setSelectedNumbers([]);
    setIsPaymentOpen(false);
    setIsConfirmationOpen(true);
  };

  return (
    <div className="min-h-screen bg-notebook-pattern pb-28 text-slate-800 flex flex-col items-center justify-start p-3 sm:p-5 relative">
      {/* Discreet floating soundtrack toggle in top corner */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          schoolSoundtrack.toggle();
        }}
        aria-label={isAudioPlaying ? 'Silenciar trilha sonora' : 'Tocar trilha sonora'}
        title={isAudioPlaying ? 'Silenciar trilha sonora (30%)' : 'Tocar trilha sonora (30%)'}
        className={`fixed top-3 right-3 z-50 w-9 h-9 rounded-full shadow-md border flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 ${
          isAudioPlaying
            ? 'bg-white/90 hover:bg-white text-emerald-600 border-slate-200'
            : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300'
        }`}
      >
        {isAudioPlaying ? (
          <Volume2 className="w-4 h-4 text-emerald-600" />
        ) : (
          <VolumeX className="w-4 h-4 text-amber-700" />
        )}
      </button>

      {/* SCREEN 1: First screen showing only the authentic raffle art */}
      {currentScreen === 'poster' && (
        <main className="w-full max-w-md mx-auto flex flex-col items-center justify-center my-auto">
          <PosterArt onChooseNumbersClick={handleChooseNumbers} />
        </main>
      )}

      {/* SCREEN 2: Second screen showing ONLY the 100 number buttons for selection */}
      {currentScreen === 'numbers' && (
        <main className="w-full max-w-3xl mx-auto flex flex-col items-center pt-2">
          {/* Back button to return to start screen and undo selections */}
          <div className="w-full flex justify-start mb-3 px-2">
            <button
              onClick={handleBackToPoster}
              type="button"
              className="px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-300 shadow-sm text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>
          </div>

          {/* Contains ONLY the 100 buttons with their respective numbers (00 to 99) */}
          <NumbersGrid
            selectedNumbers={selectedNumbers}
            paidNumbersMap={paidNumbersMap}
            onToggleNumber={handleToggleNumber}
          />
        </main>
      )}

      {/* Sticky Bottom Footer with PAGAR Button (active on the numbers screen) */}
      {currentScreen === 'numbers' && (
        <StickyFooter
          selectedNumbers={selectedNumbers}
          onOpenPaymentDialog={handleOpenPayment}
          onScrollToNumbers={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        />
      )}

      {/* Payment Dialog with NOME, WHATSAPP, PIX 71996953785 and centered ATENÇÃO warning */}
      <PaymentDialog
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        selectedNumbers={selectedNumbers}
        onConfirmPayment={handleConfirmPayment}
      />

      {/* Confirmation Dialog after payment */}
      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        bet={lastConfirmedBet}
      />
    </div>
  );
}
