const RADIUS_OF_EARTH = 6378000;

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
     */
    static move(lat, lng, radius, angle) {
        let pos = {};
        pos.lat = lat + radius * Math.sin(angle) / RADIUS_OF_EARTH * (180 / Math.PI);
        pos.lng = lng + radius * Math.cos(angle) / RADIUS_OF_EARTH * (180 / Math.PI) / cos(lat * Math.PI / 180);
        return pos;
    }
}