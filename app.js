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
//     useLatLng: boolean,
//     lat: number,
//     lng: number,
//     addr1: string,
//     addr2: string,
//     addr3: number
// }
app.post("/go", (req, res, next) => {
    //The user can either provide their position in latitude/longitude or as an address
    //If provided with lat/lng, the server responds synchronously because the position is in the format that the Yelp API uses
    //If provided with an address, the server converts the address to lat/lng with the Google Geocoding API asynchronously
    if (req.body.useLatLng) {
        let key = se.createSuggestion(req.body.lat, req.body.lng);

        console.log(key);
        res.send(JSON.stringify( {key : key} ));
    }
    else {
        //Google Maps Geocoding API key: AIzaSyBk9aL8r8Ss9hRDYI8MTR5u9eRPZRBgpdE
        googleMapsClient.geocode({
            address: `${req.body.addr1}, ${req.body.addr2}, ${req.body.addr3}`
        }, (err, resp) => {
            if (err)
                return console.log(err);
            
            console.log(resp.json);
            if (resp.json.status === "OK") {
                //Creates a new active suggestion with the location data from the Maps API request
                let key = se.createSuggestion(resp.json.results[0].geometry.location.lat, resp.json.results[0].geometry.location.lng);

                console.log(key);
                res.send(JSON.stringify( {key : key} ));
            }
            switch(resp.json.status) {
                case "OK": 
                    //Creates a new active suggestion with the location data from the Maps API request
                    let key = se.createSuggestion(resp.json.results[0].geometry.location.lat, resp.json.results[0].geometry.location.lng);

                    console.log(key);
                    res.send(JSON.stringify( {key : key} ));
                    break;
                case "ZERO_RESULTS": 
                    //A key of -1 indicates 
                    res.send(JSON.stringify( {key : -1} ));
                    break;
            }
        })
    }
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
    //TODO: Send next suggestion
    res.send({ status: "OK" });
})

app.listen(3000, () => {
    console.log("Listening on port 3000");
});