const program = require('commander');
const deployment_notifier = require('../index');

exports.run = function(process) {
  program
      .option('-N, --app-name <app name>', 'Application name')
      .option('-T, --latest-deployment-tag <git tag>', 'Name of tag for latest deployment')
      .parse(process.argv);

  console.log('');
  console.log('Suggesting deployment for %j in app %j', program.tagName, program.appName);
  console.log('');

  const notifier = deployment_notifier.create(process.env);
  notifier.suggestDeployment(program.appName, program.tagName)
      .then(() => {
        console.log('Done!');
        process.exit(0);
      })
      .catch(err => {
        console.error('Error suggesting deployment', err);
        process.exit(1);
      });
};
