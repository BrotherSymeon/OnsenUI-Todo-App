var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/deployhook', function(req, res){
  var {exec} = require('child_process');
  exec('git pull; refresh', function(error, stdout, stderr) {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.send(500);
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
    res.send(200);
  });
});

module.exports = router;
