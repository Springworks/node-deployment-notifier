# Deployment Notifier

[![Build Status](https://travis-ci.org/Springworks/node-deployment-notifier.png?branch=master)](https://travis-ci.org/Springworks/node-deployment-notifier)
[![Coverage Status](https://coveralls.io/repos/Springworks/node-deployment-notifier/badge.png?branch=master)](https://coveralls.io/r/Springworks/node-deployment-notifier?branch=master)

## Environment variables

- `NODE_DEPLOYMENT_NOTIFIER_SLACK_WEBHOOK_URL`: URL to the Slack webhook
- `NODE_DEPLOYMENT_NOTIFIER_SLACK_CHANNEL`: Slack channel name to post messages to, e.g. `#deployments`
- `NODE_DEPLOYMENT_NOTIFIER_SLACK_USERNAME`: Username to use when posting, e.g. `Row Bot`

## Usage

Install module globally:

```
npm install -g deployment-notifier
```

### Suggest deployment
Sends Slack notification with a suggestion to make a deployment.

Includes changelog (since last deployment).

**Usage**
```
  Usage: deployment-suggestion [options]

  Options:

    -h, --help                 output usage information
    -N, --app-name <app name>  Application name
    -T, --tag-name <git tag>   Name of tag marking latest deployment
```

**Example**

```
$ deployment-suggestion --app-name "some app" --tag-name v1.0.0 
```

## License

MIT
