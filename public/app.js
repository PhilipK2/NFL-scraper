// get the json from /articles
//then for each one display information on the page
//
//
$.getJSON("/articles", function(data){
    for (var i = 0; i < data.length; i++) {
        $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>")
    }
});

//whenever p tag is clicked
$(document).on("click", "p", function(){
    //empty notes from notes section
    $("#notes").empty();
    //save the id from the p tag
    var thisId = $(this).attr("data-id");
    //ajax call for the article
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
    //when this is done, add the note information to the page.
    .done(function(data){
        console.log(data);
        //title
        $("#notes").append("<h2>" + data.title + "</h2>");
        //an input to add new title
        $("#notes").append("<input id='titleinput' name='title'>");
        //textarea to add new note to body
        $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
        //a button to submit notes
        $("#notes").append("<button data-id ='" + data._id + "' id='savenote'>Save Note</button>");
    
        // if theres already a note in the article
        if (data.note) {
            //place the title and body into the corresponding areas
            $("#titleinput").val(data.note.title);
            $("#bodyinput").val(data.note.body);
        }
    });
});

//submit note button
//grab the id associated with the article
//POST request to change the note with AJAX

//get values from title input and text area

//when that is done log the response and empty the notes
//then remove the values entered in the input and textare for note entry

$(document).on("click", "#savenote", function(){
    var thisId = $(this).attr("data-id");

    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            title: $("#titleinput").val(),
            body: $("#bodyinput").val()
        }
    })

});