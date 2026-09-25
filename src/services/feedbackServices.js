import prisma from '../config/database.js';


const createFeedback = async ({fromUserId, toUserId, content}) => {
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

    const feedback = await prisma.feedback.create({
        data: {
            fromUserId,
            toUserId,
            content
        }
    })
    
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

export {
    createFeedback,
    getFeedbackForUser,
    updateFeedbackVisibility,
    deleteFeedback
}