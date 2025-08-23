import React from 'react';

interface TeacherAvatarProps {
  src?: string;
  className?: string;
}

export function TeacherAvatar({ src, className = '' }: TeacherAvatarProps) {
  const defaultAvatar = '/branding/teacher-avatar-default.png';
  const avatarSrc = src || defaultAvatar;

  return (
    <div className={`relative ${className}`}>
      {/* Avatar principal */}
      <div className="w-32 h-32 rounded-full overflow-hidden shadow-2xl border-4 border-white/20 bg-gradient-to-br from-kid-green/20 to-kid-blue/20">
        <img
          src={avatarSrc}
          alt="Professor Avatar"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback para avatar padrão se a imagem falhar
            const target = e.target as HTMLImageElement;
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiByeD0iNjQiIGZpbGw9IiM0Q0Y1NjEiLz4KPGNpcmNsZSBjeD0iNjQiIGN5PSI0OCIgcj0iMjQiIGZpbGw9IiNGRkYiLz4KPHBhdGggZD0iTTI0IDk2QzI0IDc2LjQ4IDM5LjQ4IDYxIDU5IDYxSDY5Qzg4LjUyIDYxIDEwNCA3Ni40OCAxMDQgOTZWMTA0SDI0Vjk2WiIgZmlsbD0iI0ZGRiIvPgo8L3N2Zz4K';
          }}
        />
      </div>
      
      {/* Efeito de brilho */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-pulse"></div>
      
      {/* Indicador de fala */}
      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-kid-green rounded-full flex items-center justify-center shadow-lg">
        <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}
