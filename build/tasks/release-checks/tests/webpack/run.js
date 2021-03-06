const Test = require('../test');
const ExecuteCommand = require('../../tasks/execute-command');
const CheckForJavascriptErrors = require('../../tasks/check-javascript-errors');
const TakeScreenShotOfPage = require('../../tasks/take-screenshot-of-page');
const StepRunner = require('../../step-runner');
const path = require('path');
const fs = require('fs');

class NpmStartDoesNotThrowCommandLineErrors extends Test {
  constructor() {
    super('npm start does not throw commandline errors');
  }

  onOutput(message) {
    this.debug(message);

    if (message.toLowerCase().indexOf('error') > -1) {
      this.executeCommand.stop();
      this.fail();
    } else if (message.indexOf('Compiled successfully') > -1) {
      this.success();
      this.executeCommand.stop();
    }
  }

  execute() {
    this.executeCommand = new ExecuteCommand('npm', ['start'], (msg) => this.onOutput(msg));
    return this.executeCommand.executeAsNodeScript();
  }
}

class NpmStartLaunchesServer extends Test {
  constructor() {
    super('npm start launches server');
  }

  onOutput(message) {
    this.debug(message);

    if (isApplicationAvailableMessage(message)) {
      this.success();
      this.executeCommand.stop();
    }
  }

  execute() {
    this.executeCommand = new ExecuteCommand('npm', ['start'], (msg) => this.onOutput(msg));
    return this.executeCommand.executeAsNodeScript();
  }
}

class NpmStartWatchPicksUpFileChanges extends Test {
  constructor(fileToChange) {
    super('npm start picks up file changes');

    this.fileToChange = fileToChange || path.join('src', 'app.html');
    this.watchingForFileChangeNotification = false;
  }

  changeFile() {
    return new Promise(resolve => {
      const fullPath = path.join(this.context.workingDirectory, this.fileToChange);

      this.debug(`changing file ${fullPath}`);

      fs.readFile(fullPath, 'utf-8', (err, data) => {
        if (err) {
          throw err;
        }

        fs.writeFile(fullPath, data + ' ', 'utf-8', (error) => {
          if (error) {
            throw error;
          }

          resolve();
        });
      });
    });
  }

  onOutput(message) {
    this.debug(message);

    if (isApplicationAvailableMessage(message)) {
      setTimeout(() => this.changeFile(), 1000);
    }

    if (message.indexOf('Compiled successfully.') > -1) {
      if (this.watchingForFileChangeNotification) {
        this.success();
        this.executeCommand.stop();
      } else {
        this.watchingForFileChangeNotification = true;
      }
    }
  }

  execute(context) {
    this.context = context;

    this.executeCommand = new ExecuteCommand('npm', ['start'], (msg) => this.onOutput(msg));
    return this.executeCommand.executeAsNodeScript();
  }
}

class NpmStartAppLaunchesWithoutJavascriptErrors extends Test {
  constructor() {
    super('npm start app launches without javascript errors');
  }

  onOutput(message) {
    this.debug(message);

    if (isApplicationAvailableMessage(message)) {
      const url = getURL(message);

      const checkJavascriptErrorsTask = new CheckForJavascriptErrors(url);

      return new StepRunner(checkJavascriptErrorsTask).run()
        .then(() => {
          this.success();
          this.executeCommand.stop();
        });
    }
  }

  execute() {
    this.executeCommand = new ExecuteCommand('npm', ['start'], (msg) => this.onOutput(msg));
    return this.executeCommand.executeAsNodeScript();
  }
}

class NpmStartRendersPage extends Test {
  constructor() {
    super('npm start renders page');
  }

  onOutput(context, message) {
    this.debug(message);

    if (isApplicationAvailableMessage(message)) {
      const url = getURL(message);

      const screenshot = new TakeScreenShotOfPage(url, path.join(context.resultOutputFolder, 'screenshot-of-npm-start.png'));

      return new StepRunner(screenshot).run()
        .then(() => {
          this.success();
          this.executeCommand.stop();
        });
    }
  }

  execute(context) {
    this.executeCommand = new ExecuteCommand('npm', ['start'], (msg) => this.onOutput(context, msg));
    return this.executeCommand.executeAsNodeScript();
  }
}

function isApplicationAvailableMessage(msg) {
  return msg.indexOf('Project is running at http://localhost') > -1;
}

function getURL(msg) {
  const regex = /Project is running at (.*)/;
  const match = regex.exec(msg);
  return match[1];
}

module.exports = {
  NpmStartDoesNotThrowCommandLineErrors,
  NpmStartLaunchesServer,
  NpmStartWatchPicksUpFileChanges,
  NpmStartAppLaunchesWithoutJavascriptErrors,
  NpmStartRendersPage
};
