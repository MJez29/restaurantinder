let yelp = require("yelp-fusion");
let PricePreferenceManager = require("./price-preference-manager");
let DistancePreferenceManager = require("./distance-preference-manager");
let CategoryPreferenceManager = require("./category-preference-manager");
let Restaurant = require("./restaurant");
let fs = require("fs")

const yelpID = "IvsWcM41GPOQVYfNss_7Mg";
const yelpSecret = "JT1E6PJAya8CQQz2akRD8tEgagnTjmjlthiQFPqHlI3AlNBsmE2fTFcovlSSX8cP";
let yelpClient;

const zomatoID = "7f517335abf7ab2f1dd537019eb5f8a2";

yelp.accessToken(yelpID, yelpSecret).then((res) => {
    yelpClient = yelp.client(res.jsonBody.access_token);
}).catch((err) => {
    console.log(err);
});

const DEFAULT_PRICES = ["$", "$$", "$$$", "$$$$"];

const GOOD = "GOOD";
const NEUTRAL = "NEUTRAL";
const BAD = "BAD";

// All 3 weights must add up to 1
/**
 * 
 * The weight assigned to the categories rating
 * 
 * @const
 * @type { number }
 * 
 */
const CATEGORY_WEIGHT = 0.6;

/**
 * 
 * The weight assigned to the price rating
 * 
 * @const
 * @type { number }
 * 
 */
const PRICE_WEIGHT = 0.2;

/**
 * 
 * The weight assigned to the distance rating
 * 
 * @const
 * @type { number }
 * 
 */
const DISTANCE_WEIGHT = 0.2;

//The amount of time that a suggestion is active for in ms
const TIME_ACTIVE = 5 * 60 * 1000;

/**
 * @external Category
 * @see {@link category-preference-manager.js}
 */

module.exports = class {

    constructor(key, lat, lng) {
        //The key of the suggestion /go/:key
        this.key = key;             //Integer

        //Location of the user
        this.lat = lat;             //Latitude
        this.lng = lng;             //Longitude

        //The number of suggestions given
        this.numSuggestions = 0;

        this.timesRanked = 0;

        this.pricePreferenceManager = new PricePreferenceManager();
        this.distancePreferenceManager = new DistancePreferenceManager();
        this.categoryPreferenceManager = new CategoryPreferenceManager();

        setTimeout(this.deactivate, TIME_ACTIVE);
    }

    //Takes feedback from the user and uses it to provide more accurate suggestions
    //
    // pref: {
	// 	price: {
	// 		value: string,			//"$", "$$", "$$$", "$$$$"
	// 		pref: string			//"GOOD", "BAD", "NEUTRAL"
	// 	}, 
	// 	distance: {
	// 		value: number,			//The distance in meters
	// 		pref: string			//"GOOD", "BAD", "NEUTRAL"
	// 	},
	// 	categories: {
	// 		value: string,			//The category title
	// 		pref: string			//"GOOD", "BAD", "NEUTRAL"
	// 	}[]
    // }
    
    addPreferences(prefs) {
        if (this.timesRanked == 0)
            console.log(this.timesRanked + ": " + JSON.stringify(this.distancePreferenceManager.preferences, null, 4));
        this.restaurants.shift();
        this.pricePreferenceManager.addPref(prefs.price);
        this.distancePreferenceManager.addPref(prefs.distance);
        this.categoryPreferenceManager.addPrefs(prefs.categories);
        this.rankRestaurants();
    }

    /**
     * 
     * Assigns each restaurant a rating based on user preferences and then sorts the array.
     * Sorted from highest rated to lowest rated
     * 
     * @private
     * @return { void }
     * 
     */
    rankRestaurants() {

        if (this.timesRanked == 0)
            this.capture();

        for (let i = 0; i < this.restaurants.length; ++i) {
            let priceRating = this.restaurants[i].pricePreferenceRating = this.pricePreferenceManager.rate(this.restaurants[i].price);
            let distanceRating = this.restaurants[i].distancePreferenceRating = this.distancePreferenceManager.rate(this.restaurants[i].distance);
            let categoryRating = this.restaurants[i].categoryPreferenceRating = this.categoryPreferenceManager.rateAll(this.restaurants[i].categories);

            // Overall rating is the average of the 3 individual ratings
            this.restaurants[i].preferenceRating = priceRating * PRICE_WEIGHT + distanceRating * DISTANCE_WEIGHT + categoryRating * CATEGORY_WEIGHT;
        }

        // Sorts using insertion sort
        for (let i = 1; i < this.restaurants.length; ++i) {
            let x = this.restaurants[i];
            let j;
            for (j = i - 1; j >= 0 && this.restaurants[j].preferenceRating < x.preferenceRating; --j) {
                this.restaurants[j + 1] = this.restaurants[j];
            }
            this.restaurants[j + 1] = x;
        }
        this.timesRanked++;
        this.capture();
        console.log(this.timesRanked + ": " + JSON.stringify(this.distancePreferenceManager.preferences, null, 4));
    }

    capture() {
        console.log("CAPTURING");
        fs.writeFile(this.timesRanked + ".json", JSON.stringify(this.restaurants, null, 4), (err) => {
            if (err) console.log(err);
            else console.log("FINISHED CAPTURING");
        });
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
    /**
     * 
     * @typedef Restaurant
     * @type object
     * @property { { title: string, alias: string } [] } categories
     * @property { { latitude: number, longitude: number } } coordinates
     * @property { string } display_phone
     * @property { number } distance
     * @property { string } id
     * @property { string } image_url
     * @property { boolean } is_closed
     * @property { { address1: string, address2: string, address3: string, city: string, country: string, display_address: string[], state: string, zip_code: string }} location
     * @property { string } name
     * @property { string } phone
     * @property { string } price
     * @property { number } rating
     * @property { number } review_count
     * @property { string } url
     * @property { string[] } transactions
     * 
     */
    suggest(req, res, next) {

        //If the engine hasn't suggested anything yet
        if (this.numSuggestions++ == 0) {

            //Gets a list of suggestions from yelp
            yelpClient.search({
                latitude: this.lat,
                longitude: this.lng,
                categories: "restaurants",
                distance: 25000,
                sort_by: "distance",
                limit: 50
            }).then((results) => {
                /**
                 * @type { Restaurant[] }
                 */
                this.restaurants = results.jsonBody.businesses;
                console.log("RESTAURANTS: " + this.restaurants.length);

                // Converts the data in Restaurant objects
                for (let i = 0; i < this.restaurants.length; ++i) {
                    this.restaurants[i] = new Restaurant(this.restaurants[i]);
                }

                res.json(this.restaurants[0]);
            }).catch((err) => {
                console.log(err);
            })
        }
        else if (this.numSuggestions < 4) {
            this.shuffle(this.restaurants);
            res.json(this.restaurants[0]);
        }
        //If less than 10 suggestions have been made
        else if (this.numSuggestions < 100) {
            res.json(this.restaurants[0]);
        }
        //TODO: 2nd yelp query
    }

    shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
}

    deactivate() {
        //TODO: Convert to inactive suggestion
        //TODO: Remove this from activeSuggestions and add to inactiveSuggestions
    }

    toString() {
        return "Active Suggestion {this.key}\nLatitude: {this.lat}\nLongitude: {this.lng}";
    }
}