import React from 'react';
import { MessageCircle } from 'lucide-react';

interface SpeechBubbleProps {
  text: string;
  loading?: boolean;
  className?: string;
}

export function SpeechBubble({ text, loading = false, className = '' }: SpeechBubbleProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Balão de fala */}
      <div className="bg-gradient-to-r from-kid-blue/90 to-kid-green/90 text-white rounded-3xl p-6 shadow-2xl border-2 border-white/20 max-w-md">
        {/* Seta do balão apontando para o avatar */}
        <div className="absolute -right-4 top-8 w-0 h-0 border-l-[16px] border-l-kid-blue/90 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent"></div>
        
        {/* Conteúdo do balão */}
        <div className="flex items-start gap-3">
          <MessageCircle className="h-5 w-5 text-white/80 mt-1 flex-shrink-0" />
          <div className="flex-1">
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 bg-white/20 rounded animate-pulse"></div>
                <div className="h-4 bg-white/20 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-white/20 rounded animate-pulse w-1/2"></div>
              </div>
            ) : (
              <p className="text-lg leading-relaxed font-medium">
                {text}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Efeito de brilho */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-50"></div>
    </div>
  );
}
