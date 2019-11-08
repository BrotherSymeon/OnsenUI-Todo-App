var express = require("express");
var router = express.Router();
var cypto = require("crypto");


/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Expressv" });
});





module.exports = router;
