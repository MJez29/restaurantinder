let yelp = require("yelp-fusion");

const yelpID = "IvsWcM41GPOQVYfNss_7Mg";
const yelpSecret = "JT1E6PJAya8CQQz2akRD8tEgagnTjmjlthiQFPqHlI3AlNBsmE2fTFcovlSSX8cP";
let yelpClient;

yelp.accessToken(yelpID, yelpSecret).then((res) => {
    yelpClient = yelp.client(res.jsonBody.access_token);
}).catch((err) => {
    console.log(err);
});

const DEFAULT_PRICES = [1, 2, 3, 4];

//The amount of time that a suggestion is active for in ms
const TIME_ACTIVE = 5 * 60 * 1000;

class Preference {

    constructor(neutral) {
        this.good = [];
        this.neutral = neutral;
        this.bad = [];
    }

    //Moves a preference from wherever it was to the good preferences array
    addGoodPref(pref) {
        let i;

        //If the preference is not already in the good array
        if (this.good.indexOf(pref) === -1) {
            //Adds to the good array
            this.good.push(pref);
        }

        //If the preference is in the neutral array
        if ((i = this.neutral.indexOf(pref)) !== -1) {
            //Removes it from the neutral array
            this.neutral.splice(i, 1);
        }

        //If the preference is in the bad array
        if ((i = this.bad.indexOf(pref)) !== -1) {
            //Removes it from the neutral array
            this.bad.splice(i, 1);
        }
    }

    //Moves a preference from wherever it was to the neutral preferences array
    addNeutralPref(pref) {
        let i;

        //If the preference is not already in the neutral array
        if (this.neutral.indexOf(pref) === -1) {
            //Adds to the neutral array
            this.neutral.push(pref);
        }

        //If the preference is in the good array
        if ((i = this.good.indexOf(pref)) !== -1) {
            //Removes it from the good array
            this.good.splice(i, 1);
        }

        //If the preference is in the bad array
        if ((i = this.bad.indexOf(pref)) !== -1) {
            //Removes it from the neutral array
            this.bad.splice(i, 1);
        }
    }

    //Moves a preference from wherever it was to the bad preferences array
    addBadPref(pref) {
        let i;

        //If the preference is not already in the bad array
        if (this.bad.indexOf(pref) === -1) {
            //Adds to the bad array
            this.bad.push(pref);
        }

        //If the preference is in the good array
        if ((i = this.good.indexOf(pref)) !== -1) {
            //Removes it from the good array
            this.good.splice(i, 1);
        }

        //If the preference is in the neutral array
        if ((i = this.neutral.indexOf(pref)) !== -1) {
            //Removes it from the neutral array
            this.neutral.splice(i, 1);
        }
    }
}

module.exports = class {

    constructor(key, lat, lng) {
        //The key of the suggestion /go/:key
        this.key = key;             //Integer

        //Location of the user
        this.lat = lat;             //Latitude
        this.lng = lng;             //Longitude

        //The number of suggestions given
        this.numSuggestions = 0;

        this.prices = new Preference(DEFAULT_PRICES);

        setTimeout(this.deactivate, TIME_ACTIVE);
    }

    //Adds a price that the user likes
    addGoodPricePref(price) {
        prices.addGoodPref(price);
    }

    //Adds a price the the user is neutral about
    addNeutralPricePref(price) {
        prices.addNeutralPref(price);
    }

    //Adds a price that the user doesn't like
    addBadPricePref(price) {
        prices.addBadPref(price);
    }

    //Returns a suggestion in the form of a Yelp Business object
    // {
    //     categories: [
    //         {
    //             title,
    //             alias
    //         }
    //     ],
    //     coordinates: {
    //         latitude,
    //         longitude
    //     },
    //     display_phone,
    //     distance,
    //     id,
    //     image_url,
    //     is_closed,
    //     location: {
    //         address1,
    //         address2,
    //         address3,
    //         city,
    //         country,
    //         display_address: [],
    //         state,
    //         zip_code
    //     },
    //     name,
    //     phone,
    //     price,
    //     rating,
    //     review_count,
    //     url,
    //     transactions: []
    // }
    suggest(req, res, next) {

        //If the engine hasn't suggested anything yet
        if (numSuggestions++ == 0) {

            //Gets a list of suggestions from yelp
            yelpClient.search({
                latitude: lat,
                longitude: lng,
                categories: "restaurants",
                distance: 25000,
                open_now: true,
                limit: 10
            }).then((results) => {
                //Returns the first suggestion
                res.json(results.businesses[0]);
            }).catch((err) => {
                console.log(err);
            })
        }
        //If less than 10 suggestions have been made
        else if (numSuggestions < 10) {
            //Suggests another restaurant randomly
            //10 restaurants should provide enough feedback to generate an accurate picture of what the user wants
            res.json(results.businesses[numSuggestions++]);
        }
        //TODO: 2nd yelp query
    }

    deactivate() {
        //TODO: Convert to inactive suggestion
        //TODO: Remove this from activeSuggestions and add to inactiveSuggestions
    }

    toString() {
        return "Active Suggestion {this.key}\nLatitude: {this.lat}\nLongitude: {this.lng}";
    }
}