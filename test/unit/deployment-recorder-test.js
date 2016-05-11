const deployment_recorder = require('../../src/deployment-recorder');
const dependency_helper = require('../../test-util/dependency-helper');

describe('test/unit/deployment-recorder-test.js', function() {
  let sinon_sandbox;
  let mock_git_service;
  let mock_slack_notifier;
  let mock_webhook_notifier;

  beforeEach(() => {
    sinon_sandbox = sinon.sandbox.create();
  });

  beforeEach(() => {
    mock_git_service = dependency_helper.mockGitService();
    mock_slack_notifier = dependency_helper.mockSlackNotifier();
    mock_webhook_notifier = dependency_helper.mockWebhookNotifier();
  });

  afterEach(() => {
    sinon_sandbox.restore();
  });

  describe('create', () => {

    it('should return object with public functions', () => {
      const recorder = deployment_recorder.create(mock_git_service, mock_slack_notifier);
      recorder.should.have.keys(['recordDeployment']);
    });

  });

  describe('internals.recordDeployment', () => {

    describe('with valid dependencies', () => {
      const changelog = 'I changed this';
      const target_environment = 'production';
      let dependencies;
      let get_changes_since_tag_stub;
      let send_slack_deployment_message_stub;
      let send_webhook_deployment_message_stub;

      beforeEach(() => {
        dependencies = {
          git_service: mock_git_service,
          slack_notifier: mock_slack_notifier,
          webhook_notifier: mock_webhook_notifier,
        };
      });

      beforeEach(() => {
        get_changes_since_tag_stub = sinon_sandbox.stub(mock_git_service, 'getChangesBetweenTags').returns(Promise.resolve(changelog));
      });

      beforeEach(function mockSendSlackMessage() {
        send_slack_deployment_message_stub = sinon_sandbox.stub(mock_slack_notifier, 'sendDeploymentMessage').returns(Promise.resolve(null));
      });

      beforeEach(function mockSendWebhookMessage() {
        send_webhook_deployment_message_stub = sinon_sandbox.stub(mock_webhook_notifier, 'sendDeploymentMessage').returns(Promise.resolve(null));
      });

      describe('with valid app_name, previous_tag_name, current_tag_name', () => {
        const app_name = 'my-app';
        const previous_tag_name = 'v1.0.0';
        const current_tag_name = 'v1.0.1';

        it('should get version diff changelog from git service', () => {
          return deployment_recorder.internals.recordDeployment(dependencies, app_name, previous_tag_name, current_tag_name, target_environment)
              .then(() => {
                get_changes_since_tag_stub.should.have.callCount(1);

                const get_changes_args = get_changes_since_tag_stub.getCall(0).args;
                const from_tag = get_changes_args[0];
                from_tag.should.eql(previous_tag_name);

                const to_tag = get_changes_args[1];
                to_tag.should.eql(current_tag_name);
              });
        });

        it('should send message to slack notifier', () => {
          return deployment_recorder.internals.recordDeployment(dependencies, app_name, previous_tag_name, current_tag_name, target_environment)
              .then(() => {
                const message_arg = send_slack_deployment_message_stub.getCall(0).args[0];
                message_arg.should.eql(`Deployed new version of *${app_name}* to ${target_environment}! :rocket:`);
              });
        });

        it('should send message to webhook', () => {
          return deployment_recorder.internals.recordDeployment(dependencies, app_name, previous_tag_name, current_tag_name, target_environment)
              .then(() => {
                const call_args = send_webhook_deployment_message_stub.getCall(0).args;
                const app_name_arg = call_args[0];
                const revision_arg = call_args[1];
                const environment_arg = call_args[2];
                const changelog_arg = call_args[3];

                app_name_arg.should.eql(app_name);
                revision_arg.should.eql(current_tag_name);
                environment_arg.should.eql(target_environment);
                changelog_arg.should.eql(changelog);
              });
        });

      });

    });

  });

});
