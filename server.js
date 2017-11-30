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
    request("http://www.echojs.com/", function(er, response, html) {
        //loding the res into cheerio save it to $ for short selector
        var $ = cheerio.load(html);
        //grabbing every h within the div
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
    });
    res.send("Scrape Complete");
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
        //this is our models/articles selector
        Article
        .find({})
        .then(function(doc){
            //if we are able to find articles then display them
            res.json(doc);
        })
        .catch(function(err){
            //if unable to display err
            res.json(err);
        });
    });
    
    // This will grab an article by it's ObjectId
    app.get("/articles/:id", function(req, res) {
      // Finish the route so it finds one article using the req.params.id,  
      // and run the populate method with "note", 
      // then responds with the article with the note included
      Article
        .findOne({ _id: req.params.id })
        .populate("note")
        .then(function(doc){
            res.json(doc);
        })
        .catch(function(err){
            res.json(err);
        });
    });
    
    // Create a new note or replace an existing note
    app.post("/articles/:id", function(req, res) {
    
      // save the new note that gets posted to the Notes collection    
      // then find an article from the req.params.id
      // and update it's "note" property with the _id of the new note
        var noteEntry = new Note(req.body);
        noteEntry.save(function(err,noteDoc){
            if (err) throw err;
            else {
                console.log(noteDoc);
            }
        }).then(function(noteDoc){
            return Article.findOneAndUpdate({_id: req.params}, {note: noteEntry._id}, {new: true});
        })
        .then(function(doc){
            res.json(doc);
        })
        .catch(function(err){
            res.json(err);
        });
    
    });



// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});