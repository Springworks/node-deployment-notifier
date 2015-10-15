const slack_notifier = require('../../../src/slack/slack-notifier');

describe(__filename, () => {
  let sinon_sandbox;

  beforeEach(() => {
    sinon_sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sinon_sandbox.restore();
  });

  describe('create', () => {

    it('should create instance with public interface', () => {
      const notifier = slack_notifier.create('http://webhook.url', 'username', '#channel');
      notifier.should.have.keys([
        'sendDeploymentMessage',
      ]);
    });

  });

  describe('internals.sendDeploymentMessage', () => {

    describe('with valid params', () => {
      let mock_slack_instance;
      let send_message_stub;
      let username;
      let channel;
      let attachments;
      let message;

      beforeEach(() => {
        mock_slack_instance = {
          send(msg) {
          },
        };
      });

      beforeEach(() => {
        const slack_response = { res: {}, body: {} };
        send_message_stub = sinon_sandbox.stub(mock_slack_instance, 'send').returns(Promise.resolve(slack_response));
      });

      beforeEach(() => {
        username = 'username';
        channel = '#channel';
        message = 'Hello world';
        attachments = [
          { fallback: 'World, hello' },
        ];
      });

      it('should resolve Promise', () => {
        return slack_notifier.internals.sendDeploymentMessage({ slack_instance: mock_slack_instance, username, channel }, message, attachments).should.be.fulfilled();
      });

      it('should send proper message to slack instance', () => {
        return slack_notifier.internals.sendDeploymentMessage({ slack_instance: mock_slack_instance, username, channel }, message, attachments)
            .then(() => {
              send_message_stub.should.have.callCount(1);
              const send_args = send_message_stub.getCall(0).args;
              send_args[0].should.eql({
                text: message,
                channel,
                username,
                attachments,
                icon_emoji: ':shipit:',
              });
            });
      });

    });

  });

});
