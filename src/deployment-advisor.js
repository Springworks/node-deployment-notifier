const internals = {};

exports.create = function(git_service, slack_notifier) {
  return {
    suggestDeployment: internals.suggestDeployment.bind(null, { git_service, slack_notifier }),
  };
};


internals.suggestDeployment = function({ git_service, slack_notifier }, app_name, latest_tag_name) {
  return git_service
      .getChangesSinceTag(latest_tag_name)
      .then(changelog => {
        return git_service
            .getLatestAuthorName()
            .then(last_author => {
              const attachments = [internals.generateDeploymentSuggestionSlackAttachment(changelog)];
              const message = `Hey, *${last_author}*. Might be a good time to deploy *${app_name}*. :rocket:`;
              return slack_notifier.sendDeploymentMessage(message, attachments);
            });
      })
      .catch(err => {
        console.error('suggestDeployment failed', err);
        throw err;
      });
};


internals.generateDeploymentSuggestionSlackAttachment = function(changelog) {
  return {
    fallback: changelog,
    fields: [
      {
        title: 'Changes',
        value: changelog,
        short: false,
      },
    ],
  };
};


/* istanbul ignore else */
if (process.env.NODE_ENV === 'test') {
  exports.internals = internals;
}
