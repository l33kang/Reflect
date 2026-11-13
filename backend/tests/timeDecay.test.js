
import test from "node:test";
import assert from "node:assert/strict";
import { calculateTimeDecay } from "../src/services/reputationServices.js";

const day = 24 * 60 * 60 * 1000;

test("an event created now has full time weight", () => {
    const now = new Date("2026-01-01T00:00:00Z");

    assert.equal(calculateTimeDecay(now, now), 1);
});

test("an event one half-life old has approximately half its weight", () => {
    const now = new Date("2027-01-01T06:00:00Z");
    const createdAt = new Date(now.getTime() - 365.25 * day);

    const result = calculateTimeDecay(createdAt, now);

    assert.ok(Math.abs(result - 0.5) < 0.000001);
});

test("an event two half-lives old has approximately one-quarter weight", () => {
    const now = new Date("2028-01-01T12:00:00Z");
    const createdAt = new Date(now.getTime() - 2 * 365.25 * day);

    const result = calculateTimeDecay(createdAt, now);

    assert.ok(Math.abs(result - 0.25) < 0.000001);
});
