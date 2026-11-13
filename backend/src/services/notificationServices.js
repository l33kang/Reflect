import prisma from '../config/database.js';

const createNotification = async ({userId, type, message}) => {
    const notification = await prisma.notification.create({
        data: {
            userId,
            type,
            message
        }
    });
    return notification;
}

const getNotifications = async (userId) => {
    const notifications = await prisma.notification.findMany({
        where: {
            userId
        },
        select: {
            id: true,
            type: true,
            message: true,
            createdAt: true,
            isRead: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    return notifications
}

const markNotificationAsRead = async (notificationId, userId) => {
    const notification = await prisma.notification.findUnique({
        where: {
            id: notificationId
        }
    });
    if(!notification) {
        throw new Error("Notification not found");
    }
    if(notification.userId !== userId) {
        throw new Error("Not authorized");
    }
    const updatedNotification = await prisma.notification.update({
        where: {
            id: notificationId
        },
        data: {
            isRead: true
        }
    });
    return updatedNotification;
}

export {
    createNotification,
    getNotifications,
    markNotificationAsRead
}
