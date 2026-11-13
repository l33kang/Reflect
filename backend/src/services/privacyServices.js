import prisma from '../config/database.js';

const updatePrivacy = async (userId, settings) => {
    const privacySettings = await prisma.privacySettings.findUnique({
        where: {
            userId
        }
    })

    if(!privacySettings) {
        throw new Error("User not found");
    }

    const updated = await prisma.privacySettings.update({
        where: {
            userId
        },
        data: settings
    });

    return updated;
}

export {
    updatePrivacy
}