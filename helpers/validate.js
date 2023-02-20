const { z } = require('zod');

module.exports.z = z;

module.exports.default = (schema) => (value) => {
  const { success, error } = schema.safeParse(value);
  if (!success) return error.format()._errors[0];
  return true;
};
