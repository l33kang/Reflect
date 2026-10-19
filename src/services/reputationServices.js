
import prisma from '../config/database.js';

const calculateTimeDecay = (createdAt, now = new Date ()) => {
    const eventTime = new Date(createdAt);

    if(
        Number.isNaN(eventTime.getTime()) ||
        Number.isNaN(now.getTime())
    ) {
        throw new Error("Invalid event date");
    }

    const ageInDays = Math.max(
        0,
        (now.getTime() - eventTime.getTime()) / (1000*60*60*24)
    );

    const halfLifeDays = 365.25;
    
    return Math.pow(2, -ageInDays / halfLifeDays);
}

const reputation = (events) => {
    if (!Array.isArray(events)) {
        throw new Error("Events must be an array");
    }

    const baseline = 3.5;
    const priorStrength = 8;

    let weightedTotal = baseline * priorStrength;
    let totalWeight = priorStrength;

    for (const event of events) {
        if (
            !event ||
            typeof event !== "object" ||
            Array.isArray(event) ||
            !Number.isFinite(event.scoreValue) ||
            event.scoreValue < 0 ||
            event.scoreValue > 5 ||
            !Number.isFinite(event.rawWeight) ||
            event.rawWeight < 0
        ) {
            throw new Error("Invalid reputation event");
        }

        const trust = event.senderTrustAtTime ?? 1.0;
        const timeWeight = event.createdAt? calculateTimeDecay(event.createdAt): 1.0;

        const effectiveWeight = event.rawWeight * trust * timeWeight;

        weightedTotal += event.scoreValue * effectiveWeight;
        totalWeight += effectiveWeight;
    }

    return weightedTotal / totalWeight;
};

const createReputationEvent = (type, dimension) => {
    const allowedTypes = [
        "APPRECIATION",
        "CONSTRUCTIVE",
        "ENCOURAGEMENT",
        "APOLOGY",
        "GRATITUDE"
    ];

    if (!allowedTypes.includes(type)) {
        throw new Error("Invalid type");
    }

    const allowedDimensions = [
        "KINDNESS",
        "RESPECT",
        "RELIABILITY",
        "ACCOUNTABILITY"
    ];

    if (!allowedDimensions.includes(dimension)) {
        throw new Error("Invalid dimension");
    }

    if (type === "CONSTRUCTIVE" || type === "APOLOGY") {
        return null;
    }

    return {
        dimension,
        scoreValue: 4.0,
        rawWeight: 1.0
    };
};

const getReputationEvents = async (userId, dimension) => {
    return prisma.reputationEvent.findMany({
        where: {
            userId,
            dimension
        },
        select: {
            scoreValue: true,
            rawWeight: true,
            senderTrustAtTime: true,
            createdAt: true
        }
    });
};

const getDimensionReputation = async (userId, dimension) => {
    const events = await getReputationEvents(userId, dimension);

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

const getUserReputation = async (username, requesterId) => {
    const user = await prisma.user.findUnique({
        where: { username },
        select: {
            id: true,
            username: true,
            privacySettings: {
                select: {
                    showReputation: true
                }
            }
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (
        user.id !== requesterId &&
        !user.privacySettings?.showReputation
    ) {
        throw new Error("Reputation is private");
    }

    const dimensions = [
        "KINDNESS",
        "RESPECT",
        "RELIABILITY",
        "ACCOUNTABILITY"
    ];

    const reputationByDimension = {};

    for (const dimension of dimensions) {
        reputationByDimension[dimension] =
            await getDimensionReputation(user.id, dimension);
    }

    return {
        username: user.username,
        reputation: reputationByDimension
    };
};

export {
    reputation,
    createReputationEvent,
    getReputationEvents,
    getDimensionReputation,
    getUserReputation,
    calculateTimeDecay
};
