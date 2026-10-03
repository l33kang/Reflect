import prisma from '../config/database.js';


const getFriends = async (userId) => {
    const friendships = await prisma.friendship.findMany({
        where: {
            OR: [
                { userAId: userId },
                { userBId: userId }
            ]
        },
        include: {
            userA: {
                select: {
                    id: true,
                    username: true
                }
            },
            userB: {
                select: {
                    id: true,
                    username: true
                }
            }
        }
    })

    const friends = friendships.map(friendship => friendship.userAId === userId ? friendship.userB : friendship.userA);

    return friends;
}

const unfriend = async (userId, friendId) => {
    const friendship = await prisma.friendship.findFirst({
        where: {
            OR: [
                { userAId: userId, userBId: friendId},
                { userAId: friendId, userBId: userId}
            ]
        }
    });
    if(!friendship) {
        throw new Error("Friendship not found");
    }

    const deletedFriendship = await prisma.friendship.delete({
        where: {
            id: friendship.id
        }
    });

    return deletedFriendship;
}

export {
    getFriends,
    unfriend
}