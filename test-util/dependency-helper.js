exports.mockGitService = function() {
  return {
    getChangesBetweenTags() {
    },
    getLatestAuthorName() {
    },
  };
};


exports.mockSlackNotifier = function() {
  return {
    sendDeploymentMessage() {
    },
  };
};


exports.mockWebhookNotifier = function() {
  return {
    sendDeploymentMessage() {
    },
  };
};
