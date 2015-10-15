const Slack = require('node-slack');
const internals = {};

exports.create = function(webhook_url, username, channel) {
  const slack_instance = new Slack(webhook_url);
  return {
    sendDeploymentMessage: internals.sendDeploymentMessage.bind(null, { slack_instance, username, channel }),
  };
};


internals.sendDeploymentMessage = function({ slack_instance, username, channel }, message, opt_attachments) {
  const send_options = {
    text: message,
    channel,
    username,
    icon_emoji: ':shipit:',
  };
  if (Array.isArray(opt_attachments)) {
    send_options.attachments = opt_attachments;
  }
  return slack_instance.send(send_options);
};


/* istanbul ignore else */
if (process.env.NODE_ENV === 'test') {
  exports.internals = internals;
}
