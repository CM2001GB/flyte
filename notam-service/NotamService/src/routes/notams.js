const express = require('express');
const router = express.Router();
const db = require('../database');

const { haversineKm } = require('../../services/HaversineKm.js');
const { fetchNotams, parseNotams } = require('../../services/NatsPibClient.js');
const { classifyNotam } = require('../../services/notam-classifier.js');
const { evaluate } = require('../notam-safety.js');
const { ingestNotams } = require('../../services/notam-ingester.js');

// ---------------------------------------
// GET /notams - get NOTAMS for DB
// ---------------------------------------

// in theory this function is literally just going to call NatsPibClient.js fetch/parse xml functions
// to ensure the DB is populated/refreshed before the user's specific notam is fetched
router.get('/refresh', async (req, res) => {
    try { // check if either function returns a promise, if they do wait.
        await ingestNotams();
        res.json({ status: "ok", message: "NOTAM Database refreshed." });
    } catch (err) {
        res.status(500).json({error: 'Failed to refresh NOTAMs', detail: err.message });
    }
});

// --------------------------------------- 
// GET /notams/nearby - get nearby NOTAM by user lat/lon
// ---------------------------------------

router.get('/evaluate', (req, res) => {
    const { lat, lon, radius = 5 } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({
            error: 'Missing required query parameters: lat, lon.'
        });
    }

    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);
    const parsedRadius = parseFloat(radius);

    if (isNaN(parsedLat) || isNaN(parsedLon) || isNaN(parsedRadius)) {
        return res.status(400).json({
            error: 'lat, lon, and radius must be valid numbers.'
        });
    }

    const degRange = parsedRadius / 111;
    const candidates = db.prepare(`
        SELECT * FROM notams
        WHERE latitude IS NOT NULL
        AND latitude BETWEEN ? AND ?
        AND longitude BETWEEN ? AND ?
        AND end_date >= datetime('now')
    `).all(
        parsedLat - degRange, parsedLat + degRange,
        parsedLon - degRange, parsedLon + degRange
    );

    const nearby = candidates
        .map(notam => {
            const distance = haversineKm(parsedLat, parsedLon,
                notam.latitude, notam.longitude);
            const classification = classifyNotam(notam.q_code);
            return { ...notam, distance_km: distance, ...classification };
        })
        .filter(notam => notam.distance_km <= parsedRadius)
        .sort((a, b) => a.distance_km - b.distance_km);

    // use the safety evaluator — same pattern as weather service
    const result = evaluate(nearby);

    res.json({
        verdict: result.verdict,
        breached_conditions: result.breached_conditions,
        notams: nearby
    });
});

router.get('/nearby', (req, res) => {
    
    const { lat, lon, radius = 50} = req.query;

    if (!lat || !lon) {
        return res.status(400).json({
            error: 'Missing required query parameters: lat, lon.'
        });
    }

    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);
    const parsedRadius = parseFloat(radius);

    if (isNaN(parsedLat) || isNaN(parsedLon) || isNaN(parsedRadius)) {
        return res.status(400).json({
            error: 'lat, lon, and radius must be valid numbers.'
        });
    }

    const degRange = parsedRadius / 111;
    const notam_candidates = db.prepare(`
        SELECT * FROM notams
        WHERE latitude is NOT NULL
        AND latitude BETWEEN ? AND ?
        AND longitude BETWEEN ? and ?
        AND end_date >= datetime('now')
    `).all(
        parsedLat - degRange, parsedLat + degRange,
        parsedLon - degRange, parsedLon + degRange
   );
   // run haversine filter and add the distance to each result
   const nearby = notam_candidates
        .map(notam => {
            const distance = haversineKm(parsedLat, parsedLon,
                notam.latitude, notam.longitude);
            const classification = classifyNotam(notam.q_code);
            return { ...notam, distance_km: distance, ...classification };
        })
        .filter(notam => notam.distance_km <= parsedRadius)
        .sort((a, b) => a.distance_km - b.distance_km);

    res.json({
        count: nearby.length,
        location: { lat: parsedLat, lon: parsedLon },
        radius_km: parsedRadius,
        notams: nearby
    });
});

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
    const inRange = activeNotams
    .filter((notam) => {
        const distance = haversineKm(parsedLat, parsedLon,
            notam.latitude, notam.longitude);
        return distance <= parsedRadius + notam.radius;
    })
    .map(notam => {
        const classification = classifyNotam(notam.q_code);
        return { ...notam, ...classification };
    });

    // can fly only if no restrictive notams are in range of user
    const canFly = inRange.every(n => n.level !== "restrictive");

    res.json({
        safe: canFly,
        active_notams: inRange,
        checked_at: new Date().toISOString()
    });
});

// ---------------------------------------
// POST /notams - create new notam - TEST
// ---------------------------------------

router.post('/test1', (req, res) => {
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
    const created = db.prepare(`SELECT * FROM notams WHERE notamId = ?`).get(result.lastInsertRowid);

    res.status(201).json(created);
});

// ---------------------------------------
// GET /notams - List all NOTAMs - TEST
// ---------------------------------------
router.get('/test2', (req, res) => {
    const notams = db.prepare('SELECT * FROM notams').all();
    res.json(notams);
})

// ---------------------------------------
// GET /notams/:id - get single notam by ID - TEST
// ---------------------------------------

router.get('/test3/:id', (req, res) => {
    const notam = db.prepare('SELECT * FROM notams WHERE notamId = ?').get(req.params.id);

    if (!notam) {
        return res.status(404).json({ error: 'NOTAM not found.'});
    }

    res.json(notam);
})

module.exports = router;