const evaluateDimensionReputation = (events) => {
    const qualifyingEvents = events.filter(
        event => event.rawWeight > 0
    );

    if (qualifyingEvents.length < 5) {
        return {
            status: "INSUFFICIENT_DATA",
            message: "Not enough data yet"
        };
    }

    const score = reputation(qualifyingEvents);

    return {
        status: "AVAILABLE",
        score: Number(score.toFixed(2)),
        qualifyingEvents: qualifyingEvents.length
    };
};