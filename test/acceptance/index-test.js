const index = require('../../src');

describe('test/acceptance/index-test.js', () => {

  describe('index', () => {
    const mock_process = {
      env: {
        NODE_DEPLOYMENT_NOTIFIER_SLACK_WEBHOOK_URL: 'http://hook.com',
        NODE_DEPLOYMENT_NOTIFIER_SLACK_USERNAME: 'Mr Bot',
        NODE_DEPLOYMENT_NOTIFIER_SLACK_CHANNEL: '#deployments',
        NODE_DEPLOYMENT_NOTIFIER_WEBHOOK_URL: 'http://hook.com',
        NODE_DEPLOYMENT_NOTIFIER_WEBHOOK_BASIC_AUTH_USERNAME: 'secret-user',
        NODE_DEPLOYMENT_NOTIFIER_WEBHOOK_BASIC_AUTH_PASSWORD: 'secret-pass',
        EXCESSIVE_VAR: 'should be ignored',
      },
    };

    it('should export create function', () => {
      index.should.have.keys([
        'create',
      ]);
    });

    it('should export public functions on create()', () => {
      index.create(mock_process.env).should.have.keys([
        'suggestDeployment',
        'recordDeployment',
      ]);
    });

  });

});
