import React, { InputHTMLAttributes, useEffect, useRef } from 'react';

import { useField } from '@unform/core';

import { InputError } from './shared/InputError';
import { InputHeader } from './shared/InputHeader';

type PropOptions = {
  name: string;
  value: string;
};

type Props = InputHTMLAttributes<HTMLButtonElement> & {
  name: string;
  options: PropOptions[];
  label?: string;
  required?: boolean;
};

type HandleClickProps = {
  event: React.MouseEvent<HTMLButtonElement, MouseEvent>;
  value: string;
};

export const ButtonInput: React.FC<Props> = ({
  name,
  label,
  options,
  required,
  ...rest
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { fieldName, defaultValue, registerField, error } = useField(name);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: buttonRef,
      getValue: ref => ref.current.value,
      setValue: (ref, newValue) => (ref.current.value = newValue),
      clearValue: ref => (ref.current.value = ''),
    });
  }, [fieldName, registerField]);

  const handleClick = ({ event, value }: HandleClickProps) => {
    if (!buttonRef.current) return;

    event.preventDefault();
    buttonRef.current.value = value;

    const buttons = buttonRef.current.parentElement?.children || [];

    for (let i = 0; i < buttons.length; i++)
      buttons[i].classList.remove('button-selected');

    event.currentTarget.classList.add('button-selected');
  };

  return (
    <div className="flex-col flex-1 mb-4">
      {label && (
        <InputHeader label={label} htmlFor={fieldName} required={required} />
      )}

      {options.map((option, index) => (
        <button
          className="border-solid rounded-lg outline-none select-none mt-1.5 h-9 px-2 last:ml-1"
          key={index}
          id={fieldName}
          ref={buttonRef}
          defaultValue={defaultValue}
          onClick={event => handleClick({ event, value: option.value })}
          {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          <span className="font-bold text-sm pt-1.5">{option.name}</span>
        </button>
      ))}

      {error && <InputError error={error} />}
    </div>
  );
};
