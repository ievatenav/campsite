const express = require("express");
const router = express.Router();
const Campsite = require("../models/campsite");
const middleware = require("../middleware");

// INDEX - show all campsites
router.get("/", function(req, res){
    Campsite.find({}, function(err, campsites){
        if(err){
            console.log(err);
        } else {
            res.render("campsites/index", {campsites: campsites});
        }
    });
});

// NEW - show form to create new campsite
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campsites/new");
});

// CREATE - add new campsite to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    let name = req.body.name;
    let price = req.body.price;
    let img = req.body.img;
    let desc = req.body.description;
    let author = {
        id: req.user._id,
        username: req.user.username
    };
    let newCampsite = {name: name, price: price, img: img, description: desc, author: author};
    Campsite.create(newCampsite, function(err, campsite){
        if(err){
            req.flash("error", "Campsite could not be created!");
            res.redirect("back");
        } else {
            req.flash("success", "You just created a new campsite!");
            res.redirect("/campsites");
        }
    });
});

// SHOW - shows more info about one campsite
router.get("/:id", function(req, res){
    // find the campsite with provided id
    Campsite.findById(req.params.id).populate("comments").exec(function(err, foundCampsite){
        if(err){
            req.flash("error", "Campsite could not be found!");
            res.redirect("back");
        } else {
            // render show template with the chosen campsite
            res.render("campsites/show", {campsite: foundCampsite});
        }
    });
});

// EDIT - edit existing campsite info
router.get("/:id/edit", middleware.checkCampsiteOwnership, function(req, res){
    Campsite.findById(req.params.id, function(err, foundCampsite){
        if(err){
            req.flash("error", "Campsite could not be found!");
            res.redirect("back");
        } else {
            res.render("campsites/edit", {campsite: foundCampsite});
        }
    });
});

// UPDATE - update existing campsite info

router.put("/:id", middleware.checkCampsiteOwnership, function(req, res){
    Campsite.findByIdAndUpdate(req.params.id, req.body.campsite, function(err, updatedCampsite){
        if(err){
            req.flash("error", "Campsite could not be found!");
            res.redirect("back");
        } else {
            req.flash("success", "Your changes have been saved!");
            res.redirect("/campsites/" + req.params.id);  
        };
    })
});

// DESTROY - delete a campsite
router.delete("/:id", middleware.checkCampsiteOwnership, function(req, res){
    Campsite.findByIdAndRemove(req.params.id, function(err){
        if(err){
            req.flash("error", "Campsite could not be found!");
            res.redirect("back");
        } else {
            req.flash("success", "Campsite was deleted!");
            res.redirect("/campsites");
        }
    });
});


module.exports = router;