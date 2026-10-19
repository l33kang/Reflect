import prisma from '../config/database.js';
import {createReputationEvent} from './reputationServices.js'


const createFeedback = async ({
    fromUserId,
    toUserId,
    content,
    type,
    dimension
}) => {

    if(fromUserId === toUserId) {
        throw new Error ("You can't send a feedback to yourself!");
    }

    const recipient = await prisma.user.findUnique({
        where: {
            id: toUserId
        }
    });

    if(!recipient) {
        throw new Error("User not found!");
    }

    const privacy = await prisma.privacySettings.findUnique({
        where: {
            userId: toUserId
        }
    });

    if(privacy.allowFeedbackFrom === "friends") {
        const friendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    {userAId: fromUserId, userBId: toUserId},
                    {userAId: toUserId, userBId: fromUserId}
                ]
            }
        })
        if(!friendship) {
            throw new Error("You are not allowed to make this feedback");
        }
    }

    const reputationEvent = createReputationEvent(type, dimension);

    const feedback = await prisma.$transaction(async (tx) => {
        const feedback = await tx.feedback.create({
        data: {
            fromUserId,
            toUserId,
            content,
            type,
            dimension
            }
        });

        if(reputationEvent){
            await tx.reputationEvent.create({
                data:{
                    feedbackId: feedback.id,
                    userId: toUserId,
                    dimension: reputationEvent.dimension,
                    scoreValue: reputationEvent.scoreValue,
                    rawWeight: reputationEvent.rawWeight,
                    senderTrustAtTime: 0.5
                }
            });
        }
        return feedback;
    });
    return feedback;
}

const getFeedbackForUser = async (requesterId, targetUserId) => {
   
    if(requesterId === targetUserId){
        const feedbacks = await prisma.feedback.findMany({
        where: {
            toUserId: targetUserId
        },
        select: {
            id: true,
            content: true,
            createdAt: true,
            isPublic: true
        }
    })
        return feedbacks;
    } else {
        const feedbacks = await prisma.feedback.findMany({
            where: {
                toUserId: targetUserId,
                isPublic: true
            },
            select: {
                id: true,
                content: true,
                createdAt: true,
                isPublic: true
            }
        });
        return feedbacks;
    }

    
}

const updateFeedbackVisibility = async (feedbackId, requesterId, isPublic) => {
    const feedback = await prisma.feedback.findUnique({
        where: {
            id: feedbackId
        }
    })

    if(!feedback) {
        throw new Error ("Not found!");
    }

    if(requesterId != feedback.toUserId) {
        throw new Error ("Not authorized");
    }

    const updatedFeedback = await prisma.feedback.update({
        where: {
            id: feedbackId
        },
        data: {
            isPublic
        }
    });
    
    return updatedFeedback;
}

const deleteFeedback = async (feedbackId, requesterId) => {
    const feedback = await prisma.feedback.findUnique({
        where: {
            id: feedbackId
        }
    })

    if(!feedback) {
        throw new Error ("Not found!");
    }

    if(feedback.toUserId != requesterId) {
        throw new Error ("Not authorized");
    }

    const deletedFeedback = await prisma.feedback.delete({
        where: {
            id: feedbackId
        }
    })

    return deletedFeedback;
}

const createFeedbackResponse = async ({
    feedbackId,
    responderId,
    responseType,
    body
}) => {
    const feedback = await prisma.feedback.findUnique({
        where: {
            id: feedbackId
        }, 
        select : {
            id: true,
            toUserId: true
        }
    });

    if(!feedback) {
        throw new Error("Not found!");
    }

    if(feedback.toUserId !== responderId) {
        throw new Error("Not authorized");
    }

    const response = await prisma.feedbackResponse.create({
        data: {
            feedbackId,
            responderId,
            responseType,
            body
        }
    });

    return response;
}

const getFeedbackResponses = async (feedbackId, requesterId) => {
    const feedback = await prisma.feedback.findUnique({
        where: {
            id: feedbackId
        }
    });

    if(!feedback) {
        throw new Error("Feedback not found!");
    }

    if(
        feedback.fromUserId !== requesterId &&
        feedback.toUserId !== requesterId
    ) {
        throw new Error("Not authorized!");
    }

    const respond = await prisma.feedbackResponse.findMany({
        where: {
            feedbackId: feedbackId
        }
    })

    return respond;
}

export {
    createFeedback,
    getFeedbackForUser,
    updateFeedbackVisibility,
    deleteFeedback,
    createFeedbackResponse,
    getFeedbackResponses
}