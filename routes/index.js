const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

// Root Route
router.get("/", function(req, res){
    res.render("landing");
});

// Register Form
router.get("/register", function(req, res){
    res.render("register");
});

// Create a new user
router.post("/register", function(req, res){
    let newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            passport.authenticate("local")(req, res, function(){
                req.flash("success", "Welcome to Camp Site, " + user.username + "!");
                res.redirect("/campsites");
            });
        }
    });
});

// Login Form
router.get("/login", function(req, res){
   res.render("login"); 
});

// Login Route
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campsites",
    failureRedirect: "/login"
}), function(req, res){
    
});

// Logout Route
router.get("/logout", function(req, res) {
   req.logout();
   req.flash("success", "Logged you out!");
   res.redirect("/campsites");
});

// Error Route
router.get("*", function(req, res){
    req.flash("error", "Sorry, page you were looking for was not found!");
    res.redirect("back");
});


module.exports = router;