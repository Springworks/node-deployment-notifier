#!/usr/bin/env node

require('babel/polyfill');

var deployment_notifier = require('../lib/cli/suggest-deployment');
deployment_notifier.run(process);
