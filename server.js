var express = require("express");
var bodyParser = require("body-parser");
var morgan = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
//scraping
var cheerio = require("cheerio");
var request = require("request");
// //models folder
// var db = require("./models");
mongoose.Promise = Promise;

//initialize app
var PORT = 3000;
var app = express();

//configuire
//morgan logs requests
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
//express.static makes public folder a static directory
app.use(express.static("public"));

//mongoose & conecting to the mongo DB
mongoose.connect("mongodb://localhost/NFL", { useMongoClient: true });
var db = mongoose.connection;

db.once("open", function() {
    console.log("Mongoose Connection Successful");
});

// Routes //
app.get("/scrape", function(req, res) {
    //grabbing the info with req
    request("http://www.nytimes.com/", function(er, response, html) {
        //loding the res into cheerio save it to $ for short selector
        var $ = cheerio.load(html);
        //grabbing every h1 within the div
        $("article h2").each(function(i, element) {
            //saving result as empy object
            var result = {};
            console.log("wewerwerwer");
            //adding text and href of every link, saving as properties of the result obj
            result.title = $(this).find("a").text();
            result.link = $(this).find("a").attr("href");

            //creating new Article using the result we just got    
            var entry = new Article(result);
            entry.save(function(err, doc) {
                if (err) throw err;
                else {
                    console.log(doc);
                }
            });
        });
        // console.log(result);
    });
    res.send("Scrape Complete");
});




// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});