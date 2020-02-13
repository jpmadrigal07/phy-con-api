const express = require("express");
const router = express.Router({
  mergeParams: true
});
const Run = require("../../models/run");
const { check, validationResult } = require("express-validator/check");
const moment = require("moment");

// CARD DETAILS ENDPOINTS

router.get("/", (req, res) => {
  let sort = {}
  if(req.query.ranking == 'steps-1-2') {
    sort = { steps: 1 }
    delete req.query.ranking;
  } else if(req.query.ranking == 'calories-1-2') {
    sort = { calories: 1 }
    delete req.query.ranking;
  } else {
    sort = { createdAt: -1 }
    delete req.query.ranking;
  }
  console.log(sort)
  req.query.deletedAt = { $exists: false };
  Run.find(req.query)
    .populate({path : 'userId'})
    .sort(sort)
    .exec((err, allRun) => {
      if (err) {
        res.json({
          error: true,
          message: err
        });
      } else {
        res.json({
          error: false,
          message: allRun
        });

        console.log(allRun);
      }
    });
});

router.get("/:id", (req, res) => {
	Run.find({userId: req.params.id}).sort({ createdAt: -1 }).exec((err, user) => {
		if (err) {
			res.json({
				error: true,
				message: err.message
			})
		} else {
			res.json({
				error: false,
				message: user
				// authData: req.authData
			})
		}
	});
});

router.post(
  "/",
  [
    check("userId", "User Id is required.")
      .not()
      .isEmpty(),
    check("steps", "Steps is required.")
      .not()
      .isEmpty(),
    check("calories", "Calories is required.")
      .not()
      .isEmpty()
  ],
  (req, res) => {
    const newRun = new Run({
      userId: req.body.userId,
      steps: req.body.steps,
      calories: req.body.calories
    });

    Run.create(newRun, (err, run) => {
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
   Run.updateMany(
    {},
    { $set: { deletedAt: moment() } },
    (err, deletedRun) => {
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
