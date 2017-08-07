let express = require("express");
let exphbs = require("express-handlebars");
let yelp = require("yelp-fusion");
let se = require("./models/suggestion-engine");
let bodyParser = require("body-parser");
let path = require("path");
let googleMapsClient = require("@google/maps").createClient({
    key: "AIzaSyBk9aL8r8Ss9hRDYI8MTR5u9eRPZRBgpdE"
});

let app = express();

app.use(express.static(path.join("public", "app", "dist")));

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

app.get("/go", (req, res, next) => {
    res.sendFile(path.join(__dirname, "public", "app", "dist", "index.html"));
})

//Called by webpages, responds with a webpage
// app.get("/go", (req, res, next) => {
//     res.render("go");
// });

//Receives the location of the user
//Creates an active suggestion and sends back the access key
// req.body: {
//     lat: number,
//     lng: number
// }
app.post("/go", (req, res, next) => {
    console.log("MOO" + req.body);
    if (req.body.lat && req.body.lng) {
        let key = se.createSuggestion(req.body.lat, req.body.lng);

        console.log(key);
        res.send(JSON.stringify( {key : key} ));
    }
    //Google Maps Geocoding API key: AIzaSyBk9aL8r8Ss9hRDYI8MTR5u9eRPZRBgpdE
});


app.get("/go/:key", (req, res, next) => {
    let sugg = se.getSuggestion(req.params.key).suggest(req, res, next);

    //If valid suggestion
    if (sugg) {
        res.send(sugg);
    }
});

app.post("/go/:key", (req, res, next) => {
    console.log(JSON.stringify(req.body, null, 4));
    se.addPreferences(req.params.key, req.body);
    res.send({ status: "OK" });
})

// Converts an address into latitude/longitude
// GET /geocode?addr1=ADDR_1&addr2=ADDR_2&addr3=ADDR_3
app.get("/geocode", (req, res, next) => {
    console.log(req.query);
    if (req.query.addr1) {
        googleMapsClient.geocode({
            address: `${req.query.addr1}, ${req.query.addr2}, ${req.query.addr3}`
        }, (err, resp) => {

            // If something went wrong
            if (err || resp.json.status !== "OK") {
                console.log(err);
                // TODO: Send status

            // If succesful geocode
            } else {
                res.json({
                    //TODO: Send status
                    lat: resp.json.results[0].geometry.location.lat, 
                    lng: resp.json.results[0].geometry.location.lng
                });
            }
        });
    } else {

    }
})

app.listen(3000, () => {
    console.log("Listening on port 3000");
});