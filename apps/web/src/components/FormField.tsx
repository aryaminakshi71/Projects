import React from "react";

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "number" | "textarea" | "select";
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  rows?: number;
  className?: string;
}

export function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  options = [],
  rows = 4,
  className = "",
}: FormFieldProps) {
  const baseInputClasses = `
    w-full px-3 py-2 border rounded-md
    focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary
    disabled:bg-muted disabled:cursor-not-allowed
    ${error ? "border-destructive" : "border-border"}
    bg-background text-foreground
    ${className}
  `;

  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-foreground mb-1"
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>

      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          className={baseInputClasses}
        />
      ) : type === "select" ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={baseInputClasses}
        >
          <option value="">{placeholder || "Select an option"}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={baseInputClasses}
        />
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
