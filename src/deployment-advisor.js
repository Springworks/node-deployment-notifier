const internals = {};

exports.create = function(git_service, slack_notifier) {
  return {
    suggestDeployment: internals.suggestDeployment.bind(null, { git_service, slack_notifier }),
  };
};


internals.suggestDeployment = function({ git_service, slack_notifier }, app_name, latest_tag_name, deployment_url) {
  return git_service
      .getChangesBetweenTags(latest_tag_name)
      .then(changelog => {
        return git_service
            .getLatestAuthorName()
            .then(last_author => {
              const attachments = [internals.generateDeploymentSuggestionSlackAttachment(changelog, latest_tag_name)];
              const message = `Hey, *${last_author}*. Might be a good time to deploy *${app_name}*.\n:rocket: ${deployment_url}`;
              return slack_notifier.sendDeploymentMessage(message, attachments);
            });
      })
      .catch(err => {
        console.error('suggestDeployment failed', err);
        throw err;
      });
};


internals.generateDeploymentSuggestionSlackAttachment = function(changelog, latest_tag_name) {
  return {
    fallback: changelog,
    fields: [
      {
        title: `Changes since ${latest_tag_name}`,
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
