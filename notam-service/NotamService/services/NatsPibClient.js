// the following process is used to acquire, and then parse, XML data relevant to NOTAMs sourced from
// Jonty's https://github.com/Jonty/uk-notam-archive
// fast-xml-parser is used to parse the xml, the documentation can be found via the link below:
// https://github.com/NaturalIntelligence/fast-xml-parser/blob/HEAD/docs/v4,%20v5/1.GettingStarted.md

const {XMLParser, XMLValidator} = require('fast-xml-parser');

const XML_URL = 'https://raw.githubusercontent.com/Jonty/uk-notam-archive/main/data/PIB.xml';

// fetch xml func from jonty's archive
async function fetchNotams() {
    // fetch xml content
    const response = await fetch(XML_URL);
    const xmlContent = await response.text();

    // validate xml content
    const validation = XMLValidator.validate(xmlContent);
    if (validation !== true) {
        console.error('Invalid XML:', validation);
        return null;
    }

    return xmlContent;
}
// parse xml func into json
async function parseNotams(xmlContent) {
    // parse xml to json
    const parser = new XMLParser({ ignoreAttributes: false});
    const jsonObj = parser.parse(xmlContent);

    console.log(jsonObj);
    return jsonObj;
}

module.exports = { fetchNotams, parseNotams };

// // parse the coordinates 
// parseCoordinates(coordStr) {
//     const match = coordStr.match();
//     return { lat, lon };
// };

// // parse the timestamps
// parseValidity(v) {

// };

// // make the q-codes human-readable
// classifyType(raw) {
    
// };