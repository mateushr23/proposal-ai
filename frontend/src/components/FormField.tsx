"use client";

import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

interface BaseFieldProps {
  label: string;
  error?: string;
  helper?: string;
}

interface InputFieldProps
  extends BaseFieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  as?: "input";
}

interface TextareaFieldProps
  extends BaseFieldProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  as: "textarea";
  rows?: number;
}

type FormFieldProps = InputFieldProps | TextareaFieldProps;

export function FormField(props: FormFieldProps) {
  const generatedId = useId();
  const { label, error, helper, as = "input", ...rest } = props;

  const errorId = error ? `${generatedId}-error` : undefined;
  const helperId = helper ? `${generatedId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;

  const inputClasses = `
    w-full h-11 px-3 text-sm
    bg-white/60 backdrop-blur-sm
    border border-[var(--color-border)]
    rounded-[var(--radius-input)]
    text-[var(--color-foreground)]
    placeholder:text-[var(--color-muted)]
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)]
    ${error ? "border-[var(--color-error)] focus:ring-[var(--color-error)]/20 focus:border-[var(--color-error)]" : ""}
  `;

  const textareaClasses = `
    w-full px-3 py-2.5 text-sm
    bg-white/60 backdrop-blur-sm
    border border-[var(--color-border)]
    rounded-[var(--radius-input)]
    text-[var(--color-foreground)]
    placeholder:text-[var(--color-muted)]
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)]
    resize-y min-h-[80px]
    ${error ? "border-[var(--color-error)] focus:ring-[var(--color-error)]/20 focus:border-[var(--color-error)]" : ""}
  `;

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={generatedId}
        className="text-sm font-medium text-[var(--color-foreground)]"
      >
        {label}
      </label>
      {as === "textarea" ? (
        <textarea
          id={generatedId}
          className={textareaClasses}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={generatedId}
          className={inputClasses}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error && (
        <p id={errorId} className="text-xs text-[var(--color-error)]" role="alert">
          {error}
        </p>
      )}
      {helper && !error && (
        <p id={helperId} className="text-xs text-[var(--color-muted)]">
          {helper}
        </p>
      )}
    </div>
  );
}
