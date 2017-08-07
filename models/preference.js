// The one of the 3 responses of a user to a suggestion

module.exports.GOOD = "good";

module.exports.NEUTRAL = "neutral";

module.exports.BAD = "bad";

module.exports.toNumber = (pref) => {
    switch (pref) {
        case module.exports.GOOD:
            return 1;
        case module.exports.BAD:
            return -1;
        default: 
            return 0;
    }
}