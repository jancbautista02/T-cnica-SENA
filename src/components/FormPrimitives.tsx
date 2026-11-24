import React from 'react';

export const FieldLabel: React.FC<{
  label: string;
  required?: boolean;
  hint?: string;
}> = ({ label, required, hint }) => (
  <div className="flex items-baseline justify-between gap-2 mb-1">
    <label className="text-xs font-medium text-[#2F2B3D]">
      {label}
      {required && <span className="text-[#DC2626] ml-0.5">*</span>}
    </label>
    {hint && <span className="text-[11px] text-[#6B6580]">{hint}</span>}
  </div>
);

export const TextInput: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & { label: string; required?: boolean; hint?: string }
> = ({ label, required, hint, className = '', ...props }) => (
  <div>
    <FieldLabel label={label} required={required} hint={hint} />
    <input
      {...props}
      className={`w-full px-3 py-2 text-sm bg-white border border-[#DCD8E6] rounded-md text-[#181622] placeholder:text-[#9892AA] focus:outline-none focus:border-[#5B2E7A] focus:ring-2 focus:ring-[#5B2E7A]/15 transition-colors ${className}`}
    />
  </div>
);

export const SelectInput: React.FC<
  React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; required?: boolean; hint?: string }
> = ({ label, required, hint, children, className = '', ...props }) => (
  <div>
    <FieldLabel label={label} required={required} hint={hint} />
    <select
      {...props}
      className={`w-full px-3 py-2 text-sm bg-white border border-[#DCD8E6] rounded-md text-[#181622] focus:outline-none focus:border-[#5B2E7A] focus:ring-2 focus:ring-[#5B2E7A]/15 transition-colors ${className}`}
    >
      {children}
    </select>
  </div>
);

export const TextAreaInput: React.FC<
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: string;
    required?: boolean;
    hint?: string;
    rightAction?: React.ReactNode;
  }
> = ({ label, required, hint, rightAction, className = '', ...props }) => (
  <div>
    <div className="flex items-center justify-between gap-2 mb-1">
      <div className="flex items-baseline gap-2">
        <label className="text-xs font-medium text-[#2F2B3D]">
          {label}
          {required && <span className="text-[#DC2626] ml-0.5">*</span>}
        </label>
        {hint && <span className="text-[11px] text-[#6B6580]">{hint}</span>}
      </div>
      {rightAction}
    </div>
    <textarea
      {...props}
      className={`w-full px-3 py-2 text-sm bg-white border border-[#DCD8E6] rounded-md text-[#181622] placeholder:text-[#9892AA] focus:outline-none focus:border-[#5B2E7A] focus:ring-2 focus:ring-[#5B2E7A]/15 transition-colors leading-relaxed ${className}`}
    />
  </div>
);

export const FormSection: React.FC<{
  stepNumber?: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ stepNumber, title, description, children }) => (
  <section className="bg-white border border-[#E4E2EC] rounded-lg p-4 space-y-3.5">
    <div className="border-b border-[#F0EEF5] pb-2.5">
      <h3 className="text-sm font-semibold text-[#181622]">
        {stepNumber !== undefined ? `${stepNumber}. ${title}` : title}
      </h3>
      {description && <p className="text-xs text-[#6B6580] mt-0.5">{description}</p>}
    </div>
    {children}
  </section>
);
