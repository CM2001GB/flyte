const db = require('../src/database')
const { fetchNotams, parseNotams } = require('./NatsPibClient');

function parseCoordinates(coordStr) {
    // using ^ regex input boundry (match from beginning of input)
    // match coord string to lat and long, and identify N/S or E/W orientation in coord string
    // using regex .match and \d digits of specified length.
    const match = coordStr.match(/^(\d{2})(\d{2})(N|S)(\d{3})(\d{2})(E|W)$/); 
    if (!match) return null; // return null if no match

    let lat = parseInt(match[1]) + parseInt(match[2]) / 60;
    let lon = parseInt(match[4]) + parseInt(match[5]) / 60;

    if (match[3] === 'S') lat = -lat;
    if (match[6] === 'W') lon = -lon;

    return { latitude: lat, longitude: lon };

    // example: 5407N00312W -> {latitude: 54.1167, longitude: -3.2}
}

// validity is the timestamp which determines when the NOTAM is in effect, based on a 
// start and end data known as the "StartValidity" and the "EndValidity".
// also on a sidenote whoever was responsible for writing parseInt logic in Node got dropped as a child
function parseValidity(validity) {
    const validityStr = String(validity);
    const year = 2000 + parseInt(validityStr.slice(0,2)); // who decided it should be up-to-but-not-including?!
    const month = validityStr.slice(2, 4);
    const day = validityStr.slice(4, 6);
    const hour = validityStr.slice(6, 8);
    const min = validityStr.slice(8, 10);
    return `${year}-${month}-${day}T${hour}:${min}:00Z`;

    // example: 2608200000 -> 2026-08-20T00:00:00Z
}

function buildNotamId(notam) {
    return `${notam.Series}${notam.Number}/${notam.Year}`;
}

async function ingestNotams() {
    const xml = await fetchNotams();
    if (!xml) return console.error('Failed to fetch NOTAMs.');

    const json = await parseNotams(xml);
    const firSections = json.Pib.FIRSection;

    const insert = db.prepare(`
        INSERT OR REPLACE INTO notams
        (notam_id, fir, location, coordinates_raw, latitude, longitude,
        radius, lower_fl, upper_fl, start_date, end_date, description,
        q_code, section)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let count = 0;

    const insertAll = db.transaction(() => {
        for (const fir of firSections) {
            // Aerodrome NOTAMs
            if (fir.ADSection) {
                const aerodromes = Object.values(fir.ADSection);
                for (const ad of aerodromes) {
                    if (!ad.NotamList?.Notam) continue;
                    const notams = Array.isArray(ad.NotamList.Notam)
                        ? ad.NotamList.Notam
                        : [ad.NotamList.Notam];

                    for (const n of notams) {
                        const coords = parseCoordinates(n.Coordinates);
                        insert.run(
                            buildNotamId(n),
                            fir.ICAO,
                            n.ItemA,
                            n.Coordinates,
                            coords?.latitude,
                            coords?.longitude,
                            n.Radius,
                            n.QLine?.Lower,
                            n.QLine?.Upper,
                            parseValidity(n.StartValidity),
                            parseValidity(n.EndValidity),
                            n.ItemE,
                            `${n.QLine?.Code23}${n.QLine?.Code45}`,
                            'AD'
                        );
                        count++;
                    }
                }
            }

            // En-route and Warnings
            for (const sectionName of ['En-route', 'Warnings']) {
                const section = fir[sectionName];
                if (!section?.NotamList?.Notam) continue;
                const notams = Array.isArray(section.NotamList.Notam)
                    ? section.NotamList.Notam
                    : [section.NotamList.Notam];

                for (const n of notams) {
                    try {
                        const coords = parseCoordinates(n.Coordinates);
                        insert.run(
                            buildNotamId(n),
                            fir.ICAO,
                            Array.isArray(n.ItemA) ? n.ItemA.join(',') : n.ItemA,
                            n.Coordinates,
                            coords?.latitude,
                            coords?.longitude,
                            n.Radius,
                            n.QLine?.Lower,
                            n.QLine?.Upper,
                            parseValidity(n.StartValidity),
                            parseValidity(n.EndValidity),
                            Array.isArray(n.ItemE) ? n.ItemE.join('\n') : n.ItemE,
                            `${n.QLine?.Code23}${n.QLine?.Code45}`,
                            sectionName
                        );
                        count++;
                    } catch (err) {
                        console.error('Failed NOTAM:', JSON.stringify(n, null, 2).slice(0, 500));
                        throw err;
                    }
                }
            }
        }
    });

    insertAll();
    console.log(`Ingested ${count} NOTAMs into database`);
}

module.exports = { ingestNotams };

ingestNotams().then(() => {
    console.log('Done');
}).catch(err => {
    console.error('Ingestion failed:', err);
});