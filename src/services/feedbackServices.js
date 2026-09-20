import prisma from '../config/database.js';


const createFeedback = async ({fromUserId, toUserId, content}) => {
    if(fromUserId === toUserId) {
        throw new Error ("You can't send a feedback to yourself!");
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

const getFeedbackForUser = async (userId) => {
    const feedbacks = await prisma.feedback.findMany({
        where: {
            toUserId: userId
        }
    })

    return feedbacks;
}

export {
    createFeedback,
    getFeedbackForUser
}