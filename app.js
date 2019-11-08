var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var crypto = require("crypto");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/events', verifyGithubPayload, eventsHandler);
app.use('/users', usersRouter);


function createComparisonSignature(body){
  const hmac = crypto.createHmac('sha1', process.env.SECRET);
  const self_signature = hmac.update(JSON.stringify(body)).digest('hex');
  return `sha1=${self_signature}`; // shape in GitHub header
}

function compareSignatures(signature, comparison_signature){
  const source = Buffer.from(signature);
  const comparison = Buffer.from(comparison_signature);
  return crypto.timingSafeEqual(source, comparison); // constant time comparison
}

function verifyGithubPayload(req, res, next){
  const { headers, body } = req;

  const signature = headers['x-hub-signature'];
  const comparison_signature = createComparisonSignature(body);

  if (!compareSignatures(signature, comparison_signature)) {
    return res.status(401).send('Mismatched signatures');
  }

  const { action, ...payload } = body;
  req.event_type = headers['x-github-event']; // one of: https://developer.github.com/v3/activity/events/types/ 
  req.action = action;
  req.payload = payload;
  next();
}

function eventsHandler(req, res){
  console.log(`${req.event_type} event recieved`);
    var { exec } = require("child_process");
    exec(
      "git pull ; git merge $(git rev-parse --abbrev-ref HEAD) ; refresh",
      function(error, stdout, stderr) {
        if (error) {
          console.error(`exec error: ${error}`);
          return res.sendStatus(500);
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        res.sendStatus(200);
      }
    );
  return res.sendStatus('got authentic event data through my new middleware!');
};

module.exports = app;
