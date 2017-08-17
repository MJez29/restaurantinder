let ActiveSuggestion = require("./active-suggestion");

//Map of all active suggestions
//Key: Integer corresponding to /go/:key
//Value: An ActiveSuggestion object
let activeSuggestions = new Map();

//Map of all inactive suggestions
//Key: Integer corresponding to /go/:key
//Value: An InactiveSuggestion object
let inactiveSuggestions = new Map();

const SUGGESTION_DURATION = 1000 * 60 * 10;

//Generates a random integer
function randint() {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
};

module.exports.createSuggestion = (lat, lng) => {
    let key;
    while (true) {

        //Generates random key
        key = randint();

        //Checks to make sure key is unique
        if (!(key in activeSuggestions.keys()) && !(key in inactiveSuggestions.keys())) {
            break;
        }
    }

    let actSugg = new ActiveSuggestion(key, lat, lng);
    //Adds a new suggestion to the list of active suggestions
    activeSuggestions.set(key, actSugg);

    // After 10 minutes the suggestion gets deleted
    setTimeout((key) => {
        activeSuggestions.delete(key);
    }, SUGGESTION_DURATION, key);

    return key;
}

module.exports.getNumActiveSuggestions = () => {
    return activeSuggestions.size;
}

//Returns a suggestion, can be active or inactive or undefined if doesn't exist
module.exports.getSuggestion = (key) => {
    key = parseInt(key);
    return getActiveSuggestion(key) || getInactiveSuggestion(key);
};

//Returns an active suggestion or undefined if doesn't exist
getActiveSuggestion = (key) => {
    return activeSuggestions.get(key);
};

module.exports.getActiveSuggestion = getActiveSuggestion;

//Returns an inactive suggestion or undefined if doesn't exist
getInactiveSuggestion = (key) => {
    return inactiveSuggestions.get(key);
};

module.exports.getInactiveSuggestion = getInactiveSuggestion;

// Returns true if adding suggestion was successful
addPreferences = (key, pref) => {
    let sugg = getActiveSuggestion(parseInt(key));

    if (sugg) {
        sugg.addPreferences(pref);
        return true;
    } else {
        return false;
    }
}

module.exports.addPreferences = addPreferences;