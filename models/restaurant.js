let Preference = require("./preference");

/**
 * @class
 * 
 * Descriptions come in part from https://www.yelp.com/developers/documentation/v3/business_search
 */
module.exports = class Restaurant {

    constructor(data) {
        /**
         * A list of category title and alias pairs associated with this business as well as the user preference
         * @type { { title: string, alias: string, pref: string } [] }
         */
        this.categories = data.categories;

        for (let i = 0; i < this.categories.length; i++) {
            this.categories[i].pref = Preference.NEUTRAL;
        }

        /**
         * The coordinates of this business.
         * @type { { latitude: number, longitude: number } }
         */
        this.coordinates = data.coordinates;

        /**
         * Phone number of the business formatted nicely to be displayed to users. 
         * The format is the standard phone number format for the business's country.
         * @type { string }
         */
        this.display_phone = data.display_phone;

        /**
         * The distance in meters from the search location and the user's preference. 
         * This returns meters regardless of the locale.
         * @type { { value: number, pref: string } }
         */
        this.distance = {
            value: data.distance,
            pref: Preference.NEUTRAL
        };

        /**
         * Yelp id of this business.
         * @type { string }
         */
        this.id = data.id;

        /**
         * URL of photo for this business.
         * @type { string }
         */
        this.image_url = data.image_url;

        /**
         * Whether business has been (permanently) closed
         * @type { boolean }
         */
        this.is_closed = data.is_closed;

        /**
         * The location of this business, including address, city, state, zip code and country.
         * @type { { address1: string, address2: string, address3: string, city: string, country: string, display_address: string[], state: string, zip_code: string }}
         */
        this.location = data.location;

        /**
         * Name of this business.
         * @type { string }
         */
        this.name = data.name;

        /**
         * Phone number of the business.
         * @type { string }
         */
        this.phone = data.phone;

        /**
         * Price level of the business as well as the user preference to it.
         * Value is one of $, $$, $$$ and $$$$.
         * @type { { value: string, pref: string } }
         */
        this.price = {
            value: data.price,
            pref: Preference.NEUTRAL
        }

        /**
         * Rating for this business (value ranges from 1, 1.5, ... 4.5, 5).
         * @type { number }
         */
        this.rating = data.rating;

        /**
         * Number of reviews for this business.
         * @type { number }
         */
        this.review_count = data.review_count;

        /**
         * URL for business page on Yelp.
         * @type { string }
         */
        this.url = data.url;

        /**
         * A list of Yelp transactions that the business is registered for.
         * Current supported values are "pickup", "delivery", and "restaurant_reservation".
         * @type { string [] }
         */
        this.transactions = data.transactions;
    }
}