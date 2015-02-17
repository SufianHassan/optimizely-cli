var util = require('util');
var path = require('path');
var _ = require("lodash");

var fileUtil = require("./file-util");
var logger = require("./logger");
var readConfig = require("./read-config");
var OptimizelyClient = require("optimizely-node-client");
var OptCLIBase = require("./optcli-base");

var fs = require('fs');

var varPath = path.resolve(process.cwd(),".optcli/tasks/compile-variation.js");
var compileVariation = fs.existsSync(varPath) ?
require(varPath) :
require(path.resolve(__dirname,"./default-tasks/compile-variation.js"));
function Variation(attributes, baseDir) {
  Variation.super_.call(this, attributes, baseDir);
}

Variation.JSON_FILE_NAME = "variation.json";
Variation.JS_FILE_NAME = "variation.js";

util.inherits(Variation, OptCLIBase);

Variation.create = function(attrs, baseDir) {
  //create directory
  fileUtil.writeDir(baseDir);
  fileUtil.writeText(path.join(baseDir, Variation.JS_FILE_NAME));
  fileUtil.writeJSON(path.join(baseDir, Variation.JSON_FILE_NAME), attrs);
  return new Variation(attrs, baseDir);
}

Variation.prototype.getJSPath = function() {
  if (!this.baseDir) {
    logger.log("warn", "no base directory set");
    return null;
  }
  return path.join(this.baseDir, Variation.JS_FILE_NAME);
}

Variation.prototype.getJS = function() {
  return fileUtil.loadFile(this.getJSPath()) || "";
}

Variation.prototype.createRemote = function(client, folder) {

  //create new variation
  var varArgs = _.clone(this.attributes);
  varArgs['js_component'] = this.getJS();
  varArgs['experiment_id'] = experiment.attributes.id;
  var self = this;
  //Note:Not a Promise
  return compileVariation(folder, function(error, varArgs){
    if(error){logger.log("error", error); return;}
    varArgs['experiment_id'] = experiment.attributes.id;
    return client.createVariation(JSON.stringify(varArgs)).then(function(variationAttrs) {
      //TODO:Update Cache
      //update the id
      self.attributes.id = variationAttrs.id;
      self.saveAttributes();
      logger.log("info", "created remote variation: " + variationAttrs.id);
    }, function(error) {
      logger.log("error", error);
      logger.log("error", "unable to create remote variation: " + e.message);
      console.error(e.stack);
    });
  })
}

Variation.prototype.updateRemote = function(client, folder) {
  //create new experiment
  var varArgs = _.clone(this.attributes);
  varArgs['js_component'] = this.getJS();
  var self = this;
  //Note:Not a Promise
  return compileVariation(folder, function(error, varArgs){
    //TODO:Update Cache
    if(error){logger.log("error", error); return;}
    return client.updateVariation(JSON.stringify(varArgs)).then(function(variationAttrs) {
      logger.log("info", "updated remote variation: " + variationAttrs.id);
    }, function(error) {
      logger.log("error", error);
    }).catch(function(e) {
      logger.log("error", "unable to update remote variation: " + e.message);
      console.error(e.stack);
    });
  })
}

Variation.prototype.saveAttributes = function() {
  fileUtil.writeJSON(path.join(this.baseDir, Variation.JSON_FILE_NAME), this.attributes);
}

module.exports = Variation;
