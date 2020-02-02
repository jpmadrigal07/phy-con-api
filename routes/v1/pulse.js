const express = require("express");
const router = express.Router({
  mergeParams: true
});
const Pulse = require("../../models/pulse");
const { check, validationResult } = require("express-validator/check");
const moment = require("moment");

// CARD DETAILS ENDPOINTS

router.get("/", (req, res) => {
  let sort = {}
  if(req.query.ranking == '1-2') {
    sort = { pulse: 1 }
    delete req.query.ranking;
  } else {
    sort = { createdAt: -1 }
    delete req.query.ranking;
  }
  console.log(sort)
  req.query.deletedAt = { $exists: false };
  Pulse.find(req.query)
    .populate({path : 'userId'})
    .sort(sort)
    .exec((err, allPulse) => {
      if (err) {
        res.json({
          error: true,
          message: err
        });
      } else {
        res.json({
          error: false,
          message: allPulse
        });

        console.log(allPulse);
      }
    });
});

router.post(
  "/",
  [
    check("userId", "User Id is required.")
      .not()
      .isEmpty(),
    check("score", "Score is required.")
      .not()
      .isEmpty()
  ],
  (req, res) => {
    const newPulse = new Pulse({
      userId: req.body.userId,
      pulse: req.body.pulse
    });

    Pulse.create(newPulse, (err, pulse) => {
      if (err) {
        res.json({
          error: true,
          message: err
        });
      } else {
        res.json({
          error: false,
          message: "Successfully added!"
        });
      }
    });
  }
);

router.put("/", (req, res) => {
  Pulse.updateMany(
    {},
    { $set: { deletedAt: moment() } },
    (err, deletedPulse) => {
      if (err) {
        res.json({
          error: true,
          message: err
        });
      } else {
        res.json({
          error: false,
          message: "Successfully reset the scores!"
        });
      }
    }
  );
});

module.exports = router;
