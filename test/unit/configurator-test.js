const configurator = require('../../src/configurator');
const internals = {};

describe(__filename, () => {

  describe('create', () => {
    let env;

    beforeEach(() => {
      env = internals.createValidEnvVars();
    });

    describe('env vars', () => {

      describe('with all vars provided', () => {

        it('should return configuration', () => {
          const config = configurator.create(env);
          config.should.eql({
            slack: {
              webhook_url: env.NODE_DEPLOYMENT_NOTIFIER_SLACK_WEBHOOK_URL,
              username: env.NODE_DEPLOYMENT_NOTIFIER_SLACK_USERNAME,
              channel: env.NODE_DEPLOYMENT_NOTIFIER_SLACK_CHANNEL,
            },
            webhook: {
              url: env.NODE_DEPLOYMENT_NOTIFIER_WEBHOOK_URL,
              basic_auth: {
                username: env.NODE_DEPLOYMENT_NOTIFIER_WEBHOOK_BASIC_AUTH_USERNAME,
                password: env.NODE_DEPLOYMENT_NOTIFIER_WEBHOOK_BASIC_AUTH_PASSWORD,
              },
            },
          });
        });

      });

      describe('missing required variable', () => {
        const required_variables = [
          'NODE_DEPLOYMENT_NOTIFIER_SLACK_WEBHOOK_URL',
          'NODE_DEPLOYMENT_NOTIFIER_SLACK_USERNAME',
          'NODE_DEPLOYMENT_NOTIFIER_SLACK_CHANNEL',
        ];

        required_variables.forEach(param => {

          describe(`missing ${param}`, () => {

            beforeEach(() => {
              delete env[param];
            });

            it('should fail with error', () => {
              (() => configurator.create(env)).should.throw();
            });

          });

        });

      });

    });

  });

});


internals.createValidEnvVars = function() {
  return {
    NODE_DEPLOYMENT_NOTIFIER_SLACK_WEBHOOK_URL: 'http://hook.com',
    NODE_DEPLOYMENT_NOTIFIER_SLACK_USERNAME: 'Mr Bot',
    NODE_DEPLOYMENT_NOTIFIER_SLACK_CHANNEL: '#deployments',
    NODE_DEPLOYMENT_NOTIFIER_WEBHOOK_URL: 'http://hook.com',
    NODE_DEPLOYMENT_NOTIFIER_WEBHOOK_BASIC_AUTH_USERNAME: 'secret-user',
    NODE_DEPLOYMENT_NOTIFIER_WEBHOOK_BASIC_AUTH_PASSWORD: 'secret-pass',
    EXCESSIVE_VAR: 'should be ignored',
  };
};
