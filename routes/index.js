var express = require("express");
var router = express.Router({mergeParams: true});
var User = require("../models/user");
var passport = require("passport");

// LANDING PAGE ROUTE
router.get("/", function(req,res){
   res.render("landing");
});

// REGISTER FORM
router.get("/register", function(req, res) {
    res.render("register");
});

// REGISTER LOGIC
router.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp, " + user.username);
            res.redirect("/campgrounds");
        });
        }
    );
});

// LOGIN FORM
router.get("/login", function(req, res) {
    res.render("login");
});

// LOGIN LOGIC
router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { 
        req.flash("error", err.message);
        return next(err); 
    }
    if (!user) { return res.redirect('/login'); }
    req.logIn(user, function(err) {
      if (err) { 
          req.flash("error", err.message);
          return next(err); 
      }
      var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/campgrounds';
      delete req.session.redirectTo;
      req.flash("success", "Welcome back " + user.username);
      res.redirect(redirectTo);
    });
  })(req, res, next);
});

// LOGOUT LOGIC
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Successfully logged you out");
    res.redirect("/campgrounds");
});

module.exports = router;