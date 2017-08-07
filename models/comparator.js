module.exports = {
    forNumbers: (v1, v2) => {
        if (v1 > v2)
            return -1;
        else if (v1 == v2) 
            return 0;
        else 
            return 1;
    }
}