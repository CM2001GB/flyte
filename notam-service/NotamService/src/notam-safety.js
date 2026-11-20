const { checkUasExemption } = require('../services/notam-classifier');

function evaluate(classifiedNotams) {
    const breached = [];
    const exemptions = [];
    
    for (const n of classifiedNotams) {
        if (n.level === 'restrictive') {
            const uasCheck = checkUasExemption(n.description || n.message);

            if (uasCheck.exempt) {
                exemptions.push(n.notam_id || 'unknown');
            } else {
                breached.push(n.notam_id || 'unknown');
            }
        }
    }

    // const breached = classifiedNotams
    //     .filter(n => n.level === 'restrictive')
    //     .map(n => n.notam_id || 'unknown');

    // ---------------------------------------------------- //

    // return only hard breaches that have no exemptions
    // const hardBreach = breached.filter(breach => !breach.uas_exempt);
    // return {
    //     verdict: hardBreach.length === 0 ? 'pass' : 'fail',
    //     breached_conditions: breached
    // };

    return {
        verdict: breached.length === 0? 'pass' : 'fail',
        breached_conditions: breached,
        uas_exemptions: exemptions
    }
}

module.exports = { evaluate };