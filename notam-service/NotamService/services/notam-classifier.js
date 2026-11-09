
// used to determine NOTAM restriction types, based
// on the specific qCodes present in said NOTAMs.
// see the qCode following documentation for info on these qCodes
// https://theairlinepilots.com/flightplanningforairlinepilots/notamdecode.php

// q-codes are 4 characters: code23 (subject, first 2 digits) + code45 (condition, last 2)
// i.e. RTCA = Temporary Restricted Area (RT) + Activated (CA)

function classifyNotam(qCode) { // qcodes consist of 4 letters, if less than 4 return unclassified
    if (!qCode || qCode.length < 4) return {
        level: 'unknown', label: 'Unknown NOTAM'
    };

    const subject = qCode.slice(0, 2); // code second/third digits
    const condition = qCode.slice(2, 4) // code fourth/fifth digits

    const restrictive_qcodes = { // restricted flight qcodes
        "RA": "Airspace reservation.",
        "RD": "Danger Area.",
        "RO": "Risk of Overflying of Restricted Object(s).",
        "RP": "Prohibited Area.",
        "RR": "Restricted Area.",
        "RT": "Temporary Restricted Area.",
        "WM": "Missile/Gun/Rocket Firing.",
        "WE": "Military Exercise Nearby.",
        "WA": "Air Display Nearby.",
        "WP": "Parachute Jumping Nearby.",
        "WD": "Demolition Of Explosives Nearby."
    };

    if (restrictive_qcodes[subject]) {
        return {
            level: "restrictive",
            label: restrictive_qcodes[subject]
        };
    }

    // also restrictive if condition is activated in certain areas
    if (subject.startsWith('A') && (condition === "CA" || condition === "LC")) {
        return {
            level: "restrictive",
            label: "Airspace closed or activated" };
    }

    // catches informational codes starting with A that don't result in closures/activations
    // and that are purely informative
    if (subject.startsWith('A')) {
        return { 
            level: "informational", 
            label: "Airspace/Aerodome Information"
        };
    }

    const cautionary_qcodes = { // fly with awareness qcodes
        "OB": "Obstacles Nearby.",
        "OL": "Obstacle Lights Nearby.",
        "WC": "Captive Balloon(s) or Kite(s) Nearby.",
        "WL": "Free Balloon Ascent Nearby.",
        "WZ": "Model Flying Nearby.",
        "WB": "Aerobatics Nearby.",
        "WG": "Glider Flying Nearby.",
        "WF": "Air Refueling Nearby.",
        "WJ": "Banner/Target Towing Nearby.",
        "WV": "Formation Flight Nearby.",
        "WT": "Mass Movement of Aircraft Nearby.",
        "WS": "Burning/Blowing Gas Nearby.",
        "WU": "Unmanned Aircraft Activity Nearby",
        "WO": "Other Warning Activity Nearby"
    };

    if (cautionary_qcodes[subject]) {
        return {
            level:"caution",
            label: cautionary_qcodes[subject]
        };
    }

    const informational_qcodes = [ // safe to fly, but be aware
        'L', 'C', 'I', 'N', 'S', 'P', 'F', 'M', 'O'
    ];

    if (informational_qcodes.includes(subject[0])) {
        return {
            level: "informational",
            label: "Aerodome/Facility Information."
        };
    }  
    
    return { level: 'unknown', label: 'Unclassified NOTAM' };

}

module.exports = { classifyNotam };