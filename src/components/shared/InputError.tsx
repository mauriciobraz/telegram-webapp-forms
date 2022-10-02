import React from 'react';

type Props = {
  error: string;
};

export const InputError: React.FC<Props> = ({ error }) => {
  return <span className="pt-1.5 text-xs text-red-500">{error}</span>;
};
