const program = require('commander');
const deployment_notifier = require('../index');

exports.run = function(process) {
  program
      .option('-N, --app-name <app name>', 'Application name')
      .option('-M, --message <release notes>', 'Release notes (required unless providing -P)')
      .option('-P, --previous-deployment-tag <git tag>', 'Name of tag for previous deployment')
      .option('-T, --deployment-tag <git tag>', 'Name of tag for latest deployment')
      .option('-E, --environment <target environment>', 'The environment deployment was targeted at')
      .parse(process.argv);

  console.log('');
  console.log('Deployment of %s to %s completed', program.appName, program.environment);
  console.log('');

  const notifier = deployment_notifier.create(process.env);
  notifier.recordDeployment(program.appName, program.previousDeploymentTag, program.deploymentTag, program.message, program.environment)
      .then(() => {
        console.log('Done!');
        process.exit(0);
      })
      .catch(err => {
        console.error('Error notifying about deployment', err);
        process.exit(1);
      });
};
