var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// INDEX - show all campgrounds
router.get("/", function(req, res){
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            req.flash("error", err.message);
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds:allCampgrounds});
        }
    });
});

// NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

// CREATE - add a new campground to the database
router.post("/", middleware.isLoggedIn, function(req, res){
    Campground.create(req.body.campground, function(err, newlyCreated){
        if(err){
            req.flash("error", err.message);
            console.log(err);
        } else {
            req.flash("success", "You successfully created a campground");
            res.redirect("/campgrounds");     
        }
    });
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function(err, campground){
        if(err){
            req.flash("error", err.message);
            console.log(err);
        } else {
            res.render("campgrounds/show", {campground: campground});
        }
    });
});

// EDIT - show form to edit
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        } else{
            res.render("campgrounds/edit", {campground: campground});
        }
    });
});

// UPDATE - save edits to the database
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err) {
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "You successfully edited a campground");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// DESTROY - remove campground from database
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err) {
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        } else {
            Comment.deleteMany({
                _id: {
                    $in: campground.comments
                }
            }, function(err, result) {
                if(err) {
                    req.flash("error", err.message);
                    console.log(err);
                }
            })}
            campground.remove(function(err, deletedCampground){
                if(err) {
                    req.flash("error", err.message);
                    console.log(err);
                    res.redirect("/campgrounds");
                } else {
                    req.flash("success", "You successfully deleted a campground");
                    res.redirect("/campgrounds");
                }
            });
        });
});

module.exports = router;