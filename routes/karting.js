const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { kartingSchema } = require("../schema");
const Karting = require("../models/karting");

const validateKarting = (req, res, next) => {
  let { error } = kartingSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error);
  } else {
    next();
  }
};

// index route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const sabKartings = await Karting.find({});
    res.render("kartings/index.ejs", { sabKartings });
  })
);

// new route
router.get("/new", (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You need to login first");
    return res.redirect("/login");
  }
  res.render("kartings/new.ejs");
});

// Show route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const oneKarting = await Karting.findById(id)
      .populate({ path: "reviews", populate: { path: "createdBy" } })
      .populate("owner");
    if (!oneKarting) {
      req.flash("error", "Karting does not exist");
      res.redirect("/kartings");
    }
    res.render("kartings/show.ejs", { oneKarting });
  })
);

// Create route
router.post(
  "/",
  validateKarting,
  wrapAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
      req.flash("error", "You need to login first");
      return res.redirect("/login");
    }
    let newKarting = new Karting(req.body.karting);
    newKarting.owner = req.user._id;
    await newKarting.save();
    req.flash("success", "New Product has shared");
    res.redirect("/kartings");
  })
);

// Edit route
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
      req.flash("error", "You need to login first");
      return res.redirect("/login");
    }
    let { id } = req.params;
    const karting = await Karting.findById(id);
    if (!karting) {
      req.flash("error", "Karting does not exist");
      res.redirect("/kartings");
    }
    res.render("kartings/edit.ejs", { karting });
  })
);

// update route
router.put(
  "/:id",
  validateKarting,
  wrapAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
      req.flash("error", "You need to login first");
      return res.redirect("/login");
    }
    let { id } = req.params;
    let karting = await Karting.findById(id);
    if (!karting.owner.equals(res.locals.currUser._id)) {
      req.flash("error", "you can't edit");
      return res.redirect(`/kartings/${id}`);
    }
    await Karting.findByIdAndUpdate(id, { ...req.body.karting });
    req.flash("success", "Product has edited");
    res.redirect(`/kartings/${id}`);
  })
);

// Delete route
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
      req.flash("error", "You need to login first");
      return res.redirect("/login");
    }
    let { id } = req.params;
    await Karting.findByIdAndDelete(id);
    req.flash("success", "Product has deleted");
    res.redirect("/kartings");
  })
);

module.exports = router;
