let yelp = require("yelp-fusion");
let PricePreferenceManager = require("./price-preference-manager");
let DistancePreferenceManager = require("./distance-preference-manager");
let CategoryPreferenceManager = require("./category-preference-manager");
let Restaurant = require("./restaurant");
let fs = require("fs")
let LatLng = require("./lat-lng");

const yelpID = "IvsWcM41GPOQVYfNss_7Mg";
const yelpSecret = "JT1E6PJAya8CQQz2akRD8tEgagnTjmjlthiQFPqHlI3AlNBsmE2fTFcovlSSX8cP";
let yelpClient;
let ServerStatus = require("./server-status");

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

/**
 * @param { number } value - The number to be clamped
 * @param { number } max - The maximum value of value
 * @param { number } min - The minimum value of value
 * @return { number }
 */
Math.clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
}

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
        /**
         * 
         * The key of the suggestion /go/:key
         * 
         * @type { number }
         * 
         */
        this.key = key;

        //Location of the user
        /**
         * 
         * The latitude of the user
         * 
         * @type { number }
         * 
         */
        this.lat = lat;

        /**
         * 
         * The longitude of the user
         * 
         * @type { number }
         * 
         */
        this.lng = lng;

        //The number of suggestions given
        this.numSuggestions = 0;

        this.timesRanked = 0;

        /**
         * 
         * If the server should make an API call to Yelp to get the first round of restaurants.
         * @desc Moo
         * 
         * @type { boolean }
         * 
         */
        this.makeFirstAPICall = true;

        /**
         * 
         * If the server should make an API call to Yelp to get the 2nd round of restaurants.
         * 
         * @type { bolean }
         * 
         */
        this.makeSecondAPICall = false;

        // The restaurants that have already been shown to the user
        this.alreadyShown = [];

        // The engine will continue to return random restaurants until it finds one with a category that the user likes
        this.foundGoodCategory = false;

        // True when the user has passed on all the restaurants with a category they like
        // Makes another Yelp API call with user preferences
        this.getMoreRestaurants = false;

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
        this.alreadyShown.push(this.restaurants.shift());
        this.pricePreferenceManager.addPref(prefs.price);
        this.distancePreferenceManager.addPref(prefs.distance);

        // If it adds a good preference
        if (this.categoryPreferenceManager.addPrefs(prefs.categories) || this.foundGoodCategory) {
            this.foundGoodCategory = true;
            this.rankRestaurants();
        } else {
            this.rankRestaurants(1);
        }
    }

    /**
     * 
     * Assigns each restaurant a rating based on user preferences and then sorts the array.
     * Sorted from highest rated to lowest rated
     * 
     * Skew can be added to randomize the rankings
     * 
     * @private
     * @param { number } skew - [0, 2]
     * @return { void }
     * 
     */
    rankRestaurants(skew = 0) {

        skew = Math.min(skew, 2);

        // if (this.timesRanked == 0)
        //     this.capture();

        for (let i = 0; i < this.restaurants.length; ++i) {
            let priceRating = this.restaurants[i].pricePreferenceRating = this.pricePreferenceManager.rate(this.restaurants[i].price);
            let distanceRating = this.restaurants[i].distancePreferenceRating = this.distancePreferenceManager.rate(this.restaurants[i].distance);
            let categoryRating = this.restaurants[i].categoryPreferenceRating = this.categoryPreferenceManager.rateAll(this.restaurants[i].categories);

            // Overall rating is the average of the 3 individual ratings
            this.restaurants[i].preferenceRating = Math.clamp(priceRating * PRICE_WEIGHT + distanceRating * DISTANCE_WEIGHT + categoryRating * CATEGORY_WEIGHT + (Math.random() - 0.5) * skew, -1, 1);
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

        if (this.foundGoodCategory && !this.categoryPreferenceManager.containsGoodCategory(this.restaurants[0].categories)) {
            this.makeSecondAPICall = true;
            console.log("NEED MORE RESTAURANTD BECAUSE THIS SHIT IS UNWORTHY: ");
            console.log(JSON.stringify(this.restaurants[0], null, 4));
        }

        this.timesRanked++;
        // this.capture();
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
        if (this.makeFirstAPICall) {

            this.makeFirstAPICall = false;

            //Gets a list of suggestions from Yelp
            yelpClient.search({
                latitude: this.lat,
                longitude: this.lng,
                categories: "restaurants",
                distance: 40000,
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

                res.json({ suggestion: this.restaurants[0], status: ServerStatus.OK });
            }).catch((err) => {
                console.log(err);
                res.json({ status: ServerStatus.YELP_API_REQUEST_ERROR });
            })
        }
        else if (this.makeSecondAPICall) {
            this.makeSecondAPICall = true;
            for (let i = 0, ang = 0; i < 6; ++i, ang += Math.PI / 3) {
                let pos = LatLng.move(this.lat, this.lng, /*RADIUS*/, ang);
                yelpClient.search({
                    latitude: pos.lat,
                    longitude: pos.lng,
                    categories: this.categoryPreferenceManager.toYelpAPICategoriesQuery,
                    sort_by: "distance",
                    limit: 50
                })
            }
        } else {
            res.json({ suggestion: this.restaurants[0], status: ServerStatus.OK });
        }
        // else if (this.numSuggestions < 4) {
        //     this.shuffle(this.restaurants);
        //     res.json({ suggestion: this.restaurants[0], status: ServerStatus.OK });
        // }
        // //If less than 10 suggestions have been made
        // else if (this.numSuggestions < 100) {
        //     res.json({ suggestion: this.restaurants[0], status: ServerStatus.OK });
        // }
        // //TODO: 2nd yelp query
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