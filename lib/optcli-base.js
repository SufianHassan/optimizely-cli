var path = require('path');
var fs = require('fs');

var fileUtil = require('./file-util');
var logger = require('./logger');

function OptCLIBase(attributes, baseDir) {
  if (attributes) {
    this.attributes = attributes;
  } else {
    this.attributes = {};
  }
  this.baseDir = (baseDir) ? baseDir : null;
}


OptCLIBase.prototype.setBaseDir = function(baseDir) {
  this.baseDir = baseDir;
}

OptCLIBase.prototype.getJSONPath = function() {
  if (!this.baseDir) {
    logger.log("warn", "no base directory set");
    return null;
  }
  return path.join(this.baseDir, this.constructor.JSON_FILE_NAME);
}
OptCLIBase.prototype.getPath = function() {
  if (!this.baseDir) {
    logger.log("warn", "no base directory set");
    return null;
  }
  return path.join(this.baseDir, this.constructor.DIRECTORY);
}

OptCLIBase.prototype.loadFromFile = function() {
  this.attributes = fileUtil.loadConfigItem(this.getJSONPath()) || {};
  return this.attributes;
}

OptCLIBase.prototype.JSONFileExists = function() {
  return fs.existsSync(this.getJSONPath());
}

OptCLIBase.prototype.loadFromDir = function() {
  var self = this;
  var files = {};
  if (this.dirExists()) {
    fs.readdirSync(self.getPath()).forEach(function(file) {
      var text = fs.readFileSync(self.getPath() + "/" +
        file,
        'utf-8').replace(/(?:\r\n|\r|\n)/g, '\n');
      files[file] = escape(text);
    });
  }
  this.attributes = files || {};
  return this.attributes;
}

OptCLIBase.prototype.dirExists = function() {
  console.log(this.getPath())

  return fs.existsSync(this.getPath());
}

module.exports = OptCLIBase;
