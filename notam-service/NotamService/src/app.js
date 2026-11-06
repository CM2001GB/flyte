// This app.js file is primarily for testing and offline development
// as it allows us to import the app into a separate test file and
// make requests against it without needing to use the actual deployment
// server forwarded to a port. Furthermore, it helps us maintain our
// consideration of concerns where each file focuses on just one job

const express = require('express');
const cors = require('cors');
const notamsRouter = require('./routes/notams');

const app = express();

// Middleware
app.use(cors()); // for cross-origin requests on the frontend (TODO for later)
app.use(express.json()); // parse json request bodies

// Mount routes
app.use('/notams', notamsRouter);

// Health check endpoint for docker and general monitoring purposes
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'notam-service'});
})

module.exports = app;

