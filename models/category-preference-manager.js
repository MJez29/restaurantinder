let FixedValuePreferenceManager = require("./fixed-value-preference-manager");
let Preference = require("./preference");

// The weightings of good, neutral and bad categories when assigning ratings
/**
 * 
 * 
 * GOOD has the highest weight because, a restaurant may serve multiple types of food, some that the user likes and some that they don't
 * With equal weightings, this restaurant would never be found
 * 
 * @type { number } GOOD_WEIGHT
 * 
 */

const GOOD_WEIGHT = 3;
/**
 * 
 * @type { number }
 * @const
 * 
 */
const NEUTRAL_WEIGHT = 1;

/**
 * 
 * BAD has a medium weighting because it should have a slightly bigger impact on the rating than a category that
 * the user may have not even seen yet
 * 
 * @type { number }
 * @const
 * 
 */
const BAD_WEIGHT = 2;



/**
 * @typedef Category
 * @type { object }
 * @property { string } title

 * 
 * Manages user preferences for Yelp categories
 * @class
 * @extends FixedValuePreferenceManager
 * 
 */

module.exports = class CategoryPreferenceManager extends FixedValuePreferenceManager {

    constructor() {
        super();
    }

    /**
     * Returns true if it added a good preference
     * @description Adds multiple preferences
     * @param { { value: string, pref: string } [] } prefs - The preferences to be added
     * @returns { boolean }
     * 
     */
    addPrefs(prefs) {
        let b = false;
        for (let i = 0; i < prefs.length; ++i) {
            if (this.addPref(prefs[i])) {
                b = true;
            }
        }
        return b;
    }

    /**
     * 
     * Returns the preference it added
     * 
     * @description (PROTECTED) Adds a preference
     * @param { {value: string, pref: string } } pref - The preference to be added
     * @return { string }
     * 
     */
    addPref(pref) {
        switch (pref.pref) {
            case Preference.BAD:
                this.addBadPref(pref.value);
                return false;
            case Preference.GOOD:
                this.addGoodPref(pref.value);
                return true;
            case Preference.NEUTRAL:
                this.addNeutralPref(pref.value);
            default:
                return false;
        }
    }

    /**
     * 
     * Returns true if the array of categories contains at least 1 good category
     * 
     * @param { { title: string, alias: string } } categories
     * @return { boolean }
     */
    containsGoodCategory(categories) {
        for (let i = 0; i < categories.length; ++i) {
            if (this.good.includes(categories[i].alias))
                return true;
        }

        return false;
    }

    /**
     * Gives a weighted rating from -1 to 1 based on the categories passed and user preferences.
     * 
     * @param { { title: string, alias: string } } categories
     * @return { number }
     */
    rateAll(categories) {

        let total = 0;              // The sum of the values in ratings times their weights
        let weightTotal = 0;        // The sum of the weights

        for (let i = 0; i < categories.length; ++i) {

            // Rates a category
            let r = this.rate(categories[i].alias);

            // Weights it and adds it to the total as well as adding/updating the preference for the category to
            // the restaurant object
            if (r < 0) {
                total += r * BAD_WEIGHT;
                weightTotal += BAD_WEIGHT;
                categories[i].pref = Preference.BAD;
            } else if (r > 0) {
                total += r * GOOD_WEIGHT;
                weightTotal += GOOD_WEIGHT;
                categories[i].pref = Preference.GOOD;
            } else {
                total += r * NEUTRAL_WEIGHT;
                weightTotal += NEUTRAL_WEIGHT;
                categories[i].pref = Preference.NEUTRAL;
            }
        }

        return total / weightTotal;
    }

    /**
     * 
     * (PROTECTED) Rates a category by returning a number belonging to [-1, 1]
     * 
     * Returns -1, 0 or 1 based in if it is in this.bad, this.neutral or this.good respectively
     * 
     * @private
     * @param { string } v
     * @return { number } - [-1,1]
     * 
     */
    rate(v) {
        if (this.bad.includes(v)) {
            return -1;
        } else if (this.good.includes(v)) {
            return 1;
        } else {
            return 0;
        }
    }

    /**
     * 
     * Returns 
     */
    toYelpAPICategoriesQuery() {
        let s = "";

        for (let i = 0; i < this.good.length; ++i) {
            s += `${this.good[i]},`;
        }

        // Must remove extra comma at the end of string
        return s.substr(0, s.length - 1);
    }

}