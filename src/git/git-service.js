const internals = {};


exports.create = function(child_process) {
  return {
    getChangesBetweenTags: internals.getChangesBetweenTags.bind(null, { child_process }),
    getLatestAuthorName: internals.getLatestAuthorName.bind(null, { child_process }),
  };
};


internals.getChangesBetweenTags = function({ child_process }, from_tag_name, to_tag_name = 'HEAD') {
  const git_command_args = [
    'log',
    '--pretty=format:"- %s"',
    `${from_tag_name}..${to_tag_name}`,
    '--no-merges',
    '--reverse',
  ];
  return internals
      .executeCommand(child_process, git_command_args)
      .catch(err => {
        console.error('getChangesBetweenTags failed: %j', err);
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


internals.unquotedString = function(buffer_or_str) {
  const string = String(buffer_or_str);
  const replaced_surrounding_quotes = string
      .split('\n')
      .map(str => str.replace(/(^")|("$)/g, ''))
      .join('\n');
  return replaced_surrounding_quotes;
};


/* istanbul ignore else */
if (process.env.NODE_ENV === 'test') {
  exports.internals = internals;
}
