const program = require('commander');
const deployment_notifier = require('../index');

exports.run = function(process) {
  program
      .option('-N, --app-name <app name>', 'Application name')
      .option('-T, --latest-deployment-tag <git tag>', 'Name of tag for latest deployment')
      .option('-U, --deploy-url <url>', 'URL where a deployment can be started')
      .parse(process.argv);

  console.log('');
  console.log('Suggesting deployment for %j in app %j (deployUrl: %j)', program.latestDeploymentTag, program.appName, program.deployUrl);
  console.log('');

  const notifier = deployment_notifier.create(process.env);
  notifier.suggestDeployment(program.appName, program.latestDeploymentTag, program.deployUrl)
      .then(() => {
        console.log('Done!');
        process.exit(0);
      })
      .catch(err => {
        console.error('Error suggesting deployment', err);
        process.exit(1);
      });
};
