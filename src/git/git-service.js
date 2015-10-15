const internals = {};


exports.create = function(child_process) {
  return {
    getChangesSinceTag: internals.getChangesSinceTag.bind(null, { child_process }),
    getLatestAuthorName: internals.getLatestAuthorName.bind(null, { child_process }),
  };
};


internals.getChangesSinceTag = function({ child_process }, tag_name) {
  const git_command_args = [
    'log',
    '--pretty=format:"- %s"',
    `${tag_name}..HEAD`,
    '--no-merges',
    '--reverse',
  ];
  return internals
      .executeCommand(child_process, git_command_args)
      .catch(err => {
        console.error('getChangesSinceTag failed: %j', err);
        throw err;
      });
};


internals.getLatestAuthorName = function({ child_process }) {
  const git_command_args = [
    'log',
    '--pretty=format:%an',
    '-1',
  ];
  return internals
      .executeCommand(child_process, git_command_args)
      .catch(err => {
        console.error('getLatestAuthorName failed: %j', err);
        throw err;
      });
};


internals.executeCommand = function(child_process, git_command_args) {
  return new Promise((resolve, reject) => {
    const spawned_process = child_process.spawn('git', git_command_args);
    let stdout_str = '';

    spawned_process.stdout.on('data', data => {
      stdout_str += internals.unquotedString(data);
    });

    spawned_process.on('close', code => {
      if (code > 0) {
        reject(new Error(`executeCommand returned code ${code}`));
        return;
      }
      resolve(stdout_str);
    });

    spawned_process.on('error', reject);
    spawned_process.stderr.on('data', data => {
      reject(new Error(data));
    });
  });
};


internals.unquotedString = function(str) {
  return String(str).replace(/(^")|("$)/g, '');
};


/* istanbul ignore else */
if (process.env.NODE_ENV === 'test') {
  exports.internals = internals;
}
