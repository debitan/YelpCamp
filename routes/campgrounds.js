var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

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
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var price = req.body.price;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
          console.log(err);
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var newCampground = {name: name, image: image, description: desc, price: price, author:author, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            req.flash("error", err.message);
            console.log(err);
        } else {
            //redirect back to campgrounds page
            req.flash("success", "You successfully created a campground");
            res.redirect("/campgrounds");
        }
    });
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
//Update campground route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    geocoder.geocode(req.body.location, function (err, data) {
      if (err || !data.length) {
        console.log(err);
        req.flash('error', 'Invalid address');
        return res.redirect('back');
      }
      req.body.campground.lat = data[0].latitude;
      req.body.campground.lng = data[0].longitude;
      req.body.campground.location = data[0].formattedAddress;
  
      Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
          if(err){
              req.flash("error", err.message);
              res.redirect("back");
          } else {
              req.flash("success","Successfully Updated!");
              res.redirect("/campgrounds/" + campground._id);
          }
      });
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