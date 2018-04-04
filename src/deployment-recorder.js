const internals = {};

exports.create = function(git_service, slack_notifier, webhook_notifier) {
  return {
    recordDeployment: internals.recordDeployment.bind(null, { git_service, slack_notifier, webhook_notifier }),
  };
};

internals.recordDeployment = async function({ git_service, slack_notifier, webhook_notifier }, app_name, previous_tag_name, current_tag_name, message, target_environment) {
  let changelog;
  if (message) {
    changelog = message;
  }
  else {
    changelog = await git_service.getChangesBetweenTags(previous_tag_name, current_tag_name);
  }
  return Promise.all([
    internals.sendSlackMessage(slack_notifier, app_name, previous_tag_name, current_tag_name, changelog, target_environment),
    webhook_notifier.sendDeploymentMessage(app_name, current_tag_name, target_environment, changelog),
  ]);
};


internals.sendSlackMessage = function(slack_notifier, app_name, previous_tag_name, current_tag_name, changelog, target_environment) {
  const attachments = [internals.generateDeploymentSlackAttachment(current_tag_name, changelog)];
  const message = `Deployed new version of *${app_name}* to ${target_environment}! :rocket:`;
  return slack_notifier.sendDeploymentMessage(message, attachments);
};


internals.generateDeploymentSlackAttachment = function(current_tag_name, changelog) {
  return {
    fallback: changelog,
    fields: [
      {
        title: `${current_tag_name}`,
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
