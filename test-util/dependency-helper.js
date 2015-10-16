exports.mockGitService = function() {
  return {
    getChangesSinceTag() {
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
