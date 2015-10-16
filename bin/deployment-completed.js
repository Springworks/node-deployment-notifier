#!/usr/bin/env node

require('babel/polyfill');

var record_deployment = require('../lib/cli/record-deployment');
record_deployment.run(process);
