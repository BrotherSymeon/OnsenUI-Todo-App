var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});
router.get("/deployhook", function(req, res) {
  console.log(req.query.secret);
  if (req.query.secret === process.env.SECRET) {
    console.log(`they match`);
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
  }else{
    console.log(`they Did NOT match`);
    return res.sendStatus(500);
  }
});

module.exports = router;
