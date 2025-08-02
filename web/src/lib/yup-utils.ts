import * as yup from 'yup';

export const createNumberSchema = (options: {
  required?: boolean;
  min?: number;
  max?: number;
  requiredMessage?: string;
  minMessage?: string;
  maxMessage?: string;
  numberMessage?: string;
}) => {
  const {
    required = true,
    min,
    max,
    requiredMessage = 'This field is required',
    minMessage,
    maxMessage,
    numberMessage = 'Must be a valid number',
  } = options;

  let schema = yup
    .mixed()
    .transform((value) => {
      if (value === '' || value === null || value === undefined) {
        return undefined;
      }
      const num = Number(value);
      return isNaN(num) ? undefined : num;
    })
    .test('is-number', numberMessage, (value) => typeof value === 'number' && !isNaN(value));

  if (required) {
    schema = schema.test('is-required', requiredMessage, (value) => value !== undefined && value !== null);
  }

  if (min !== undefined) {
    schema = schema.test(
      'min-value',
      minMessage ?? `Must be at least ${min}`,
      (value) => typeof value === 'number' && value >= min
    );
  }

  if (max !== undefined) {
    schema = schema.test(
      'max-value',
      maxMessage ?? `Must be at most ${max}`,
      (value) => typeof value === 'number' && value <= max
    );
  }

  return schema as unknown as yup.NumberSchema<number | undefined, yup.AnyObject, number>;
};

export const createQuantitySchema = (min: number = 0) =>
  createNumberSchema({
    required: true,
    min,
    requiredMessage: 'Quantity is required',
    minMessage: `Quantity must be at least ${min}`,
  });

export const createPriceSchema = (min: number = 0) =>
  createNumberSchema({
    required: true,
    min,
    requiredMessage: 'Price is required',
    minMessage: `Price must be at least ${min}`,
  });

export const createWeightSchema = (min: number = 0) =>
  createNumberSchema({
    required: true,
    min,
    requiredMessage: 'Weight is required',
    minMessage: `Weight must be at least ${min}`,
  });
