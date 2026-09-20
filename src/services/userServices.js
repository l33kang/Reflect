import argon2 from 'argon2';
import prisma from '../config/database.js';

const createUser = async ( {email, username, password, firstName, lastName, bio} ) => {

    const hash = await argon2.hash(password);

    const user = await prisma.user.create({
        data: {
            email,
            username,
            passwordHash: hash,
            profile: {
                create: {
                    firstName,
                    lastName,
                    bio
                }
            },
            privacySettings: {
                create: {}
            }
        }
    })

    return {
    id: user.id,
    email: user.email,
    username: user.username,
    profile: user.profile
};
}

const getAllUsers = async () => {
    const users = await prisma.user.findMany({
        select: {
            username: true,
            email: true,
            profile: true
        }
    })
    return users;
}

const getUserById = async (id) => {
    const user = await prisma.user.findUnique({
        where: {
            id
        },
        select: {
            email: true,
            username: true,
            profile: true
        }
    })
    return user;
}

const updateUserProfile = async (id, {firstName, lastName, bio}) => {
    const profile = await prisma.profile.update({
        where: {
            userId: id
        },
        data: {
           firstName,
            lastName,
            bio 
        }
    })
    return profile;
}

const getMe = async (id) => {
    const user = await prisma.user.findUnique({
        where: {
            id
        },
        select: {
            id: true,
            email: true,
            username: true,
            profile: true,
            privacySettings: true
        }
    });

    return user;
};

export {
    createUser,
    getAllUsers,
    getUserById,
    updateUserProfile,
    getMe
}