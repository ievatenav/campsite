const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Campsite = require("./models/campsite");
const Comment = require("./models/comment");
const User = require("./models/user");
const seedDB = require("./seeds");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const flash = require("connect-flash");


// REQUIRING ROUTES
const campsiteRoutes = require("./routes/campsites");
const commentRoutes = require("./routes/comments");
const indexRoutes = require("./routes/index");


// APP CONFIG
// mongoose.connect('mongodb://localhost:27017/camp_site', { useNewUrlParser: true });
mongoose.connect('mongodb://admin:nimda1@ds213645.mlab.com:13645/campsite', { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash());
// seedDB(); // seed the database


// PASSPORT CONFIG 
app.use(require("express-session")({
    secret: "When you know you know!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use("/campsites", campsiteRoutes);
app.use("/campsites/:id/comments", commentRoutes);
app.use(indexRoutes);


// RUNNING SERVER
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The Camp Site Server is running on PORT " + process.env.PORT + "...");
});