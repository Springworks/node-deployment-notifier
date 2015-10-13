const index = require('../../src');

describe(__filename, () => {

  describe('index', () => {
    const mock_process = {
      env: {
        NODE_DEPLOYMENT_NOTIFIER_SLACK_WEBHOOK_URL: 'http://hook.com',
        NODE_DEPLOYMENT_NOTIFIER_SLACK_USERNAME: 'Mr Bot',
        NODE_DEPLOYMENT_NOTIFIER_SLACK_CHANNEL: '#deployments',
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
      ]);
    });

  });

});
