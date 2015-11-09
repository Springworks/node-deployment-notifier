const deployment_advisor = require('../../src/deployment-advisor');
const dependency_helper = require('../../test-util/dependency-helper');

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
    mock_git_service = dependency_helper.mockGitService();
    mock_slack_notifier = dependency_helper.mockSlackNotifier();

    dependencies = { git_service: mock_git_service, slack_notifier: mock_slack_notifier };
  });

  describe('create', () => {

    it('should create an instance properly', () => {
      const advisor = deployment_advisor.create(mock_git_service, mock_slack_notifier);
      advisor.should.have.keys(['suggestDeployment']);
    });

  });

  describe('internals.suggestDeployment', () => {

    describe('with valid app_name, latest_tag_name, deployment_url', () => {
      const app_name = 'awe-some-app';
      const latest_tag_name = 'v1.0.1';
      const deployment_url = 'http://www.deploy.com/now';

      describe('when dependencies succeed', () => {
        let send_deployment_message_stub;

        beforeEach(function mockSendMessage() {
          send_deployment_message_stub = sinon_sandbox.stub(mock_slack_notifier, 'sendDeploymentMessage').returns(Promise.resolve(null));
        });

        describe('when changelog contains changes', () => {
          const changelog = 'These are all the changes';
          const author_name = 'John Doe';

          beforeEach(function mockChangelog() {
            sinon_sandbox.stub(mock_git_service, 'getChangesBetweenTags').returns(Promise.resolve(changelog));
          });

          beforeEach(function mockLastAuthor() {
            sinon_sandbox.stub(mock_git_service, 'getLatestAuthorName').returns(Promise.resolve(author_name));
          });

          it('should resolve promise', () => {
            return deployment_advisor.internals.suggestDeployment(dependencies, app_name, latest_tag_name, deployment_url).should.be.fulfilled();
          });

          it('should send message to Slack notifier', () => {
            return deployment_advisor.internals.suggestDeployment(dependencies, app_name, latest_tag_name, deployment_url).then(() => {
              send_deployment_message_stub.should.have.callCount(1);
            });
          });

          it('should have correct message, with link included', () => {
            return deployment_advisor.internals.suggestDeployment(dependencies, app_name, latest_tag_name, deployment_url)
                .then(() => {
                  const message_arg = send_deployment_message_stub.getCall(0).args[0];
                  message_arg.should.eql(`Hey, *${author_name}*. Might be a good time to deploy *${app_name}*.` +
                                         '\n' +
                                         `:package: ${deployment_url}`);
                });
          });

          it('should only define changelog as attachment', () => {
            return deployment_advisor.internals.suggestDeployment(dependencies, app_name, latest_tag_name, deployment_url)
                .then(() => {
                  const attachments_arg = send_deployment_message_stub.getCall(0).args[1];
                  attachments_arg.should.be.instanceOf(Array);
                  attachments_arg.should.have.length(1);
                  attachments_arg[0].fallback.should.eql(changelog, 'Verify that changelog is used');
                });
          });


        });

        describe('with empty changelog', () => {
          const changelog = '';
          const author_name = '';

          beforeEach(function mockChangelog() {
            sinon_sandbox.stub(mock_git_service, 'getChangesBetweenTags').returns(Promise.resolve(changelog));
          });

          beforeEach(function mockLastAuthor() {
            sinon_sandbox.stub(mock_git_service, 'getLatestAuthorName').returns(Promise.resolve(author_name));
          });

          it('should not send deployment message', () => {
            return deployment_advisor.internals.suggestDeployment(dependencies, app_name, latest_tag_name, deployment_url).then(() => {
              send_deployment_message_stub.should.have.callCount(0);
            });
          });

        });
      });

      describe('when git_service fails', () => {

        beforeEach(function mockChangelog() {
          const err = new Error('Mocked getChangesBetweenTags error');
          sinon_sandbox.stub(mock_git_service, 'getChangesBetweenTags').returns(Promise.reject(err));
        });

        it('should reject promise', () => {
          return deployment_advisor.internals.suggestDeployment(dependencies, app_name, latest_tag_name, deployment_url).should.be.rejected();
        });

      });

      describe('when only slack_notifier fails', () => {

        beforeEach(function mockChangelog() {
          sinon_sandbox.stub(mock_git_service, 'getChangesBetweenTags').returns(Promise.resolve('These are all the changes'));
        });

        beforeEach(function mockLastAuthor() {
          sinon_sandbox.stub(mock_git_service, 'getLatestAuthorName').returns(Promise.resolve('John Doe'));
        });

        beforeEach(function mockFailedSendMessage() {
          const err = new Error('Mocked getChangesBetweenTags error');
          sinon_sandbox.stub(mock_slack_notifier, 'sendDeploymentMessage').returns(Promise.reject(err));
        });

        it('should reject promise', () => {
          return deployment_advisor.internals.suggestDeployment(dependencies, app_name, latest_tag_name, deployment_url).should.be.rejected();
        });

      });

    });

  });

  describe('internals.generateDeploymentSuggestionSlackAttachment', () => {

    describe('with valid changelog', () => {
      const changelog = '-This\n-Is\n-Changing';
      it('should define attachment as required by Slack', () => {
        const attachment = deployment_advisor.internals.generateDeploymentSuggestionSlackAttachment(changelog, 'v1.0.0');
        attachment.should.eql({
          fallback: changelog,
          fields: [
            {
              title: 'Changes since v1.0.0',
              value: changelog,
              short: false,
            },
          ],
        });
      });

    });

  });

});
