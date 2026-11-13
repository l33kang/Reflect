import test from "node:test";
import assert from "node:assert/strict";
import { reputation } from "../src/services/reputationServices.js";

test("returns INSUFFICIENT_DATA with fewer than five qualifying events", () => {
    const events = [
        { scoreValue: 4, rawWeight: 1 },
        { scoreValue: 5, rawWeight: 1 },
        { scoreValue: 3, rawWeight: 1 },
        { scoreValue: 4, rawWeight: 0 }
    ];

    const result = evaluateDimensionReputation(events);

    assert.equal(result.status, "INSUFFICIENT_DATA");
});

test("returns AVAILABLE with five qualifying events", () => {
    const events = [
        { scoreValue: 4, rawWeight: 1 },
        { scoreValue: 5, rawWeight: 1 },
        { scoreValue: 3, rawWeight: 1 },
        { scoreValue: 4, rawWeight: 1 },
        { scoreValue: 5, rawWeight: 1 }
    ];

    const result = evaluateDimensionReputation(events);

    assert.equal(result.status, "AVAILABLE");
    assert.equal(result.qualifyingEvents, 5);
    assert.equal(typeof result.score, "number");
    assert.equal(result.score, 3.77);
});

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