import prisma from '../config/database.js';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

const loginUser = async (email, password) => {
    const user = await prisma.user.findUnique({
        where: { email}
    })

    if(!user) {
        throw new Error("User not found");
    }
    const isPasswordValid = await argon2.verify(user.passwordHash, password);

    if(!isPasswordValid) {
        throw new Error("Invalid password");
    }

    const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET, {expiresIn: '48h'});

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            username: user.username
        }
    };
}

export {
    loginUser
}