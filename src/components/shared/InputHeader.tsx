import React from 'react';

type Props = {
  label: string;
  htmlFor: string;
  required?: boolean;
};

export const InputHeader: React.FC<Props> = ({ label, htmlFor, required }) => {
  return (
    <label className="text-base font-bold opacity-90" htmlFor={htmlFor}>
      {label} {required && <span className="font-bold text-red-500">*</span>}
      <br />
    </label>
  );
};
