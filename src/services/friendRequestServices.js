import prisma from '../config/database.js'

const sendFriendRequest = async (senderId, recipientId) => {
    if(senderId === recipientId) {
        throw new Error("Not possible")
    }

    const recipient = await prisma.user.findUnique({
        where: {
            id: recipientId
        }
    })

    if(!recipient) {
        throw new Error ("User not found");
    }
    const friendship = await prisma.friendship.findFirst({
        where: {
            OR: [
                {
                userAId: senderId,
                userBId: recipientId
                },
                {
                userAId: recipientId,
                userBId: senderId
                } 
            ]
        }
    })

    if(friendship) {
        throw new Error ("Friendship already exists")
    }

    const existingRequest = await prisma.friendRequest.findFirst({
        where: {
            OR: [
                {
                    senderId: senderId,
                    recipientId: recipientId
                },
                {
                    senderId: recipientId,
                    recipientId: senderId
                }
            ]
        }
    });

    if (existingRequest) {
        if (existingRequest.senderId === senderId) {
            throw new Error("Friend request already exists");
        }

        if (existingRequest.senderId === recipientId) {
            throw new Error("You already have a friend request from this user");
        }
    }

   const createFriendRequest = await prisma.friendRequest.create({
    data: {
        senderId,
        recipientId,
        status: "PENDING"
    }
    });

    return createFriendRequest;
}

const acceptFriendRequest = async (requestId, userId) => {
    const request = await prisma.friendRequest.findUnique({
        where: {
            id: requestId
        }
    })

    if(!request) {
        throw new Error("Not found!");
    }

    if(request.recipientId !== userId) {
        throw new Error("Not authorized");
    }

    if(request.status !== "PENDING") {
        throw new Error("Request is not pending");
    }
    
    const userAId = request.senderId < request.recipientId ? request.senderId : request.recipientId;
    const userBId = request.senderId < request.recipientId ? request.recipientId : request.senderId;

    const result  = await prisma.$transaction(async(tx)=>{
        const requestUpdate = await tx.friendRequest.update({
            where: {
                id: requestId
            },
            data: {
                status: "ACCEPTED"
            }
        })

        const friendship = await tx.friendship.create({
            data: {
                userAId,
                userBId
            }
        })

        return {
            request: requestUpdate,
            friendship
        }
    })

    return result;
}

export {
    sendFriendRequest,
    acceptFriendRequest
}