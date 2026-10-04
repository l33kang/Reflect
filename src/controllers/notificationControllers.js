import {
    getNotifications as getNotificationsService,
    markNotificationAsRead
} from '../services/notificationServices.js';

const getNotifications = async (req, res) => {
    const userId = req.user.userId;

    try{
        const notifications = await getNotificationsService(userId);
        return res.status(200).json(notifications);
    } catch(err) {
        return res.status(500).json({error: "Could not fetch notifications"});
    }
}

const updateNotification = async (req, res) => {
    const {notificationId} = req.params;
    const userId = req.user.userId;

    try{
        const updatedNotification = await markNotificationAsRead(notificationId, userId);
        return res.status(200).json(updatedNotification)
    } catch(err) {
        if(err.message === "Notification not found") {
            return res.status(404).json({error: "Notification not found"});
        } else if(err.message === "Not authorized") {
            return res.status(403).json({error: "Not authorized"});
        } else {
            return res.status(500).json({error: "Could not mark the notification as read"});
        }
    }
}

export {
    getNotifications,
    updateNotification
}