import { ZodTypeAny } from 'zod';

const validate =
  <T extends ZodTypeAny>(schema: T) =>
  (value: unknown) => {
    const { success, error } = schema.safeParse(value);
    if (!success) return error.format()._errors[0];
    return true;
  };

export { z } from 'zod';
export default validate;
