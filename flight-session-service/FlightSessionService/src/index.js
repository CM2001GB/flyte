const express = require('express');
const config = require('./config');
const db = require('./database');

const app = express();
app.use(express.json());

// statements

const insertFlight = db.prepare(`
    INSERT INTO flights (userId, flightId, 
    status, date, start_time, end_time, drone_model, 
    flight_notes, preflight_verdict, created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?)
`)

const getFlightById = db.prepare(`
    
`)

const getFlightsByUserId = db.prepare(`
    
`)

// routes

// POST /flights - create a new flight

app.post('/flights', (req, res) => {

});

// GET /flights - list flights by userId

app.get('./flights', (req, res) => {

});

// GET /flights/:id - get a single flight

app.get('./flights/:id', (req, res) => {

});

// GET /health - service health check

app.get('/health', (_req, res) => res.json({ status: 'ok'}));

// start app

app.listen(config.port, () => {
    console.log(`Flight Session service listening on: ${config.port}`);
})