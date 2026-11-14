const express = require('express');
const config = require('./config');
const db = require('./database');
const { v4: uuidv4 } = require('uuid'); // for unique flyerId id generation

const app = express();
app.use(express.json());

// statements

const insertFlight = db.prepare(`
    INSERT INTO flights (flight_id, flyer_id, location, 
    date, start_time, end_time, drone_model, 
    flight_notes, status, created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?)
`)

const getFlightById = db.prepare(`
    SELECT flight_id, flyer_id, location, date, start_time, end_time, 
           drone_model, flight_notes, status, created_at
    FROM flights WHERE flight_id = ?
`);

const getFlightsByFlyerId = db.prepare(`
    SELECT flight_id, flyer_id, location, date, start_time, end_time, 
           drone_model, flight_notes, status, created_at
    FROM flights WHERE flyer_id = ?
`);

// routes

// POST /flights - create a new flight

app.post('/flights', (req, res) => {
    const { flyerId, location, date, startTime: start_time, endTime: end_time, 
        droneModel: drone_model, flightNotes: flight_notes, status }
    = req.body;
    
    // check for missing important fields, if missing > 1 there is a missing field
    // so return an error showing the contents of the 'missing' list.
    const missing = [];
    if (!flyerId) missing.push('flyerId');
    if (!location) missing.push('location');
    if (!date) missing.push('date');

    if (missing.length > 0) {
        return res.status(400).json({
            error: `Missing required fields: ${missing.join(', ')}`
        });
    }

    try {
        const flightId = uuidv4(); // we use uuidv4 for unique flyer id because it's neat

        insertFlight.run( // call insertFlight func to push to db
            flightId,
            flyerId,
            location,
            date,
            start_time || null,
            end_time || null,
            drone_model || null,
            flight_notes || null,
            status || 'pending',
            new Date().toISOString()
        );

        const created = getFlightById.get(flightId);
        console.log(`[FlightService] Created flight ${flightId} for user ${flyerId}`);
        return res.status(201).json(created);

    } catch (err) {
        console.error('[FlightService] Error creatinf flight:', err.message);
        return res.status(500).json({ error: err.message });
    }
});

// GET /flights - list flights by flyerId

app.get('/flights', (req, res) => {
    try {
        const flyerId = req.query.flyerId;
        if (!flyerId) {
            return res.status(400).json({ error: 'Missing flyerId query parameter' });
        }
        const flights = getFlightsByFlyerId.all(flyerId);
        return res.json(flights);
    } catch (err) {
        console.error('[FlightService] Error fetching flights:', err.message);
        return res.status(500).json({ error: err.message });
    }
});

// GET /flights/:id - get a single flight

app.get('/flights/:id', (req, res) => {
    try {
        const flight = getFlightById.get(req.params.id);
        if (!flight) {
            return res.status(404).json({ error: 'Flight not found' });
        }
        return res.json(flight);
    } catch (err) {
        console.error('[FlightService] Error fetching flight:', err.message);
        return res.status(500).json({ error: err.message });
    }
});

// GET /health - service health check

app.get('/health', (_req, res) => res.json({ status: 'ok'}));

// start app

app.listen(config.port, () => {
    console.log(`Flight Session service listening on: ${config.port}`);
})