function evaluate(classifiedNotams) {
    const breached = classifiedNotams
        .filter(n => n.level === 'restrictive')
        .map(n => n.notam_id || 'unknown');

    return {
        verdict: breached.length === 0 ? 'pass' : 'fail',
        breached_conditions: breached
    };
}

module.exports = { evaluate };