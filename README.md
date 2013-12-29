express-jslint-reporter
=======================

Express middleware to render jslint or jshint error reports on applicaton page load. Useful for ensuring your application is error free.

When in use, as long as your project has jslint errors, your GET requests to non-static files will render jslint error pages.

![Example report](http://erktime.github.io/screenshots/express-jslint-reporter-v1.png "Example report")

##Install

```
npm install express-jslint-reporter
```

##Configure
```
var lintReporter = require('express-jslint-reporter');

// In dev-mode, show jslint errors.
app.configure('development', function () {
  app.use(lintReporter({
    // Location of jslint xml report
    lintFile: './.jslint_errors.xml'
  }));
});
```

##Real world use
Use in combination with grunt to see up-to-date js errors on every page request.

Configure [grunt-contrib-jshint](https://npmjs.org/package/grunt-contrib-jshint) and  [grunt-contrib-watch](https://npmjs.org/package/grunt-contrib-watch) to build a jslint report on file changes.

```
grunt.initConfig({
  jshint: {    
    options: {
	  reporterOutput: ".jslint_errors.xml",
	  force: true,
	  reporter: "jslint"
	 },
	 src: ['./**/*.js']
  },
  
   watch: {
     options: {
       debounceDelay: 2000
     },
     scripts: {
       files: ['./**/*.js'],
       tasks: ['jshint']
     }
  }
});
```