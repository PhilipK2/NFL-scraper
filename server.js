var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var request = require("request");
var Article = require("./models/Article.js");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");
var app = express();
var PORT = 3000;




// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
// Now set handlebars engine
app.set('view engine', 'handlebars');
// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/FridayTest2", {
    useMongoClient: true
});

// Routes
app
    .get('/', function(req, res) {
        res.redirect('/articles');
    });

app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with request
    axios.get("http://www.echojs.com/").then(function(response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $("article h2").each(function(i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            // Create a new Article using the `result` object built from scraping
            db.Article
                .create(result)
                .then(function(dbArticle) {
                    // If we were able to successfully scrape and save an Article, send a message to the client
                    // res.send("Scrape Complete");
                })
                .catch(function(err) {
                    // If an error occurred, send it to the client
                    res.json(err);
                });
        });
    });
    res.redirect("/");
});
// Tell the browser that we finished scraping the text
// res.send("Scrape Complete");




// Route for getting all Articles from the db
// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
    // Grab every doc in the Articles array
    db.Article
        .find({}, function(error, doc) {
            // Log any errors
            if (error) {
                console.log(error // Or send the doc to the browser as a json object
                );
            } else {
                res.render("index", { result: doc });
            }
            //Will sort the articles by most recent (-1 = descending order)
        })
        .sort({ '_id': -1 });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article
        .findOne({ "_id": req.params.id })
        // ..and populate all of the comments associated with it
        .populate("note")
        // now, execute our query
        .exec(function(error, doc) {
            // Log any errors
            if (error) {
                console.log(error // Otherwise, send the doc to the browser as a json object
                );
            } else {
                res.render("comments", { result: doc });
                // res.json (doc);
            }
        });
});

app.post("/articles/:id", function(req, res) {
    // Create a new Comment and pass the req.body to the entry
    db.Note
        .create(req.body, function(error, doc) {
            // Log any errors
            if (error) {
                console.log(error // Otherwise
                );
            } else {
                // Use the article id to find and update it's comment
                db.Article.findOneAndUpdate({
                        "_id": req.params.id
                    }, {
                        $push: {
                            "note": doc._id
                        }
                    }, {
                        safe: true,
                        upsert: true,
                        new: true
                    })
                    // Execute the above query
                    .exec(function(err, doc) {
                        // Log any errors
                        if (err) {
                            console.log(err);
                        } else {
                            // Or send the document to the browser
                            res.redirect('back');
                            console.log("wereryrityiktyuertye");
                        }
                    });
            }
        });
});

// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});