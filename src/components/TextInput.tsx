import React, { InputHTMLAttributes, useEffect, useRef } from 'react';

import { useField } from '@unform/core';

import { InputError } from './shared/InputError';
import { InputHeader } from './shared/InputHeader';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  type?:
    | 'text'
    | 'number'
    | 'color'
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'hidden'
    | 'month'
    | 'password'
    | 'time'
    | 'range'
    | 'search'
    | 'tel'
    | 'url'
    | 'week';
  label?: string;
  value?: string;
  required?: boolean;
};

export const TextInput: React.FC<Props> = ({
  name,
  label,
  value,
  required,
  ...rest
}) => {
  const inputRef = useRef(null);
  const { fieldName, defaultValue, registerField, error } = useField(name);

  const defaultInputValue = value || defaultValue;

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef,
      getValue: ref => ref.current.value,
      setValue: (ref, newValue) => (ref.current.value = newValue),
      clearValue: ref => (ref.current.value = ''),
    });
  }, [fieldName, registerField]);

  return (
    <div className="flex-col flex-1 mb-4">
      {label && (
        <InputHeader label={label} htmlFor={fieldName} required={required} />
      )}

      <input
        className="border-solid rounded-lg outline-none text-sm h-10 w-full align-middle border-x-8 placeholder:text-sm last:mt-2.5"
        type="text"
        id={fieldName}
        ref={inputRef}
        defaultValue={defaultInputValue}
        {...rest}
      />

      {error && <InputError error={error} />}
    </div>
  );
};
