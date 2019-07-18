const Test = require('../test');
const ExecuteCommand = require('../../tasks/execute-command');

const auRunDeprecationNotice = '`au run` task is deprecated for the webpack projects, and a potential candidate for removal in future. Consider using `npm start` instead.';
const auBuildDeprecationNotice = '`au build` task is deprecated for the webpack projects, and a potential candidate for removal in future. Consider using `npm run build` instead.';

class AuRunEmitsDeprecationNotice extends Test {
  isDeprecationNoticeGenerated = false;
  constructor() {
    super('au run emits deprecation notice for webpack project');
  }

  onOutput(message) {
    this.debug(message);

    if (message.toLowerCase().indexOf('error') > -1) {
      this.executeCommand.stop();
      this.fail();
    } else if (message.indexOf(auRunDeprecationNotice)) {
      this.isDeprecationNoticeGenerated = true;
    } else if (message.indexOf('Compiled successfully') > -1 && this.isDeprecationNoticeGenerated) {
      this.success();
      this.executeCommand.stop();
    }
  }

  execute() {
    this.executeCommand = new ExecuteCommand('au', ['run'], (msg) => this.onOutput(msg));
    return this.executeCommand.executeAsNodeScript();
  }
}

class AuBuildEmitsDeprecationNotice extends Test {
  isDeprecationNoticeGenerated = false;
  constructor() {
    super('au build emits deprecation notice for webpack project');
  }

  onOutput(message) {
    this.debug(message);

    if (message.toLowerCase().indexOf('error') > -1) {
      this.executeCommand.stop();
      this.fail();
    } else if (message.indexOf(auBuildDeprecationNotice)) {
      this.isDeprecationNoticeGenerated = true;
    } else if (message.indexOf('Compiled successfully') > -1 && this.isDeprecationNoticeGenerated) {
      this.success();
      this.executeCommand.stop();
    }
  }

  execute() {
    this.executeCommand = new ExecuteCommand('au', ['build'], (msg) => this.onOutput(msg));
    return this.executeCommand.executeAsNodeScript();
  }
}

module.exports = {
  AuRunEmitsDeprecationNotice,
  AuBuildEmitsDeprecationNotice
};
