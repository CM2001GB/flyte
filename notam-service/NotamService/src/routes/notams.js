const express = require('express');
const router = express.Router();
const db = require('../database');

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


// ---------------------------------------
// GET /notams/check - pre-flight safety query, defined before "check" to avoid 
// being captured as an id parameter by notam/:id - this is because Express likes to match routes
// from top to bottom, so if we had this below the notam/:id block then it would try using the id
// defined in this route instead, keeping it up here avoids that
// ---------------------------------------
router.get('/check', (req, res) => {
    const { lat, lon, radius, date } = req.query;

    // Validate all query params present
    if (!lat || !lon || !radius || !date) {
        return res.status(400).json({
            error: 'Missing required query parameters: lat, lon, radius, date.'
        });
    }

    // parse to numbers and validate
    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);
    const parsedRadius = parseFloat(radius);

    if (isNaN(parsedLat) || isNaN(parsedLon) || isNaN(parsedRadius)) {
        return res.status(400).json({
            error: 'lat, lon, and radius must be valid numbers'
        });
    }

    // 1: find all NOTAMs active on given date
    const activeNotams = db.prepare(`
        SELECT * FROM notams
        WHERE start_date <= ? AND end_date >= ?
    `).all(date, date);

    // 2: filter distance using Haversine
    // notam is 'in range' if the distance between the query point
    // and the NOTAM's centre is less than the query radius + NOTAM radius
    const inRange = activeNotams.filter((notam) => {
        const distance = haversineKm(parsedLat, parsedLon,
            notam.latitude, notam.longitude);
        return distance <= parsedRadius + notam.radius;
    });

    res.json({
        safe: inRange.length === 0,
        active_notams: inRange,
        checked_at: new Date().toISOString()
    });
});

// ---------------------------------------
// POST /notams - create new notam
// ---------------------------------------

router.post('/', (req, res) => {
    const { title, description,
            latitude, longitude, radius,
            start_date, end_date,
            severity } = req.body;
    
    // validate required fields, push to array if missing and throw error of missing fields
    const missing = [];
    if (!title) missing.push('title');
    if (!latitude == null) missing.push('latitude');
    if (!longitude == null) missing.push('longitude');
    if (!radius == null) missing.push('radius');
    if (!start_date) missing.push('start_date');
    if (!end_date) missing.push('end_date');
    // if missing array > 0 there's a missing field, throw 400 error and identify which field
    if (missing.length > 0) {
        return res.status(400).json({
            error: `Missing required fields: ${missing.join(', ')}`
        });
    }

    const stmt = db.prepare(`
        INSERT INTO notams (title, description, latitude, longitude, radius, start_date, end_date, severity) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)    
    `);

    const result = stmt.run(
    title,
    description || null,
    latitude,
    longitude,
    radius,
    start_date,
    end_date,
    severity || 'advisory'
    );

    // fetch new row, and return it
    const created = db.prepare(`SELECT * FROM notams WHERE id = ?`).get(result.lastInsertRowid);

    res.status(201).json(created);
});

// ---------------------------------------
// GET /notams - List all NOTAMs
// ---------------------------------------
router.get('/', (req, res) => {
    const notams = db.prepare('SELECT * FROM notams').all();
    res.json(notams);
})

// ---------------------------------------
// GET /notams/:id - get single notam by ID
// ---------------------------------------

router.get('/:id', (req, res) => {
    const notam = db.prepare('SELECT * FROM notams WHERE id = ?').get(req.params.id);

    if (!notam) {
        return res.status(404).json({ error: 'NOTAM not found.'});
    }

    res.json(notam);
})

module.exports = router;