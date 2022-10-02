import React, { InputHTMLAttributes, useEffect, useRef } from 'react';

import { useField } from '@unform/core';

import { InputError } from './shared/InputError';
import { InputHeader } from './shared/InputHeader';

type Props = InputHTMLAttributes<HTMLTextAreaElement> & {
  name: string;
  label?: string;
  required?: boolean;
};

export const TextareaInput: React.FC<Props> = ({
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
    <div className="mb-4 flex-1 flex-col">
      {label && (
        <InputHeader label={label} htmlFor={fieldName} required={required} />
      )}

      <textarea
        className="max-h-24 min-h-full w-full resize-none rounded-lg border-8 border-solid align-middle text-sm outline-none placeholder:text-sm last:mt-2.5"
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
