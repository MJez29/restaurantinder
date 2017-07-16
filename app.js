let express = require("express");
let exphbs = require("express-handlebars");
let yelp = require("yelp-fusion");
let se = require("./models/suggestion-engine");
let bodyParser = require("body-parser");
let path = require("path");

let app = express();

app.use(express.static("public"));

app.engine("handlebars", exphbs({}));
app.set("view engine", "handlebars");

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const yelpID = "IvsWcM41GPOQVYfNss_7Mg";
const yelpSecret = "JT1E6PJAya8CQQz2akRD8tEgagnTjmjlthiQFPqHlI3AlNBsmE2fTFcovlSSX8cP";
let yelpClient;
/*
yelp.accessToken(yelpID, yelpSecret).then((res) => {
    yelpClient = yelp.client(res.jsonBody.access_token);

    yelpClient.search({ 
        latitude: "42.245333", 
        longitude: "-82.997789",
        distance: "10",
        categories: "food",
        price: "1,2,3",
        open_now: true
    }).then((res) => {
        console.log(JSON.stringify(res, null, 3));
    }).catch((err) => {
        console.log(err);
    })
}).catch((err) => {
    console.log(err);
});
*/
app.get("/", (req, res, next) => {
    res.sendFile(path.join(__dirname, "public", "app", "dist", "index.html"));
})

//Called by webpages, responds with a webpage
// app.get("/go", (req, res, next) => {
//     res.render("go");
// });

//Called to give location
app.post("/go", (req, res, next) => {
    let key = se.createSuggestion(req.body.lat, req.body.lng);

    //res.redirect(`/go/${key}`);
    console.log(key);
    res.send(JSON.stringify( {key : key} ));
});


app.get("/go/:key", (req, res, next) => {
    let sugg = se.getSuggestion(req.params.key).suggest(req, res, next);

    //If valid suggestion
    if (sugg) {
        res.send(sugg);
    }
});

//Gets the initial suggestion
//Makes firstYelp  API call
//5 minute timer begins
app.post("go/:key", (req, res, next) => {
    let sugg = se.getSuggestion(req.params.key).suggest(req, res, next);

    //If valid suggestion
    if (sugg) {
        res.send(sugg);
    }
});

app.put("go/:key", (req, res, next) => {
    let s = se.getActiveSuggestion(req.params.key);

    //If the suggestion is active
    if (s) {
        s.update(req, res, next);
        s.suggest(req, res, next);
    }
    
    else {
        s = se.getInactiveSuggestion(req.params.key);

        //If the suggestion is inactive
        if (s) {
            //TODO: Do something with the inactive suggestion
        }
        else {
            res.send("Key is not valid. It's possible that it has expired or you made a typo");
        }
    }
})

app.listen(3000, () => {
    console.log("Listening on port 3000");
});