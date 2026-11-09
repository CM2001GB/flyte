// test-parser.js
const { fetchNotams, parseNotams } = require('./NatsPibClient');

// Add this to your test to see the NOTAM structure
async function test1() {
    const xml = await fetchNotams();
    const json = await parseNotams(xml);

    const firSections = json.Pib.FIRSection;

    firSections.forEach((fir, i) => {
        console.log(`\n--- FIR ${i} ---`);
        console.log('Keys:', Object.keys(fir));

        // Find where the NOTAMs live
        const notams = fir.Notam || fir.NOTAMList || fir.NotamList;
        if (notams) {
            const first = Array.isArray(notams) ? notams[0] : notams;
            console.log('First NOTAM:', JSON.stringify(first, null, 2).slice(0, 1500));
        }
    });
}

async function test2() {
    const xml = await fetchNotams();
    if (!xml) return console.log('Fetch failed');
    const json = await parseNotams(xml);

    const firSections = json.Pib.FIRSection;
    firSections.forEach((fir, i) => {
        console.log(`\n--- FIR ${i} ---`);
        console.log('Keys:', Object.keys(fir));

        // find where notams are located
        const notams = fir.Notam || fir.NOTAMList || fir.NotamList;
        if (notams) {
            const first = Array.isArray(notams) ? notams[0] : notams;
            console.log('First NOTAM:', JSON.stringify(first, null, 2).slice(0, 1500))
        }
    });
}

async function test3() {
    const xml = await fetchNotams();
    const json = await parseNotams(xml);

    const fir = json.Pib.FIRSection[0];
    console.log('FIR:', fir.ICAO, fir.Name);

    // Check each section for NOTAMs
    console.log('\n--- ADSection keys ---');
    console.log(Object.keys(fir.ADSection));

    console.log('\n--- En-route keys ---');
    console.log(Object.keys(fir['En-route']));

    console.log('\n--- Warnings keys ---');
    console.log(Object.keys(fir.Warnings));

    // Try to find actual NOTAM entries in ADSection
    const adSection = fir.ADSection;
    const firstKey = Object.keys(adSection)[0];
    const firstEntry = adSection[firstKey];
    console.log('\n--- ADSection first entry ---');
    console.log(JSON.stringify(
        Array.isArray(firstEntry) ? firstEntry[0] : firstEntry,
        null, 2
    ).slice(0, 2000));
}

test1(3);