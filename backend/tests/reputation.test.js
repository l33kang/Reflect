
import test from "node:test";
import assert from "node:assert/strict";
import { reputation } from "../src/services/reputationServices.js";

test("returns the baseline when there are no events", () => {
    assert.equal(reputation([]), 3.5);
});

test("a positive event increases the score", () => {
    const result = reputation([{ scoreValue: 5, rawWeight: 1 }]);
    assert.ok(Math.abs(result - 3.6666666667) < 0.000001);
});

test("a zero score decreases the score", () => {
    const result = reputation([{ scoreValue: 0, rawWeight: 1 }]);
    assert.ok(Math.abs(result - 3.1111111111) < 0.000001);
});

test("a zero-weight event does not affect the score", () => {
    assert.equal(
        reputation([{ scoreValue: 5, rawWeight: 0 }]),
        3.5
    );
});

test("rejects a score above 5", () => {
    assert.throws(
        () => reputation([{ scoreValue: 6, rawWeight: 1 }]),
        /Invalid reputation event/
    );
});

test("rejects a negative weight", () => {
    assert.throws(
        () => reputation([{ scoreValue: 5, rawWeight: -1 }]),
        /Invalid reputation event/
    );
});

test("rejects non-array input", () => {
    assert.throws(
        () => reputation(null),
        /Events must be an array/
    );
});

test("rejects null events", () => {
    assert.throws(
        () => reputation([null]),
        /Invalid reputation event/
    );
});

test("accepts a score of 0", () => {
    assert.doesNotThrow(() =>
        reputation([{ scoreValue: 0, rawWeight: 1 }])
    );
});

test("accepts a score of 5", () => {
    assert.doesNotThrow(() =>
        reputation([{ scoreValue: 5, rawWeight: 1 }])
    );
});


test("lower sender trust reduces the influence of an event", () => {
    const trustedResult = reputation([
        { scoreValue: 5, rawWeight: 1, senderTrustAtTime: 1 }
    ]);

    const lessTrustedResult = reputation([
        { scoreValue: 5, rawWeight: 1, senderTrustAtTime: 0.5 }
    ]);

    assert.ok(lessTrustedResult < trustedResult);
});

test("sender trust of 0.5 gives an event half its raw weight", () => {
    const result = reputation([
        { scoreValue: 5, rawWeight: 1, senderTrustAtTime: 0.5 }
    ]);

    assert.ok(Math.abs(result - 3.5882352941) < 0.000001);
});

test("older events have less influence on reputation", () => {
    const now = new Date("2026-10-19T00:00:00Z");

    const recentEvent = {
        scoreValue: 5,
        rawWeight: 1,
        senderTrustAtTime: 1,
        createdAt: now
    };

    const oldEvent = {
        scoreValue: 5,
        rawWeight: 1,
        senderTrustAtTime: 1,
        createdAt: new Date("2024-10-19T00:00:00Z")
    };

    const recentScore = reputation([recentEvent]);
    const oldScore = reputation([oldEvent]);

    assert.ok(recentScore > oldScore);
});