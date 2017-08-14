let yelp = require("yelp-fusion");
let PricePreferenceManager = require("./price-preference-manager");
let DistancePreferenceManager = require("./distance-preference-manager");
let CategoryPreferenceManager = require("./category-preference-manager");
let Restaurant = require("./restaurant");
let fs = require("fs")
let LatLng = require("./lat-lng");
let Preference = require("./preference");
const SuggestionAction = require("./suggestion-action");

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

const TOTAL_API_CALLS = 7;

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

const FinalWeights = {
    ALREADY_SHOWN: 0.05,
    CATEGORIES: 0.2,
    PRICE: 0.17,
    DISTANCE: 0.18,
    RATING: 0.4
}

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
         * The current action to be performed by the suggestion engine
         * 
         * @type { number }
         * 
         */
        this.suggestionAction = SuggestionAction.MAKE_FIRST_API_CALL;

        /**
         * 
         * (TOTAL_API_CALLS - 1) Yelp requests are made when this.makeSecondAPICall == true.
         * This value is true if at least one of the calls was succesfull
         * 
         * @type { boolean }
         * 
         */
        this.successfulSecondAPICall = false;

        /**
         * 
         * The number of Yelp API calls the server has made for this app
         * 
         * @type { number }
         * 
         */
        this.numAPICalls = 0;

        /**
         * 
         * A good suggestion is a suggestion containing at least one good category
         * 
         * @type { number }
         * 
         */
        this.goodSuggestionsMade = 0;

        // The restaurants that have already been shown to the user
        this.alreadyShown = [];

        // The engine will continue to return random restaurants until it finds one with a category that the user likes
        this.foundGoodCategory = false;

        this.madeSecondAPICall = false;

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

        this.sort();

        // If found a food type the user likes
        if (this.foundGoodCategory) {

            // If there are still restaurants that serve the food type the user wants
            // and the user hasn't viewed too many restaurants
            if (this.categoryPreferenceManager.containsGoodCategory(this.restaurants[0].categories) && this.goodSuggestionsMade < 15) {

                // Keep on suggesting
                this.suggestionAction = SuggestionAction.MAKE_SUGGESTION;
                this.goodSuggestionsMade++;

            // If the server hasn't made a 2nd API call yet
            } else if (!this.madeSecondAPICall) {
                // Get more restaurants
                this.suggestionAction = SuggestionAction.MAKE_SECOND_API_CALL;

            // If there's nothing else that the server can do
            } else {

                // Make one final suggestion
                this.suggestionAction = SuggestionAction.MAKE_FINAL_SUGGESTION;
            }
        }

        this.timesRanked++;
        // this.capture();
    }

    // Sorts the restaurants based on their preferenceRating field
    sort() {
        // Sorts using insertion sort
        for (let i = 1; i < this.restaurants.length; ++i) {
            let x = this.restaurants[i];
            let j;
            for (j = i - 1; j >= 0 && this.restaurants[j].preferenceRating < x.preferenceRating; --j) {
                this.restaurants[j + 1] = this.restaurants[j];
            }
            this.restaurants[j + 1] = x;
        }
    }

    capture() {
        console.log("CAPTURING");
        fs.writeFile(this.timesRanked + ".json", JSON.stringify(this.restaurants, null, 4), (err) => {
            if (err) console.log(err);
            else console.log("FINISHED CAPTURING");
        });
    }

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

        switch(this.suggestionAction) {
            case SuggestionAction.MAKE_FIRST_API_CALL:
                this.suggestionAction = SuggestionAction.MAKE_SUGGESTION;

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

                    // Converts the data in Restaurant objects
                    for (let i = 0; i < this.restaurants.length; ++i) {
                        this.restaurants[i] = new Restaurant(this.restaurants[i]);
                    }

                    this.numAPICalls++;

                    res.json({ suggestion: this.restaurants[0], status: ServerStatus.ACTIVE_SUGGESTION });
                }).catch((err) => {
                    console.log(err);
                    res.json({ status: ServerStatus.YELP_API_REQUEST_ERROR });
                })
                break;

            case SuggestionAction.MAKE_SECOND_API_CALL:

                // If all API calls fail then make final suggestion
                this.suggestionAction = SuggestionAction.MAKE_FINAL_SUGGESTION;

                this.madeSecondAPICall = true;

                let max = this.distancePreferenceManager.getLargestDistance();

                // If the user was fine with the largest distance shown, then gets restaurants beyond that distance
                if (max.pref !== Preference.BAD) {
                    for (let i = 0, ang = 0; i < 6; ++i, ang += Math.PI * 2 / (TOTAL_API_CALLS - 1)) {
                        let pos = LatLng.move(this.lat, this.lng, max.value * 2, ang);
                        console.log(pos);
                        yelpClient.search({
                            latitude: pos.lat,
                            longitude: pos.lng,
                            categories: this.categoryPreferenceManager.toYelpAPICategoriesQuery(),
                            sort_by: "distance",
                            limit: 50
                        }).then((results) => {

                            this.numAPICalls++;

                            // Got new restaurants to make new suggestions with
                            if (results.jsonBody.businesses.length > 0) {
                                this.suggestionAction = SuggestionAction.MAKE_SUGGESTION;
                            }

                            // Goes through each new restaurant
                            for (let i = 0; i < results.jsonBody.businesses.length; ++i) {
                                let add = true;

                                // If it isn't already in the list then it adds the restaurant
                                for (let j = 0; j < this.restaurants.length; ++j) {
                                    if (this.restaurants[j].equals(results.jsonBody.businesses[i])) {
                                        add = false;
                                        break;
                                    }
                                }

                                for (let j = 0; j < this.alreadyShown.length; ++j) {
                                    if (!add || this.alreadyShown[j].equals(results.jsonBody.businesses[i])) {
                                        add = false;
                                        break;
                                    }
                                }

                                if (add) {
                                    // Must recalculate distances because they aren't relative to the user's location
                                    results.jsonBody.businesses[i].distance = LatLng.distance(this.lat, this.lng, results.jsonBody.businesses[i].coordinates.latitude, results.jsonBody.businesses[i].coordinates.longitude);
                                    this.restaurants.push(new Restaurant(results.jsonBody.businesses[i]));
                                }
                            }

                            // If this is the last API call to be made
                            if (this.numAPICalls == TOTAL_API_CALLS) {

                                // If got more restaurants
                                if (this.suggestionAction == SuggestionAction.MAKE_SUGGESTION) {

                                    // Ranks the restaurants
                                    this.rankRestaurants();

                                    this.capture();

                                    // Then returns the highest rating one
                                    res.json({ status: ServerStatus.ACTIVE_SUGGESTION, suggestion: this.restaurants[0], isSecondRound: true });
                                }
                                // If there are no new restaurants to show
                                else if (this.suggestionAction == SuggestionAction.MAKE_FINAL_SUGGESTION) {
                                    // TODO: Make final suggestion
                                }
                                // If something went wrong
                                else {
                                    res.json({ status: ServerStatus.YELP_API_REQUEST_ERROR });
                                }
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                            this.numAPICalls++;

                            if (this.numAPICalls == TOTAL_API_CALLS) {
                                // If got more restaurants
                                if (this.suggestionAction == SuggestionAction.MAKE_SUGGESTION) {

                                    // Ranks the restaurants
                                    this.rankRestaurants();

                                    this.capture();

                                    // Then returns the highest rating one
                                    res.json({ status: ServerStatus.ACTIVE_SUGGESTION, suggestion: this.restaurants[0], isSecondRound: true });
                                }
                                // If there are no new restaurants to show
                                else if (this.suggestionAction == SuggestionAction.MAKE_FINAL_SUGGESTION) {
                                    // TODO: Make final suggestion
                                }
                                // If something went wrong
                                else {
                                    res.json({ status: ServerStatus.YELP_API_REQUEST_ERROR });
                                }
                            }
                        })
                    }
                }    

                break;

            case SuggestionAction.MAKE_SUGGESTION:
                res.json({ suggestion: this.restaurants[0], status: ServerStatus.ACTIVE_SUGGESTION });
                break;

            case SuggestionAction.MAKE_FINAL_SUGGESTION:
                res.json({ suggestion: this.makeFinalSuggestion(), status: ServerStatus.INACTIVE_SUGGESTION });
                break;
        }
    }

    makeFinalSuggestion() {
        for (let i = 0; i < this.restaurants.length; ++i) {
            this.restaurants[i].preferenceRating = 1 * FinalWeights.ALREADY_SHOWN +
                this.categoryPreferenceManager.rateAll(this.restaurants[i].categories) * FinalWeights.CATEGORIES +
                this.pricePreferenceManager.rate(this.restaurants[i].price) * FinalWeights.PRICE + 
                this.distancePreferenceManager.rate(this.restaurants[i].distance) * FinalWeights.DISTANCE +
                ((this.restaurants[i].rating - 1) / 2 - 1) * FinalWeights.RATING;
        }
        
        for (let i = 0; i < this.alreadyShown.length; ++i) {
            this.alreadyShown[i].preferenceRating = 0 * FinalWeights.ALREADY_SHOWN +
                this.categoryPreferenceManager.rateAll(this.restaurants[i].categories) * FinalWeights.CATEGORIES +
                this.pricePreferenceManager.rate(this.restaurants[i].price) * FinalWeights.PRICE + 
                this.distancePreferenceManager.rate(this.restaurants[i].distance) * FinalWeights.DISTANCE +
                ((this.restaurants[i].rating - 1) / 2 - 1) * FinalWeights.RATING;
            this.restaurants.push(this.alreadyShown[i]);
        }

        this.sort();

        return this.restaurants[0];
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