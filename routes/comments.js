const express = require("express");
const router = express.Router({mergeParams: true});
const Campsite = require("../models/campsite");
const Comment = require("../models/comment");
const middleware = require("../middleware");


// NEW - show form to create a new comment
router.get("/new", middleware.isLoggedIn, function(req, res) {
    Campsite.findById(req.params.id, function(err, campsite){
        if(err){
            req.flash("error", "Comments could not be found!");
            res.redirect("back");
            console.log(err);
        } else {
            res.render("comments/new", {campsite: campsite}); 
        }
    });
});

// CREATE - add a new comment to a campsite
router.post("/", middleware.isLoggedIn, function(req, res){
    // lookup campsite using id
    Campsite.findById(req.params.id, function(err, campsite){
        if(err){
            req.flash("error", "Comment could not be found!");
            res.redirect("back");
        } else {
            // create new comment
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error", "Comment could not be saved!");
                    res.redirect("back");
                } else {
                    // add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // save comment
                    comment.save();
                    // connect new comment to campsite
                    campsite.comments.push(comment);
                    campsite.save();
                    // redirect to campsite show page
                    req.flash("success", "Successfully added comment!");
                    res.redirect("/campsites/" + campsite._id);
                }
            });
        }
    });
});

// EDIT - edit existing comment
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            req.flash("error", "Comment could not be found!");
            res.redirect("back");
        } else {
            res.render("comments/edit", {campsite_id: req.params.id, comment: foundComment});
        }
    });
});

// UPDATE - update existing comment
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            req.flash("error", "Comment could not be found!");
            res.redirect("back");
        } else {
            req.flash("success", "Your changes have been saved!");
            res.redirect("/campsites/" + req.params.id);  
        };
    })
});

// DESTROY - delete a comment
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            req.flash("error", "Comment could not be found!");
            res.redirect("back");
        } else {
            req.flash("success", "Comment was deleted!");
            res.redirect("/campsites/" + req.params.id);
        }
    });
});


module.exports = router;