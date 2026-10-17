
import test from "node:test";
import assert from "node:assert/strict";
import { createReputationEvent } from "../src/services/reputationServices.js";

test("APPRECIATION creates a reputation event", () => {
    assert.deepEqual(
        createReputationEvent("APPRECIATION", "KINDNESS"),
        {
            dimension: "KINDNESS",
            scoreValue: 4.0,
            rawWeight: 1.0
        }
    );
});

test("GRATITUDE creates a reputation event", () => {
    assert.deepEqual(
        createReputationEvent("GRATITUDE", "RELIABILITY"),
        {
            dimension: "RELIABILITY",
            scoreValue: 4.0,
            rawWeight: 1.0
        }
    );
});

test("ENCOURAGEMENT creates a reputation event", () => {
    assert.deepEqual(
        createReputationEvent("ENCOURAGEMENT", "RESPECT"),
        {
            dimension: "RESPECT",
            scoreValue: 4.0,
            rawWeight: 1.0
        }
    );
});

test("CONSTRUCTIVE does not create a reputation event", () => {
    assert.equal(createReputationEvent("CONSTRUCTIVE", "RESPECT"), null);
});

test("APOLOGY does not create a reputation event", () => {
    assert.equal(createReputationEvent("APOLOGY", "ACCOUNTABILITY"), null);
});

test("rejects an invalid feedback type", () => {
    assert.throws(
        () => createReputationEvent("INSULT", "KINDNESS"),
        /Invalid type/
    );
});

test("rejects an invalid reputation dimension", () => {
    assert.throws(
        () => createReputationEvent("APPRECIATION", "INTELLIGENCE"),
        /Invalid dimension/
    );
});
