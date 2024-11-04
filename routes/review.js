const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { reviewSchema } = require("../schema");
const Karting = require("../models/karting");
const Review = require("../models/reviews.js");

// reviews
const validateReviews = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error);
  } else {
    next();
  }
};

// review post
router.post(
  "/",
  validateReviews,
  wrapAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
      req.flash("error", "You need to login first");
      return res.redirect("/login");
    }
    let karting = await Karting.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.createdBy = req.user._id;
    console.log(newReview);
    karting.reviews.push(newReview);
    await newReview.save();
    await karting.save();
    req.flash("success", "Review has created");
    res.redirect(`/kartings/${karting._id}`);
  })
);

// review delete

router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.createdBy.equals(res.locals.currUser._id)) {
      req.flash("error", "can't delete");
      return res.redirect(`/kartings/${id}`);
    }
    await Karting.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review has deleted");
    res.redirect(`/kartings/${id}`);
  })
);

module.exports = router;
