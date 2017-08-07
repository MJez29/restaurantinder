let FixedValuePreferenceManager = require("./fixed-value-preference-manager");

let OPTIONS = ["$", "$$", "$$$", "$$$$"];

module.exports = class PricePreferenceManager extends FixedValuePreferenceManager {

    constructor() {
        super(OPTIONS);
    }

    //Returns -1, 0 or 1 based on which array the pref is in
    //The price rating of a restaurant is very rudementary and is not very meaningful
    //Cheap dishes can be found at expensive restaurants and vice versa at cheap restaurants
    rate(price) {
        if (price in this.good) {
            return 1;
        } else if (price in this.bad) {
            return -1;
        } else {
            return 0;
        }
    }

}