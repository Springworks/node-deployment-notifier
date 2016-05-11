const webhook_notifier = require('../../../src/http/webhook-notifier');

describe('test/unit/http/webhook-notifier-test.js', () => {
  const webhook_url = 'https://internet.com';
  const basic_auth = {
    username: 'user',
    password: 'pass',
  };
  let sinon_sandbox;
  let mock_request_module;

  beforeEach(() => {
    mock_request_module = (opts, callback) => {
      const http_res = { statusCode: 200 };
      const res_body = {};
      callback(null, http_res, res_body);
    };
  });

  beforeEach(() => {
    sinon_sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sinon_sandbox.restore();
  });

  describe('create', () => {

    describe('with webhook_url, basic_auth', () => {


      it('should return object with public functions', () => {
        const service = webhook_notifier.create(mock_request_module, webhook_url, basic_auth);
        service.should.have.keys([
          'sendDeploymentMessage',
        ]);
      });

    });

    describe('with webhook_url but no basic_auth', () => {

      it('should return object with public functions', () => {
        const service = webhook_notifier.create(mock_request_module, webhook_url, basic_auth);
        service.should.have.keys([
          'sendDeploymentMessage',
        ]);
      });

    });

  });

  describe('internals.sendDeploymentMessage', () => {
    let dependencies;

    beforeEach(() => {
      dependencies = { request: mock_request_module, webhook_url, basic_auth };
    });

    describe('with valid params', () => {
      const app_name = 'my-app';
      const revision = 'v1.0.1';
      const environment = 'production';
      const changelog = '- This\n- That';

      describe('when request succeeds', () => {
        let send_request_stub;

        beforeEach('mockSendRequest', () => {
          const mock_response = {};
          const mock_body = {};
          send_request_stub = sinon_sandbox.stub(webhook_notifier.internals, 'sendRequest').callsArgWithAsync(2, null, mock_response, mock_body);
        });

        it('should POST to webhook URL with proper JSON body', () => {
          return webhook_notifier.internals
              .sendDeploymentMessage(dependencies, app_name, revision, environment, changelog)
              .then(() => {
                send_request_stub.should.have.callCount(1);

                const call_args = send_request_stub.getCall(0).args;
                call_args[1].should.eql({
                  method: 'post',
                  url: webhook_url,
                  auth: basic_auth,
                  json: {
                    application_name: app_name,
                    changes: changelog,
                    revision,
                    environment,
                  },
                });
              });
        });

        describe('having empty changelog', () => {
          const empty_changelog = '';

          it('should resolve promise', () => {
            return webhook_notifier.internals.sendDeploymentMessage(dependencies, app_name, revision, environment, empty_changelog);
          });

        });

      });

      describe('when request fails with error status code', () => {

        beforeEach('mockFailedSendRequest', () => {
          const mock_response = { statusCode: 404 };
          const mock_body = {};
          sinon_sandbox.stub(webhook_notifier.internals, 'sendRequest').callsArgWithAsync(2, null, mock_response, mock_body);
        });

        it('should reject with error', () => {
          return webhook_notifier.internals.sendDeploymentMessage(dependencies, app_name, revision, environment, changelog)
              .should.be.rejectedWith(/Failed to send deployment message/);
        });

      });

      describe('when request fails with error', () => {

        beforeEach('mockFailedSendRequest', () => {
          const mock_err = new Error('Mocked timeout');
          sinon_sandbox.stub(webhook_notifier.internals, 'sendRequest').callsArgWithAsync(2, mock_err, null, null);
        });

        it('should reject with error', () => {
          return webhook_notifier.internals.sendDeploymentMessage(dependencies, app_name, revision, environment, changelog)
              .should.be.rejectedWith(/Mocked timeout/);
        });

      });

    });

    describe('with invalid params (missing all)', () => {

      it('should fail with validation error', () => {
        return webhook_notifier.internals.sendDeploymentMessage(dependencies).should.be.rejectedWith('Validation Failed');
      });

    });

  });

  describe('internals.generateRequestBody', () => {

    describe('with valid params', () => {
      const app_name = 'my-app';
      const revision = 'v1.0.1';
      const environment = 'production';
      const changelog = '- This\n- That';

      it('should return object using all properties', () => {
        const req_body = webhook_notifier.internals.generateRequestBody(app_name, revision, environment, changelog);
        req_body.should.eql({
          application_name: app_name,
          changes: changelog,
          revision,
          environment,
        });
      });

    });

  });

});
