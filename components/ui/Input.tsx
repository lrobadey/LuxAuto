import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-xs text-slate-400 uppercase tracking-wider">{label}</label>}
      <input 
        className={`bg-slate-900/50 border border-slate-700 text-slate-100 p-3 outline-none focus:border-amber-500 transition-colors ${className}`}
        {...props}
      />
    </div>
  );
};