'use strict';
require('dotenv').config();
process.env.NODE_ENV = 'test';

const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');
const helmet      = require('helmet');
const path        = require('path');
const fs          = require('fs');

const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');

const app = express();

// Security headers with Helmet
app.use(helmet.frameguard({ action: 'sameorigin' }));
app.use(helmet.dnsPrefetchControl({ allow: false }));
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));

function getPath(subPath) {
  const p1 = path.join(__dirname, subPath);
  if (fs.existsSync(p1)) return p1;
  const p2 = path.join(process.cwd(), subPath);
  if (fs.existsSync(p2)) return p2;
  return p1;
}

app.use('/public', express.static(getPath('public')));

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Sample front-end
app.route('/b/:board/')
  .get(function (req, res) {
    res.sendFile(getPath('views/board.html'));
  });
app.route('/b/:board/:threadid')
  .get(function (req, res) {
    res.sendFile(getPath('views/thread.html'));
  });

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(getPath('views/index.html'));
  });

//Trigger test runner on demand if not already executed
app.get('/_api/get-tests', function(req, res, next) {
  if (!runner.report) {
    try {
      runner.run();
    } catch (e) {
      console.log('Error triggering test runner:', e.message);
    }
  }
  next();
});

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);

//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Global Error Handler
app.use(function(err, req, res, next) {
  console.error('Application Error:', err);
  res.status(500)
    .type('text')
    .send(err.message || 'Internal Server Error');
});

//Start server if not running in Vercel serverless environment
if (!process.env.VERCEL) {
  const listener = app.listen(process.env.PORT || 3000, function () {
    console.log('Your app is listening on port ' + listener.address().port);
  });
}

// Pre-run tests so report is available immediately unless running via Mocha CLI
const isMochaCli = process.argv.some(arg => typeof arg === 'string' && arg.includes('mocha'));
if (!isMochaCli) {
  setImmediate(function() {
    if (!runner.report) {
      try {
        runner.run();
      } catch (e) {
        console.log('Runner initialization error:', e.message);
      }
    }
  });
}

module.exports = app; //for testing and serverless export
