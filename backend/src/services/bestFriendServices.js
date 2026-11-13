import prisma from "../config/database.js";

const addBestFriend = async (userId, friendId) => {
    if (userId === friendId) {
        throw new Error("You cannot add yourself as a best friend");
    }

    const friendship = await prisma.friendship.findFirst({
        where: {
            OR: [
                { userAId: userId, userBId: friendId },
                { userAId: friendId, userBId: userId }
            ]
        }
    });

    if (!friendship) {
        throw new Error("You can only add an existing friend as a best friend");
    }

    return prisma.bestFriend.create({
        data: {
            userId,
            friendId
        }
    });
};

const removeBestFriend = async (userId, friendId) => {
    const bestFriend = await prisma.bestFriend.findUnique({
        where: {
            userId_friendId: {
                userId,
                friendId
            }
        }
    });

    if (!bestFriend) {
        throw new Error("Best friend not found");
    }

    await prisma.bestFriend.delete({
        where: {
            userId_friendId: {
                userId,
                friendId
            }
        }
    });

    return { message: "Best friend removed successfully" };
};

const getBestFriends = async (userId, requesterId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            privacySettings: {
                select: {
                    showBestFriends: true
                }
            }
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (
        userId !== requesterId &&
        !user.privacySettings?.showBestFriends
    ) {
        throw new Error("Best friends list is private");
    }

    return prisma.bestFriend.findMany({
        where: {
            userId
        },
        select: {
            friendId: true,
            createdAt: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });
};

export {
    addBestFriend,
    removeBestFriend,
    getBestFriends
};