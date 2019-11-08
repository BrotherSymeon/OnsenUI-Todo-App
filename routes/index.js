var express = require("express");
var router = express.Router();
var cypto = require("crypto");


/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Expressv" });
});
router.post("/deployhook", function(req, res) {
  let sig = "sha1=" + crypto.createHmac('sha1', process.env.SECRET).update(chunk.toString()).digest('hex');

  if (req.query.secret === process.env.SECRET) {
    console.log(`they match yah`);
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


const createComparisonSignature = (body) => {
  const hmac = crypto.createHmac('sha1', process.env.SECRET);
  const self_signature = hmac.update(JSON.stringify(body)).digest('hex');
  return `sha1=${self_signature}`; // shape in GitHub header
}

const compareSignatures = (signature, comparison_signature) => {
  const source = Buffer.from(signature);
  const comparison = Buffer.from(comparison_signature);
  return crypto.timingSafeEqual(source, comparison); // constant time comparison
}

const verifyGithubPayload = (req, res, next) => {
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


module.exports = router;
