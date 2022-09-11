import React from 'react';

type Props = {
  error: string;
};

export const InputError: React.FC<Props> = ({ error }) => {
  return <span className="text-red-500 text-xs pt-1.5">{error}</span>;
};
