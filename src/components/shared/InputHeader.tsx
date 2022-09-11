import React from 'react';

type Props = {
  label: string;
  htmlFor: string;
  required?: boolean;
};

export const InputHeader: React.FC<Props> = ({ label, htmlFor, required }) => {
  return (
    <label className="text-base font-bold" htmlFor={htmlFor}>
      {label} {required && <span className="text-red-500 font-bold">*</span>}
      <br />
    </label>
  );
};
