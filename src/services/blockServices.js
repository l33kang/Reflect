import prisma from "../config/database.js";

const blockUser = async (blockerId, blockedId) => {
    if(blockerId === blockedId) {
        throw new Error("You cannot block yourself");
    }

    const user = await prisma.user.findUnique({
        where: { id: blockedId },
        select: { id: true }
    });

    if(!user) {
        throw new Error("User not found");
    }

    return prisma.block.upsert({
        where: {
            blockerId_blockedId: {
                blockerId,
                blockedId
            },
        },
        update: {},
        create: {
            blockerId,
            blockedId
        },
    });
}

const unblockUser = async (blockerId, blockedId) => {
    const existingBlock = await prisma.block.findUnique({
        where: {
            blockerId_blockedId: {
                blockerId,
                blockedId
            }
        }
    });

    if(!existingBlock) {
        throw new Error("Block not found");
    }

    await prisma.block.delete({
        where: {
            blockerId_blockedId: {
                blockerId,
                blockedId
            }
        }
    });
    return {message: "User unblocked successfully"};
}

const getBlockedUsers = async (blockerId) => {
    return prisma.block.findMany({
        where: { blockerId },
        select: {
            blockedId: true,
            createdAt: true
        },
        orderBy: { createdAt: "desc" }
    });
}

export {
    blockUser,
    unblockUser,
    getBlockedUsers
}