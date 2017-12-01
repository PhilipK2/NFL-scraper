var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

mongoose.Promise = Promise;

// Initialize Express
var app = express();
var PORT = process.env.port || 3000;


// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));

// allow the handlesbars engine to be in our toolset
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
// Now set handlebars engine
app.set('view engine', 'handlebars');

// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB

mongoose.connect("mongodb://heroku_z3tlr6hk:lgubt8tgq6jbeq26aitidn8ea8@ds125896.mlab.com:25896/heroku_z3tlr6hk");
var db = mongoose.connection;

db.once("open", function() {
    console.log("Mongoose connection successful.");
});

// Require the routes in our controllers js file
require("./controllers/controller.js")(app);


// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});