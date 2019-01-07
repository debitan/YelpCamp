// =================
// SETUP
// =================

var express                 = require("express"),
    app                     = express(),
    flash                   = require("connect-flash"),
    bodyParser              = require("body-parser"),
    mongoose                = require("mongoose"),
    passport                = require("passport"),
    LocalStrategy           = require("passport-local"),
    passportLocalMongoose   = require("passport-local-mongoose"),
    methodOverride          = require("method-override"),
    User                    = require("./models/user");
    // seedDB                  = require("./seedDB");
    
// =================
// ROUTE FILES
// =================
    
var campgroundRoutes = require("./routes/campgrounds");
var commentRoutes = require("./routes/comments");
var indexRoutes = require("./routes/index");

// =================
// CONFIG
// =================

mongoose.connect("mongodb://localhost/yelp_camp", {useNewUrlParser : true});
mongoose.set('useFindAndModify', false);
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB(); // seeds the database

// =================
// PASSPORT CONFIG
// =================

app.use(require("express-session")({
    secret: "Ellie is the bestest baby ever",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(currentUser);

// =================
// MIDDLEWARE
// =================

// PASSES USER INFO TO PAGE
function currentUser(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
}

// =================
// ROUTES
// =================

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

// =================
// LISTEN
// =================

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("YelpCamp has started");
});
