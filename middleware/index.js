var Campground = require("../models/campground");
var Comment = require("../models/comment");

var middlewareObj = {};

// CHECKS IF THE USER IS LOGGED IN
middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.session.redirectTo = req.originalUrl;
    req.flash("error", "You need to log in to do that")
    res.redirect("/login");
};

// CHECKS IF THE USER OWNS THE CAMPGROUND
middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, campground) {
            if(err){
                req.flash("error", "Ooops, we couldn't find that campground");
                res.redirect("back");
            } else {
                if(campground.author.id.equals(req.user._id)){
                    next();
                } else{
                    req.flash("error", "Sorry, you don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else{
        req.flash("error", "Sorry, you need to be logged in to do that");
        res.redirect("back");
    }
};

// CHECKS IF THE USER OWNS THE COMMENT
middlewareObj.checkCommentOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err){
                req.flash("error", "Ooops, we couldn't find that comment");
                res.redirect("back");
            } else {
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                } else{
                    req.flash("error", "Sorry, you don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else{
        req.flash("error", "Sorry, you need to be logged in to do that");
        res.redirect("back");
    }
};

module.exports = middlewareObj;