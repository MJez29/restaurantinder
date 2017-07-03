let ActiveSuggestion = require("./active-suggestion");

//Map of all active suggestions
//Key: Integer corresponding to /go/:key
//Value: An ActiveSuggestion object
let activeSuggestions = new Map();

//Map of all inactive suggestions
//Key: Integer corresponding to /go/:key
//Value: An InactiveSuggestion object
let inactiveSuggestions = new Map();

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

    return key;
}