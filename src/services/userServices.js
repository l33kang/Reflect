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

    return user;
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

export {
    createUser,
    getAllUsers,
    getUserById,
    updateUserProfile
}