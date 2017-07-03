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

    deactivate() {
        //TODO: Convert to inactive suggestion
        //TODO: Remove this from activeSuggestions and add to inactiveSuggestions
    }
}