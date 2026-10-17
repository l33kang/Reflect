
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