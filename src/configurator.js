const input_validator = require('@springworks/input-validator');
const joi = input_validator.joi;

const env_vars_validation_schema = joi.object().required().keys({
  NODE_DEPLOYMENT_NOTIFIER_SLACK_WEBHOOK_URL: joi.string().required(),
  NODE_DEPLOYMENT_NOTIFIER_SLACK_USERNAME: joi.string().required(),
  NODE_DEPLOYMENT_NOTIFIER_SLACK_CHANNEL: joi.string().required(),
  NODE_DEPLOYMENT_NOTIFIER_WEBHOOK_URL: joi.string().required(),
  NODE_DEPLOYMENT_NOTIFIER_WEBHOOK_BASIC_AUTH_USERNAME: joi.string().required(),
  NODE_DEPLOYMENT_NOTIFIER_WEBHOOK_BASIC_AUTH_PASSWORD: joi.string().required(),
});

const internals = {};

exports.create = env => {
  const validated_env = internals.validateEnvVars(env);
  return {
    slack: {
      webhook_url: validated_env.NODE_DEPLOYMENT_NOTIFIER_SLACK_WEBHOOK_URL,
      username: validated_env.NODE_DEPLOYMENT_NOTIFIER_SLACK_USERNAME,
      channel: validated_env.NODE_DEPLOYMENT_NOTIFIER_SLACK_CHANNEL,
    },
    webhook: {
      url: validated_env.NODE_DEPLOYMENT_NOTIFIER_WEBHOOK_URL,
      basic_auth: {
        username: validated_env.NODE_DEPLOYMENT_NOTIFIER_WEBHOOK_BASIC_AUTH_USERNAME,
        password: validated_env.NODE_DEPLOYMENT_NOTIFIER_WEBHOOK_BASIC_AUTH_PASSWORD,
      },
    },
  };
};


internals.validateEnvVars = function(env_vars) {
  const options_to_allow_excessive_env_vars = { stripUnknown: true };

  try {
    return input_validator.validateSchema(env_vars, env_vars_validation_schema, null, options_to_allow_excessive_env_vars);
  }
  catch (err) {
    console.error('validateEnvVars failed: %j', err);
    throw err;
  }
};
