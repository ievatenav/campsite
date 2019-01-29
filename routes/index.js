const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const Campsite = require("../models/campsite");
const async = require("async");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Root Route
router.get("/", function(req, res){
    res.render("landing");
});

// Register Form
router.get("/register", function(req, res){
    res.render("register", {page: "register"});
});

// Create a new user
router.post("/register", function(req, res){
    let newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar
    });
    if(req.body.adminCode === "campinginadream4ever") {
        newUser.isAdmin = true;
    }
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
   res.render("login", {page: "login"}); 
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

// Forgot Password Route
router.get("/forgot", function(req, res) {
    res.render("forgot");
});

// Forgot Password Post Route
router.post("/forgot", function(req, res, next) {
    async.waterfall([
        function(done){
            crypto.randomBytes(20, function(err, buf){
                let token = buf.toString("hex");
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({email: req.body.email}, function(err, user){
                if(!user) {
                    req.flash("error", "No account with that email address exists.");
                    return res.redirect("back");
                }
                
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; //1 hour
                
                user.save(function(err){
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            let smtpTransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "ievatenav@gmail.com",
                    pass: process.env.GMAILPW
                }
            });
            let mailOptions = {
                 to: user.email,
                 from: "ievatenav@gmail.com",
                 subject: "CampSite Password Reset",
                 text: "You are recieving this email because you have requested the reset of the password for your account.\n" +
                    "Please click on the following link, or paste this into your browser to complete the process:\n" +
                    "http://" + req.headers.host + "/reset/" + token + "\n\n" +
                    "If you did not request this, please ignore this email and your password will remain unchanged."
            };
            smtpTransport.sendMail(mailOptions, function(err){
                console.log("mail sent");
                req.flash("success", "An email has been sent to " + user.email + " with further instructions.");
                done(err, "done");
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect("back");
    });
});

// Password Reset Route
router.get("/reset/:token", function(req, res){
   User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now()}}, function(err, user){
       if(err || !user){
           req.flash("error", "Password reset token is invalid or expired.");
       } else {
           res.render("reset", {token: req.params.token});
       }
   }) ;
});

// Password Reset Post Route
router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'ievatenav@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'ievatenav@mail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/campsites');
  });
});

// // User Profile
// router.get("/users/:id", function(req, res){
//     // find the user with provided id
//   User.findById(req.params.id, function(err, foundUser){
//       if(err){
//           req.flash("error", "User could not be found!");
//           res.redirect("back");
//       } else {
//           Campsite.find().where('author.id').equals(foundUser._id).exec(function(err, campsites){
//               if(err){
//                   req.flash("error", "User could not be found!");
//                   res.redirect("back");
//               } else {
//                     // render show template with the chosen campsite
//                     res.render("users/show", {user: foundUser, campsites: campsites});
//               }
//           });
//       }
//   }); 
// });


// General Error Route
router.get("*", function(req, res){
    res.redirect("/campsites");
});

module.exports = router;