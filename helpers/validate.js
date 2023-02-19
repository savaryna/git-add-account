export { z } from 'zod';

export default (schema) => (value) => {
  const { success, error } = schema.safeParse(value);
  if (!success) return error.format()._errors[0];
  return true;
};
