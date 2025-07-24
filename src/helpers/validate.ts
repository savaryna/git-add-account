import type { ZodTypeAny } from 'zod';

const validate = (schema: ZodTypeAny, data: unknown) => {
  const { success, error } = schema.safeParse(data);
  return !success && error.errors.map(({ message }) => message).join('\n');
};

export { z } from 'zod';
export default validate;
