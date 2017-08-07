let InfiniteValuePreferenceManager = require("./infinite-value-preference-manager");
let Comparator = require("./comparator");
let Preference = require("./preference");

module.exports = class DistancePreferenceManager extends InfiniteValuePreferenceManager {

    constructor() {
        super(Comparator.forNumbers);
    }
    
    // Rates a distance by returning a number in [-1, 1]
    // If the value is in the array it returns -1, 0 or 1
    // If the value exceeds the greater bound or is below the lower bound it returns (-1, 0 or 1) / the distance between * scaling factor
    //
    // v: number
    /**
     * 
     * @param { { value: number, pref: string } } d 
     * @return { number }
     */
    rate(d) {
        let low = 0, high = this.preferences.length;
        
        while (low < high) {
            let mid = (low + high) >>> 1;
            let c = this.compare(this.preferences[mid].value, d.value); 
            if (c < 0) {
                high = mid;

            // If the value is in the array
            } else if (c == 0) {
                // Returns an extreme or 0
                switch (this.preferences[mid].pref) {
                    case Preference.GOOD:
                        d.pref = Preference.GOOD;
                        return 1;
                    case Preference.BAD:
                        d.pref = Preference.BAD;
                        return -1;
                    case Preference.NEUTRAL:
                    default:
                        d.pref = Preference.NEUTRAL;
                        return 0;
                }
            } else {
                low = mid + 1;
            }
        }

        // If the value is before the lower bound
        if (low == 0) {
            let r;
            switch (this.preferences[0].pref) {
                case Preference.GOOD:
                    r = Math.min(1, 2500 / (this.preferences[0].value - d.value));
                    if (r == 1) {
                        d.pref = Preference.GOOD;
                    }
                    return r;
                case Preference.BAD:
                    r = Math.max(-1, -2500 / (this.preferences[0].value - d.value));
                    if (r == -1) {
                        d.pref = Preference.BAD;
                    }
                    return r;
                case Preference.NEUTRAL:
                default:
                    d.pref = Preference.NEUTRAL;
                    return 0;
            }

        // If the value is after the upper bound
        } else if (low == this.preferences.length) {
            let r;
            switch (this.preferences[low - 1].pref) {
                case Preference.GOOD:
                    r = Math.min(1, 2500 / (d.value - this.preferences[low - 1].value));
                    if (r == 1) {
                        d.pref = Preference.GOOD;
                    }
                    return r;
                case Preference.BAD:
                    r = Math.max(-1, -2500 / (d.value - this.preferences[low - 1].value));
                    if (r == -1) {
                        d.pref = Preference.BAD;
                    }
                    return r;
                case Preference.NEUTRAL:
                default:
                    d.pref = Preference.NEUTRAL;
                    return 0;
            }

        // If the value is in the bounds
        // Linearly interpolates between the lower and upper nearest preferences
        } else {
            let r = ((Preference.toNumber(this.preferences[low].pref) - Preference.toNumber(this.preferences[low - 1].pref)) / 
                (this.preferences[low].value - this.preferences[low - 1].value) *
                (d.value - this.preferences[low - 1].value)) + Preference.toNumber(this.preferences[low - 1]);
            
            switch (r) {
                case -1:
                    d.pref = Preference.BAD;
                    return r;
                case 1:
                    d.pref = Preference.GOOD;
                    return r;
                case 0:
                default:
                    d.pref = Preference.NEUTRAL;
                    return r;
            }
        }

    }

}