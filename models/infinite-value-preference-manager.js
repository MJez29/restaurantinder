let Preference = require("./preference");

module.exports = class InfiniteValuePreferenceManager {

    constructor(cmp) {
        // this.preferences: {
        //     this.value: T,
        //     this.pref: Preference
        // } []
        this.preferences = [];

        // The comparative algorithm to use on this.preferences
        // value1 is the object in the array, value2 is the object to be added
        // function sort(value1: T, value2: T) {
        //      Return -1 if value1 > value2
        //      Return 0 if value1 == value2
        //      Return 1 if value1 < value2
        // }
        this.compare = cmp;
    }

    // Adds a preference to the this.preferences array
    // If a preference is already in the array it is overwritten with the new value
    // Uses binary search to find location
    //
    // pref: {
    //     value: T,
    //     pref: string
    // }
    addPref(pref) {

        let low = 0, high = this.preferences.length;
        
        while (low < high) {
            let mid = (low + high) >>> 1;
            let c = this.compare(this.preferences[mid].value, pref.value); 
            if (c < 0) {
                high = mid;
            } else if (c == 0) {
                this.preferences[mid] = pref;
                return;
            } else {
                low = mid + 1;
            }
        }

        this.preferences.splice(low, 0, pref);
    }

    // Interpolation techniques should be used to provide a better rating and vary depending on type T
    //
    // v: T
    rate(v) {
        throw new Error("InfiniteValuePreferenceManager.rate() not implemented");
    }
}