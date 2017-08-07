let FixedValuePreferenceManager = require("./fixed-value-preference-manager");
let Preference = require("./preference");

let OPTIONS = ["$", "$$", "$$$", "$$$$"];

module.exports = class PricePreferenceManager extends FixedValuePreferenceManager {

    constructor() {
        super(OPTIONS);
    }

    /**
     * Returns -1, 0 or 1 based on which array the pref is in
     * The price rating of a restaurant is very rudementary and is not very meaningful
     * Cheap dishes can be found at expensive restaurants and vice versa at cheap restaurants
     * @param { { value: string, pref: string } } price 
     */
    rate(price) {
        if (this.good.includes(price.value)) {
            price.pref = Preference.GOOD;
            return 1;
        } else if (this.bad.includes(price.value)) {
            price.pref = Preference.BAD;
            return -1;
        } else {
            price.pref = Preference.NEUTRAL;
            return 0;
        }
    }

}