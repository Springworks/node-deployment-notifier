const child_process = require('child_process');

const deployment_advisor = require('./deployment-advisor');
const git_service = require('./git/git-service');
const slack_notifier = require('./slack/slack-notifier');
const configurator = require('./configurator');

exports.create = function(process_env) {
  const config = configurator.create(process_env);
  const git_service_instance = git_service.create(child_process);
  const slack_notifier_instance = slack_notifier.create(config.slack_webhook_url,
      config.slack_username,
      config.slack_channel);

  const advisor = deployment_advisor.create(git_service_instance, slack_notifier_instance);

  return {
    suggestDeployment: advisor.suggestDeployment,
  };
};
