import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = [
    "px-6 py-3 rounded-none",
    "font-serif tracking-widest text-sm uppercase",
    "transition-all duration-300",
    "flex items-center justify-center gap-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
    "active:translate-y-px",
  ].join(" ");
  
  const variants = {
    primary: [
      "bg-amber-500 text-black font-bold",
      "hover:bg-amber-400",
      "shadow-[0_0_0_1px_rgba(245,158,11,0.25)] hover:shadow-[0_18px_50px_-25px_rgba(245,158,11,0.55)]",
    ].join(" "),
    secondary: [
      "bg-slate-800 text-white",
      "hover:bg-slate-700",
      "shadow-[0_0_0_1px_rgba(255,255,255,0.06)] hover:shadow-[0_18px_50px_-30px_rgba(2,6,23,0.9)]",
    ].join(" "),
    outline: [
      "border border-amber-500/50 text-amber-500",
      "hover:bg-amber-500/10 hover:border-amber-400/70 hover:text-amber-400",
    ].join(" "),
    ghost: [
      "text-slate-400",
      "hover:text-white hover:bg-white/5",
    ].join(" ")
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
