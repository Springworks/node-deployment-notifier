const configurator = require('../../src/configurator');
const internals = {};

describe(__filename, () => {

  describe('create', () => {
    let env;

    beforeEach(() => {
      env = internals.createValidEnvVars();
    });

    describe('with all env vars provided', () => {

      it('should return configuration', () => {
        const config = configurator.create(env);
        config.should.eql({
          slack_webhook_url: env.NODE_DEPLOYMENT_NOTIFIER_SLACK_WEBHOOK_URL,
          slack_username: env.NODE_DEPLOYMENT_NOTIFIER_SLACK_USERNAME,
          slack_channel: env.NODE_DEPLOYMENT_NOTIFIER_SLACK_CHANNEL,
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

internals.createValidEnvVars = function() {
  return {
    NODE_DEPLOYMENT_NOTIFIER_SLACK_WEBHOOK_URL: 'http://hook.com',
    NODE_DEPLOYMENT_NOTIFIER_SLACK_USERNAME: 'Mr Bot',
    NODE_DEPLOYMENT_NOTIFIER_SLACK_CHANNEL: '#deployments',
    OTHER_VAR: 'should be ignored',
  };
};
