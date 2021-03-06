const git_service = require('../../../src/git/git-service');

describe('test/unit/git/git-service-test.js', () => {
  const mock_child_process = {};
  let sinon_sandbox;

  beforeEach(() => {
    sinon_sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sinon_sandbox.restore();
  });

  describe('create', () => {

    describe('with valid dependencies', () => {

      it('should return object with public functions', () => {
        const instance = git_service.create(mock_child_process);
        instance.should.have.keys([
          'getChangesBetweenTags',
          'getLatestAuthorName',
        ]);
      });

    });

  });

  describe('internals.getChangesBetweenTags', () => {

    describe('with child_process, tag_name', () => {
      const from_tag_name = 'the-tag';
      let execute_command_stub;

      describe('when exec() succeeds', () => {
        const result_str = 'This is the change';

        beforeEach('mockSuccessfulCommand', () => {
          execute_command_stub = sinon_sandbox.stub(git_service.internals, 'executeCommand').returns(Promise.resolve(result_str));
        });

        it('should resolve promise once done', () => {
          return git_service.internals.getChangesBetweenTags({ child_process: mock_child_process }, from_tag_name).should.be.fulfilledWith(result_str);
        });

        it('should invoke exec() using HEAD as default to_tag_name', () => {
          const expected_command_args = [
            'log',
            '--pretty=format:"- %s"',
            `${from_tag_name}..HEAD`,
            '--no-merges',
            '--reverse',
          ];
          return git_service.internals.getChangesBetweenTags({ child_process: mock_child_process }, from_tag_name)
              .then(() => {
                execute_command_stub.should.have.callCount(1);

                const command_arg = execute_command_stub.getCall(0).args[1];
                command_arg.should.eql(expected_command_args);
              });
        });

      });

      describe('when exec() fails', () => {

        beforeEach('mockFailingExecuteCommand', () => {
          const err = new Error('Mocked exec() error');
          execute_command_stub = sinon_sandbox.stub(git_service.internals, 'executeCommand').returns(Promise.reject(err));
        });

        it('should reject promise', () => {
          return git_service.internals.getChangesBetweenTags({ child_process: mock_child_process }, from_tag_name).should.be.rejected();
        });

      });

    });

    describe('with child_process, from_tag_name, to_tag_name', () => {
      const from_tag_name = 'from-the-tag';
      const to_tag_name = 'to-the-tag';
      let execute_command_stub;

      describe('when exec() succeeds', () => {
        const result_str = 'This is the change';

        beforeEach('mockSuccessfulCommand', () => {
          execute_command_stub = sinon_sandbox.stub(git_service.internals, 'executeCommand').returns(Promise.resolve(result_str));
        });

        it('should invoke exec() with the correct command', () => {
          const expected_command_args = [
            'log',
            '--pretty=format:"- %s"',
            `${from_tag_name}..${to_tag_name}`,
            '--no-merges',
            '--reverse',
          ];
          return git_service.internals.getChangesBetweenTags({ child_process: mock_child_process }, from_tag_name, to_tag_name)
              .then(() => {
                execute_command_stub.should.have.callCount(1);

                const command_arg = execute_command_stub.getCall(0).args[1];
                command_arg.should.eql(expected_command_args);
              });
        });

      });

    });

  });

  describe('internals.getLatestAuthorName', () => {

    describe('with child_process, tag_name', () => {
      const tag_name = 'the-tag';
      let execute_command_stub;

      describe('when exec() succeeds', () => {
        const result_str = 'John Doe';

        beforeEach('mockSuccessfulCommand', () => {
          execute_command_stub = sinon_sandbox.stub(git_service.internals, 'executeCommand').returns(Promise.resolve(result_str));
        });

        it('should resolve promise once done', () => {
          return git_service.internals.getLatestAuthorName({ child_process: mock_child_process }, tag_name).should.be.fulfilledWith(result_str);
        });

        it('should invoke exec() with the correct command', () => {
          const expected_command_args = [
            'log',
            '--pretty=format:%an',
            '-1',
          ];
          return git_service.internals.getLatestAuthorName({ child_process: mock_child_process }, tag_name)
              .then(() => {
                execute_command_stub.should.have.callCount(1);

                const command_arg = execute_command_stub.getCall(0).args[1];
                command_arg.should.eql(expected_command_args);
              });
        });

      });

    });

  });

  describe('internals.unquotedString', () => {

    describe('with string surrounded by quotes, having quote in the middle', () => {
      const str = '"foo "bar" baz"';

      it('should strip quotes', () => {
        git_service.internals.unquotedString(str).should.eql('foo "bar" baz');
      });

    });

    describe('with multiline string, each surrounded by quotes', () => {
      const str = '"- foo "baz""\n"- bar"';

      it('should strip quotes', () => {
        git_service.internals.unquotedString(str).should.eql('- foo "baz"\n- bar');
      });

    });

  });

});
