import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Play, Pause, Sparkles } from 'lucide-react';
import { schoolSoundtrack } from '../utils/audio';

export const SoundtrackBar: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.3); // Exactly 30% volume
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  useEffect(() => {
    const unsub = schoolSoundtrack.subscribe((playing, vol) => {
      setIsPlaying(playing);
      setVolume(vol);
    });
    return () => {
      unsub();
    };
  }, []);

  const handleToggle = async () => {
    setHasInteracted(true);
    if (!isPlaying) {
      await schoolSoundtrack.start();
    } else {
      schoolSoundtrack.stop();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    schoolSoundtrack.setVolume(newVol);
  };

  return (
    <div className="bg-amber-100/90 border border-amber-200/80 rounded-2xl px-4 py-2.5 shadow-sm backdrop-blur-sm flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isPlaying ? 'bg-emerald-600 text-white animate-pulse' : 'bg-amber-200 text-amber-900'}`}>
          <Music className="w-4 h-4" />
        </div>
        <div>
          <div className="font-semibold text-slate-800 flex items-center gap-1.5 font-display text-sm">
            <span>Trilha Musical Escolar</span>
            <span className="text-[10px] font-sans font-medium px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Volume: {Math.round(volume * 100)}%
            </span>
          </div>
          <p className="text-[11px] text-slate-600">Melodia infantil alegre (Xilofone &amp; Marimba)</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Volume Slider */}
        <div className="flex items-center gap-2">
          {volume === 0 ? (
            <VolumeX className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
          )}
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            aria-label="Controle de volume da música"
            className="w-20 sm:w-24 h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={handleToggle}
          type="button"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all shadow-sm ${
            isPlaying
              ? 'bg-emerald-700 text-white hover:bg-emerald-800'
              : 'bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-md'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pausar Música</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Ouvir Trilha (30%)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
