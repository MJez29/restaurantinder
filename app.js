let express = require("express");
let exphbs = require("express-handlebars");
let yelp = require("yelp-fusion");
let se = require("./models/suggestion-engine");
let bodyParser = require("body-parser");

let app = express();

app.use(express.static("public"));

app.engine("handlebars", exphbs({}));
app.set("view engine", "handlebars");

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const yelpID = "IvsWcM41GPOQVYfNss_7Mg";
const yelpSecret = "JT1E6PJAya8CQQz2akRD8tEgagnTjmjlthiQFPqHlI3AlNBsmE2fTFcovlSSX8cP";
let yelpClient;

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

app.get("/", (err, req, res, next) => {
    if (err)
        return console.log(err);

    res.render("home");
})

//Called by webpages, responds with a webpage
app.get("/go", (err, req, res, next) => {

});

//Called to give location and begin suggestions
app.post("/go", (err, req, res, next) => {

});

// app.listen(process.env.PORT || 3000, () => {
//     console.log("Listening on port 3000");
// })