// Return distance (in km) between two points using Haversine distance
// Inspiration for haversineKm func is the code written by Ayushman Chaturvedi
// https://dev.to/ayushman/measure-distance-between-two-locations-in-javascript-using-the-haversine-formula-7dc
// Full disclosure I am not a mathematician and this has been cobbled together from various examples I could find and is 
// very much likely to be changed before FLYTE is ready for demonstration, no-one touch this thank you.

function haversineKm(lat1, lon1, lat2, lon2) {
    radius = 6371; // earth's approximate radius in km
    const toRad = (deg) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return radius * c;
}

module.exports = { haversineKm };