import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-slate-700">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2.5 text-sm rounded-xl border bg-white text-slate-800 placeholder-slate-400 transition-all outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-400 ${
            error ? 'border-red-400 focus:ring-red-400/30 focus:border-red-400' : 'border-slate-200 hover:border-slate-300'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
