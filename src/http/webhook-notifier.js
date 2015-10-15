const input_validator = require('@springworks/input-validator');
const joi = input_validator.joi;

const internals = {};


exports.create = function(request, webhook_url, basic_auth) {
  return {
    sendDeploymentMessage: internals.sendDeploymentMessage.bind(null, { request, webhook_url, basic_auth }),
  };
};


const send_deployment_message_params_schema = joi.object().required().keys({
  app_name: joi.string().required(),
  revision: joi.string().required(),
  environment: joi.string().required(),
  changelog: joi.string().required().allow(''),
});

internals.sendDeploymentMessage = function({ request, webhook_url, basic_auth }, app_name, revision, environment, changelog) {
  return new Promise((resolve, reject) => {
    const validated_params = input_validator.validateSchema({
      app_name, revision, environment, changelog,
    }, send_deployment_message_params_schema);

    const req_body = internals.generateRequestBody(validated_params.app_name,
        validated_params.revision,
        validated_params.environment,
        validated_params.changelog);

    const req_opts = {
      method: 'post',
      url: webhook_url,
      json: req_body,
      auth: basic_auth,
    };

    internals.sendRequest(request, req_opts, (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      else if (res.statusCode >= 400) {
        reject(new Error(`Failed to send deployment message to ${req_opts.url}, status code: ${res.statusCode}`));
        return;
      }
      resolve();
    });
  });
};


internals.generateRequestBody = function(app_name, revision, environment, changelog) {
  return {
    application_name: app_name,
    changes: changelog,
    revision,
    environment,
  };
};


internals.sendRequest = function(request, req_opts, callback) {
  request(req_opts, callback);
};


/* istanbul ignore else */
if (process.env.NODE_ENV === 'test') {
  exports.internals = internals;
}
