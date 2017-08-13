const RADIUS_OF_EARTH = 6371000;

module.exports = class LatLng {
    /**
     * 
     * Moves a lat/lng position based on a given angle and radius
     * 
     * @param { number } lat - Original latitude
     * @param { number } lng - Original longitude
     * @param { number } radius - Distance from original position in meters
     * @param { number } angle - Angle based on winding function in radians
     * 
     * @return { { lat: number, lng: number } }
     * 
     */
    static move(lat, lng, radius, angle) {
        let pos = {};
        pos.lat = lat + radius * Math.sin(angle) / RADIUS_OF_EARTH * (180 / Math.PI);
        pos.lng = lng + radius * Math.cos(angle) / RADIUS_OF_EARTH * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);
        return pos;
    }

    /**
     * 
     * Calculates the distance between 2 lat/lng pairs.
     * Algorithm can be found here: http://www.movable-type.co.uk/scripts/latlong.html.
     * 
     * @param { number } lat1 
     * @param { number } lng1 
     * @param { number } lat2 
     * @param { number } lng2 
     * 
     * @return { number }
     * 
     */
    static distance(lat1, lng1, lat2, lng2) {
        lat1 *= Math.PI / 180;
        lat2 *= Math.PI / 180;

        let deltaLat = lat2 - lat1;
        let deltaLng = (lng2 - lng1) * Math.PI / 180;

        let a = Math.pow(Math.sin(deltaLat / 2), 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.pow(Math.sin(deltaLng / 2), 2);
        
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return c * RADIUS_OF_EARTH;
    }
}