import React from 'react';
import { 
  Play, 
  Pause, 
  Hand, 
  Volume2, 
  VolumeX, 
  FileText,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SessionControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  onPlayPause: () => void;
  onHandRaise: () => void;
  onToggleMute: () => void;
  onTranscript: () => void;
  loading?: boolean;
  className?: string;
}

export function SessionControls({
  isPlaying,
  isMuted,
  onPlayPause,
  onHandRaise,
  onToggleMute,
  onTranscript,
  loading = false,
  className = ''
}: SessionControlsProps) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      {/* Pausar/Retomar */}
      <Button
        size="lg"
        variant="outline"
        onClick={onPlayPause}
        className="w-16 h-16 rounded-2xl bg-white/90 hover:bg-white shadow-lg border-2 border-kid-green/20 hover:border-kid-green/40 transition-all duration-200"
        aria-label={isPlaying ? "Pausar aula" : "Retomar aula"}
        title={isPlaying ? "Pausar aula" : "Retomar aula"}
      >
        {loading ? (
          <Loader2 className="h-8 w-8 text-kid-green animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-8 w-8 text-kid-green" />
        ) : (
          <Play className="h-8 w-8 text-kid-green" />
        )}
      </Button>

      {/* Levantar mão */}
      <Button
        size="lg"
        variant="outline"
        onClick={onHandRaise}
        className="w-16 h-16 rounded-2xl bg-white/90 hover:bg-white shadow-lg border-2 border-kid-blue/20 hover:border-kid-blue/40 transition-all duration-200"
        aria-label="Levantar mão para fazer pergunta"
        title="Levantar mão (H)"
      >
        <Hand className="h-8 w-8 text-kid-blue" />
      </Button>

      {/* Volume on/off */}
      <Button
        size="lg"
        variant="outline"
        onClick={onToggleMute}
        className="w-16 h-16 rounded-2xl bg-white/90 hover:bg-white shadow-lg border-2 border-kid-yellow/20 hover:border-kid-yellow/40 transition-all duration-200"
        aria-label={isMuted ? "Ativar voz" : "Silenciar voz"}
        title={isMuted ? "Ativar voz (M)" : "Silenciar voz (M)"}
      >
        {isMuted ? (
          <VolumeX className="h-8 w-8 text-kid-yellow" />
        ) : (
          <Volume2 className="h-8 w-8 text-kid-yellow" />
        )}
      </Button>

      {/* Transcrição */}
      <Button
        size="lg"
        variant="outline"
        onClick={onTranscript}
        className="w-16 h-16 rounded-2xl bg-white/90 hover:bg-white shadow-lg border-2 border-kid-orange/20 hover:border-kid-orange/40 transition-all duration-200"
        aria-label="Ver transcrição da aula"
        title="Transcrição (T)"
      >
        <FileText className="h-8 w-8 text-kid-orange" />
      </Button>
    </div>
  );
}
