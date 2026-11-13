import prisma from "../config/database.js";

const addHobby = async (userId, hobbyName) => {
    if (typeof hobbyName !== "string" || !hobbyName.trim()) {
        throw new Error("Hobby name is required");
    }

    const name = hobbyName.trim();

    const hobby = await prisma.hobby.upsert({
        where: {
            name
        },
        update: {},
        create: {
            name
        }
    });

    const existing = await prisma.userHobby.findUnique({
        where: {
            userId_hobbyId: {
                userId,
                hobbyId: hobby.id
            }
        }
    });

    if (existing) {
        throw new Error("Hobby already added");
    }

    return prisma.userHobby.create({
        data: {
            userId,
            hobbyId: hobby.id
        },
        include: {
            hobby: true
        }
    });
};

const removeHobby = async (userId, hobbyId) => {
    const userHobby = await prisma.userHobby.findUnique({
        where: {
            userId_hobbyId: {
                userId,
                hobbyId
            }
        }
    });

    if (!userHobby) {
        throw new Error("Hobby not found");
    }

    await prisma.userHobby.delete({
        where: {
            userId_hobbyId: {
                userId,
                hobbyId
            }
        }
    });

    return {
        message: "Hobby removed successfully"
    };
};

const getUserHobbies = async (userId, requesterId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            privacySettings: {
                select: {
                    showHobbies: true
                }
            }
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (
        userId !== requesterId &&
        !user.privacySettings?.showHobbies
    ) {
        throw new Error("Hobbies are private");
    }

    return prisma.userHobby.findMany({
        where: {
            userId
        },
        select: {
            hobby: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });
};

export {
    addHobby,
    removeHobby,
    getUserHobbies
};
