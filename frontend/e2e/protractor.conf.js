// @ts-check
// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const fs = require('fs');
const path = require('path');
const { SpecReporter, StacktraceOption } = require('jasmine-spec-reporter');

/**
 * Protractor's own `webdriver-manager update` can no longer download ChromeDriver for Chrome 115+
 * (the old chromedriver.storage.googleapis.com endpoint stopped publishing). We use a driver fetched
 * from "Chrome for Testing" instead (see README), found here or via CHROMEDRIVER_PATH.
 */
function findChromeDriver() {
  if (process.env.CHROMEDRIVER_PATH) {
    return process.env.CHROMEDRIVER_PATH;
  }
  const root = path.join(__dirname, '..', '.e2e-drivers', 'chromedriver');
  if (!fs.existsSync(root)) {
    throw new Error('ChromeDriver not found. Run the "Fetch ChromeDriver" step in README.md or set CHROMEDRIVER_PATH.');
  }
  for (const version of fs.readdirSync(root)) {
    for (const dir of fs.readdirSync(path.join(root, version))) {
      const candidate = path.join(root, version, dir, 'chromedriver');
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
  }
  throw new Error('ChromeDriver binary not found under ' + root);
}

/**
 * @type { import("protractor").Config }
 */
exports.config = {
  allScriptsTimeout: 30000,
  specs: [
    './src/**/*.e2e-spec.ts'
  ],
  capabilities: {
    browserName: 'chrome',
    'goog:chromeOptions': {
      args: process.env.E2E_HEADED ? [] : ['--headless=new', '--window-size=1280,900']
    }
  },
  directConnect: true,
  chromeDriver: findChromeDriver(),
  SELENIUM_PROMISE_MANAGER: false,
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 120000,
    print: function() {}
  },
  onPrepare() {
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.json')
    });
    jasmine.getEnv().addReporter(new SpecReporter({
      spec: {
        displayStacktrace: StacktraceOption.PRETTY
      }
    }));
  }
};
