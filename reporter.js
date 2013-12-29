var Path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    xml2js = require('xml2js'),
    Deferred = require('promised-io/promise').Deferred,
    ejs = require('ejs');

var template = ejs.compile(fs.readFileSync(Path.join(__dirname, './template.ejs'), {
  encoding: 'utf8'
}));

/**
 * Create a jslint reporter request handler.
 * @param {Object} options The following options are suported:
 *    lintFile {String} The path of the jslint xml file. Defaults: ./jslint_errors.xml
 */
module.exports = function (options) {
  options = _.extend({
    lintFile: './.jslint_errors.xml'
  }, options || {});

  return function (req, res, next) {
    var ext = Path.extname(req.path);

    // Only look at GET requests for non files (paths with extensions)
    if (req.method === 'GET' && !ext) {
      getLintErrors(options.lintFile).then(function (lintErrors) {
        renderErrors(req, res, lintErrors);
      }, next);
    } else {
      next();
    }
  };
};

/**
 * Get the lint errors from an jslint xml file.o
 * @param {String} lintFile The path of the jslint xml file.
 * @return {Deferred} A promise object. It will resolve only if there are jslint errors found.
 */
var getLintErrors = function (lintFile) {
  var deferred = new Deferred();

  parseJslintXml(lintFile, function (err, lintErrors) {
    if (lintErrors) {
      deferred.resolve(lintErrors);
    } else {
      if (err && err.code === 'ENOENT') {
        console.warn('No jslint xml file found at:', lintFile);
      } else if (err) {
        console.log(err);
      }
      deferred.reject();
    }
  });

  return deferred.promise;
};

/**
 * Parse a jslint xml report.
 * @param {String} lintFile The path of the jslint xml file.
 * @param {Function} callback The function to invoke when the file is read. The callback will
 *    be called with the following params: callback(err, lintErrors).
 */
var parseJslintXml = function (lintFile, callback) {
  fs.readFile(lintFile, function (err, data) {
    if (err) {
      callback(err);
    } else {
      var parser = new xml2js.Parser({
        mergeAttrs: true
      });
      parser.parseString(data, function (err, result) {
        if (err) {
          callback(err);
        } else if (result && result.jslint) {
          callback(null, result.jslint.file);
        } else {
          callback('Invalid jslint xml file');
        }
      });
    }
  });
};

/**
 * Render the error report.
 * @param {Request} req The incoming request.
 * @param {Response} res The outgoing response.
 * @param {Array} lintErrors The jslint errors to render.
 */
var renderErrors = function (req, res, lintErrors) {
  var html = template({
    lintErrors: lintErrors
  });
  res.end(html);
};

