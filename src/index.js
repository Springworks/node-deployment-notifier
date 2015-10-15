const child_process = require('child_process');
const request = require('request');

const deployment_advisor = require('./deployment-advisor');
const deployment_recorder = require('./deployment-recorder');
const git_service = require('./git/git-service');
const slack_notifier = require('./slack/slack-notifier');
const webhook_notifier = require('./http/webhook-notifier');
const configurator = require('./configurator');

exports.create = function(process_env) {
  const config = configurator.create(process_env);
  const git_service_instance = git_service.create(child_process);
  const slack_notifier_instance = slack_notifier.create(config.slack.webhook_url, config.slack.username, config.slack.channel);
  const webhook_notifier_instance = webhook_notifier.create(request, config.webhook.url, config.webhook.basic_auth);

  const advisor = deployment_advisor.create(git_service_instance, slack_notifier_instance);
  const recorder = deployment_recorder.create(git_service_instance, slack_notifier_instance, webhook_notifier_instance);

  return {
    suggestDeployment: advisor.suggestDeployment,
    recordDeployment: recorder.recordDeployment,
  };
};
