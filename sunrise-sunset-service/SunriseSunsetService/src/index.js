const express = require('express');
const config  = require('./config');
const { evaluate } = require('./safety');
const { insertAudit } = require('./database');

const app = express();
app.use(express.json());

app.get('/sunrise-sunset', async (req, res) => {
    const { lat, lon, datetime } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({
            verdict: 'fail',
            breached_conditions: ['missing lat/lon query parameters']
        });
    }

    const flightDateTime = datetime || new Date().toISOString();
    const flightDate = flightDateTime.substring(0, 10);

    try {
        const apiUrl = `${config.api.baseUrl}?lat=${lat}&lng=${lon}&date=${flightDate}&tz=UTC`;
        console.log(`[SunriseSunset] Fetching: ${apiUrl}`);

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const result = evaluate(flightDateTime, data);

        // write audit log
        insertAudit.run(
            parseFloat(lat),
            parseFloat(lon),
            flightDateTime,
            data.sunrise || null,
            data.sunset || null,
            result.verdict,
            JSON.stringify(result.breached_conditions)
        );

        console.log(`[SunriseSunset] lat=${lat} lon=${lon} date=${flightDate} → ${result.verdict}`);
        return res.json(result);

    } catch (err) {
        console.error('[SunriseSunset] Error:', err.message);
        return res.status(500).json({
            verdict: 'fail',
            breached_conditions: [`service_error: ${err.message}`]
        });
    }
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(config.port, () => {
    console.log(`Sunrise-Sunset service listening on :${config.port}`);
});