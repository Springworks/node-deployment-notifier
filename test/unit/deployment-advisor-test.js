const deployment_advisor = require('../../src/deployment-advisor');

describe(__filename, function() {
  let sinon_sandbox;
  let mock_git_service;
  let mock_slack_notifier;
  let dependencies;

  beforeEach(() => {
    sinon_sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sinon_sandbox.restore();
  });

  beforeEach(function mockDependencies() {
    mock_git_service = {
      getChangesSinceTag() {
      },
      getLatestAuthorName() {
      },
    };
    mock_slack_notifier = {
      sendDeploymentMessage() {
      },
    };

    dependencies = { git_service: mock_git_service, slack_notifier: mock_slack_notifier };
  });

  describe('create', () => {

    it('should create an instance properly', () => {
      const advisor = deployment_advisor.create(mock_git_service, mock_slack_notifier);
      advisor.should.have.keys(['suggestDeployment']);
    });

  });

  describe('internals.suggestDeployment', () => {

    describe('with valid app_name, latest_tag_name', () => {
      const app_name = 'awe-some-app';
      const latest_tag_name = 'v1.0.1';

      describe('when dependencies succeed', () => {
        let send_deployment_message_stub;

        beforeEach(function mockChangelog() {
          sinon_sandbox.stub(mock_git_service, 'getChangesSinceTag').returns(Promise.resolve('These are all the changes'));
        });

        beforeEach(function mockLastAuthor() {
          sinon_sandbox.stub(mock_git_service, 'getLatestAuthorName').returns(Promise.resolve('John Doe'));
        });

        beforeEach(function mockSendMessage() {
          send_deployment_message_stub = sinon_sandbox.stub(mock_slack_notifier, 'sendDeploymentMessage').returns(Promise.resolve(null));
        });

        it('should resolve promise', () => {
          return deployment_advisor.internals.suggestDeployment(dependencies, app_name, latest_tag_name).should.be.fulfilled();
        });

        it('should send message to Slack notifier', () => {
          return deployment_advisor.internals.suggestDeployment(dependencies, app_name, latest_tag_name)
              .then(() => {
                send_deployment_message_stub.should.have.callCount(1);
                const message_arg = send_deployment_message_stub.getCall(0).args[0];
                const attachments_arg = send_deployment_message_stub.getCall(0).args[1];

                message_arg.should.eql('Hey, *John Doe*. Might be a good time to deploy *awe-some-app*. :rocket:');
                attachments_arg.should.be.instanceOf(Array);
                attachments_arg.should.have.length(1);
              });
        });

      });

      describe('when git_service fails', () => {

        beforeEach(function mockChangelog() {
          const err = new Error('Mocked getChangesSinceTag error');
          sinon_sandbox.stub(mock_git_service, 'getChangesSinceTag').returns(Promise.reject(err));
        });

        it('should reject promise', () => {
          return deployment_advisor.internals.suggestDeployment(dependencies, app_name, latest_tag_name).should.be.rejected();
        });

      });

      describe('when only slack_notifier fails', () => {

        beforeEach(function mockChangelog() {
          sinon_sandbox.stub(mock_git_service, 'getChangesSinceTag').returns(Promise.resolve('These are all the changes'));
        });

        beforeEach(function mockLastAuthor() {
          sinon_sandbox.stub(mock_git_service, 'getLatestAuthorName').returns(Promise.resolve('John Doe'));
        });

        beforeEach(function mockFailedSendMessage() {
          const err = new Error('Mocked getChangesSinceTag error');
          sinon_sandbox.stub(mock_slack_notifier, 'sendDeploymentMessage').returns(Promise.reject(err));
        });

        it('should reject promise', () => {
          return deployment_advisor.internals.suggestDeployment(dependencies, app_name, latest_tag_name).should.be.rejected();
        });

      });

    });

  });

  describe('internals.generateDeploymentSuggestionSlackAttachment', () => {

    describe('with valid changelog', () => {
      const changelog = '-This\n-Is\n-Changing';
      it('should define attachment as required by Slack', () => {
        const attachment = deployment_advisor.internals.generateDeploymentSuggestionSlackAttachment(changelog);
        attachment.should.eql({
          fallback: changelog,
          fields: [
            {
              title: 'Changes',
              value: changelog,
              short: false,
            },
          ],
        });
      });

    });

  });

});
