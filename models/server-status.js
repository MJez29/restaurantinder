/**
 * 
 * When the server responds to an API call, it will always respond with a JSON object
 * This object will always have a method called "status" to signal the state of the response
 * 
 * MAKE SURE TO UPDATE BOTH /models/server-status.js (this) and /public/app/src/server-status.ts
 * Version number is equal to the number of statuses
 * @version 7
 * 
 */
module.exports = {

    /**
     * 
     * The server was able to succesfully accomplish the action
     * 
     * @const
     * @type { string }
     * 
     */
    OK: "OK",

    /**
     * 
     * The server was unable to find a suggestion with the provided key
     * 
     * @const
     * @type { string }
     * 
     */
    INVALID_KEY: "INVALID_KEY",

    /**
     * 
     * An error occured when the server made a request to the Yelp API
     * 
     * @const
     * @type { string }
     * 
     */
    YELP_API_REQUEST_ERROR: "YELP_API_REQUEST_ERROR",

    /**
     * 
     * The server was unable to find an active suggestion with the provided key
     * It's possible that the suggestion is inactive or that the key is invalid
     * 
     * @const
     * @type { string }
     */
    INVALID_ACTIVE_KEY: "INVALID_ACTIVE_KEY",

    /**
     * 
     * An error occured when the server made a request to the Google Maps Geocoding API to geocode the user's location
     * into latitude and longitude
     * 
     * @const
     * @type { string }
     * 
     */
    GOOGLE_MAPS_GEOCODING_API_ERROR: "GOOGLE_MAPS_GEOCODING_API_ERROR",

    /**
     * 
     * This suggestion is a suggestion that the user can give preferences towards.
     * 
     * @const
     * @type { string }
     * 
     */
    ACTIVE_SUGGESTION: "ACTIVE_SUGGESTION",
    
    /**
     * 
     * This suggestion is the final one that the app will provide. The user cannot provide preferences
     * to alter this suggestion.
     * 
     * @const
     * @type { string }
     * 
     */
    INACTIVE_SUGGESTION: "INACTIVE_SUGGESTION"

}