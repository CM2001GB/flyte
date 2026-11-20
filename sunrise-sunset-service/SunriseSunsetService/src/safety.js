// Evaluates whether a planned flight time falls within safe daylight hours
// Returns the standardised verdict shape: { verdict, breached_conditions }

const config = require('./config');

/**
 * @param {string} flightDateTimeISO  — ISO 8601 datetime of the planned flight
 * @param {object} sunData            — single-day response from sunrise-sunset.org v2
 * @returns {{ verdict: string, breached_conditions: string[] }}
 */
function evaluate(flightDateTimeISO, sunData) {
    const breached = [];

    const flightTime = new Date(flightDateTimeISO);

    // handle polar night — no sunrise/sunset at all
    if (sunData.sun_status === 'polar_night') {
        breached.push('polar_night: no daylight at this location on this date');
        return { verdict: 'fail', breached_conditions: breached };
    }

    // handle midnight sun — sun never sets, always safe
    if (sunData.sun_status === 'midnight_sun') {
        return { verdict: 'pass', breached_conditions: [] };
    }

    // sunrise or sunset can individually be null near polar regions
    if (!sunData.sunrise || !sunData.sunset) {
        breached.push('incomplete_data: sunrise or sunset is null for this date/location');
        return { verdict: 'fail', breached_conditions: breached };
    }

    const sunrise = new Date(sunData.sunrise);
    const sunset  = new Date(sunData.sunset);

    // safe window: sunrise + margin  →  sunset - margin
    const safeStart = new Date(sunrise.getTime() + config.margins.beforeSunrise * 60_000);
    const safeEnd   = new Date(sunset.getTime()  - config.margins.afterSunset  * 60_000);

    if (flightTime < safeStart) {
        breached.push(`before_sunrise: flight at ${flightTime.toISOString()} is before safe start ${safeStart.toISOString()}`);
    }

    if (flightTime > safeEnd) {
        breached.push(`after_sunset: flight at ${flightTime.toISOString()} is after safe end ${safeEnd.toISOString()}`);
    }

    return {
        verdict: breached.length === 0 ? 'pass' : 'fail',
        breached_conditions: breached
    };
}

module.exports = { evaluate };