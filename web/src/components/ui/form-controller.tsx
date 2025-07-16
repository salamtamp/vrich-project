import React from 'react';

import { Controller, type ControllerProps, type FieldValues } from 'react-hook-form';

function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  return (error as { message?: string })?.message ?? '';
}

type FormControllerProps<T extends FieldValues> = ControllerProps<T> & {
  disableError?: boolean;
};

const FormController = <T extends FieldValues>({
  render,
  disableError = false,
  ...props
}: FormControllerProps<T>) => (
  <Controller
    {...props}
    render={(fieldProps) => (
      <div className='flex flex-col'>
        {render(fieldProps)}
        {!disableError && fieldProps.fieldState?.error ? (
          <div className='mt-1 text-xs text-red-500'>{getErrorMessage(fieldProps.fieldState.error)}</div>
        ) : null}
      </div>
    )}
  />
);

export default FormController;
