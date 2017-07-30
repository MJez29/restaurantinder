let FixedPref = require("./fixed-pref");

let OPTIONS = ["$", "$$", "$$$", "$$$$"];

module.exports = class PricePref extends FixedPref {

    constructor() {
        super(OPTIONS);
    }

    //Returns -1, 0 or 1 based on which array the pref is in
    //The price rating of a restaurant is very rudementary and is not very meaningful
    //Cheap dishes can be found at expensive restaurants and vice versa at cheap restaurants
    rate(pref) {
        if (pref in this.good) {
            return 1;
        } else if (pref in this.bad) {
            return -1;
        } else {
            return 0;
        }
    }

}