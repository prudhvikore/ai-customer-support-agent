import logger from "../logger.js";

const validate = (schema) => (req, res, next) => {
  const schemaKeys = (schema && schema.describe && schema.describe().keys)
    ? Object.keys(schema.describe().keys)
    : [];

  const target = {};
  if (schemaKeys.includes("body")) target.body = req.body;
  if (schemaKeys.includes("query")) target.query = req.query;
  if (schemaKeys.includes("params")) target.params = req.params;

  const { error, value } = schema.validate(target, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) {
    error.isJoi = true;
    logger.debug({ error }, "validation.failed");
    return next(error);
  }

  if (value.body) req.body = value.body;
  if (value.query) req.query = value.query;
  if (value.params) req.params = value.params;

  return next();
};

export default validate;
