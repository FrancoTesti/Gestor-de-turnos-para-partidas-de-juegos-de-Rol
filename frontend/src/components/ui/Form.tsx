import React from 'react';
import './Form.css';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'email' | 'number' | 'textarea' | 'select';
  required?: boolean;
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  options?: Array<{ value: string; label: string }>;
  error?: string;
}

interface FormProps {
  fields: FormField[];
  onSubmit: (e: React.FormEvent) => void;
  submitText?: string;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function Form({
  fields,
  onSubmit,
  submitText = 'Guardar',
  onCancel,
  isLoading = false,
}: FormProps) {
  return (
    <form className="form" onSubmit={onSubmit}>
      {fields.map((field) => (
        <div key={field.name} className="form-group">
          <label htmlFor={field.name} className="form-label">
            {field.label}
            {field.required && <span className="required">*</span>}
          </label>

          {field.type === 'textarea' ? (
            <textarea
              id={field.name}
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              placeholder={field.placeholder}
              required={field.required}
              className={`form-input ${field.error ? 'error' : ''}`}
              rows={4}
            />
          ) : field.type === 'select' ? (
            <select
              id={field.name}
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              required={field.required}
              className={`form-input ${field.error ? 'error' : ''}`}
            >
              <option value="">Seleccionar...</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              value={field.value}
              onChange={field.onChange}
              placeholder={field.placeholder}
              required={field.required}
              className={`form-input ${field.error ? 'error' : ''}`}
            />
          )}

          {field.error && <span className="form-error">{field.error}</span>}
        </div>
      ))}

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Guardando...' : submitText}
        </button>
      </div>
    </form>
  );
}
