exports.create = env => {
  if (!env.NODE_DEPLOYMENT_NOTIFIER_SLACK_WEBHOOK_URL || !env.NODE_DEPLOYMENT_NOTIFIER_SLACK_USERNAME || !env.NODE_DEPLOYMENT_NOTIFIER_SLACK_CHANNEL) {
    throw new Error('Missing environment variables to config');
  }

  return {
    slack_webhook_url: env.NODE_DEPLOYMENT_NOTIFIER_SLACK_WEBHOOK_URL,
    slack_username: env.NODE_DEPLOYMENT_NOTIFIER_SLACK_USERNAME,
    slack_channel: env.NODE_DEPLOYMENT_NOTIFIER_SLACK_CHANNEL,
  };
};
