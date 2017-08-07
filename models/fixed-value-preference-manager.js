let Preference = require("./preference");

// The base class for preferences that can have a fixed set of values

module.exports = class FixedValuePreferenceManager {

    constructor(neutral = []) {
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

    // Adds a preference to manage
    // Other classes should call this method rather than addGoodPref, addBadPref and addNeutralPref
    //
    // pref: {
    //     pref: string,        // One of the values of Preference
    //     value: string        // Which value the preference is for
    // }
    addPref(pref) {
        switch(pref.pref) {
            case Preference.GOOD:
                this.addGoodPref(pref.value);
                break;
            case Preference.NEUTRAL:
                this.addNeutralPref(pref.value);
                break;
            case Preference.BAD:
                this.addBadPref(pref.value);
                break;
        }
    }

    //Gives a given preference between -1 and 1
    //1 being good, 0 being neutral and -1 being bad
    rate(v) {

        //This method must be implemented in child classes
        throw new Error("Pref.rate() not implemented");
    }
}