
import React, { ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text }) => {
  return (
    <div className="relative flex items-center group">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-sm text-center
        bg-black/70 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300
        pointer-events-none z-10 backdrop-blur-sm">
        {text}
      </div>
    </div>
  );
};

export default Tooltip;
