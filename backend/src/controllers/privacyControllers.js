import { updatePrivacy } from "../services/privacyServices.js";

const updatePrivacySettings = async (req, res) => {
    const userId = req.user.userId;
    const settings = req.body ?? {};
    const {
    allowAnonymousFeedback,
    allowFeedbackFrom,
    discoverable,
    showFriendsList,
    showReputation
    } = settings;

    const allowedSettings = {
        ...(allowAnonymousFeedback !== undefined && { allowAnonymousFeedback }),
        ...(allowFeedbackFrom !== undefined && { allowFeedbackFrom }),
        ...(discoverable !== undefined && { discoverable }),
        ...(showFriendsList !== undefined && { showFriendsList }),
        ...(showReputation !== undefined && { showReputation })
    };
    
    try{
        if( settings.allowFeedbackFrom !== undefined && settings.allowFeedbackFrom !== "everyone" && settings.allowFeedbackFrom !== "friends" ) {
            return res.status(400).json({error: "input is not correct"});
        }

        if (
            settings.showFriendsList !== undefined &&
            typeof settings.showFriendsList !== "boolean"
        ) {
            return res.status(400).json({
                error: "showFriendsList must be a boolean"
            });
        }

        if (
            settings.allowAnonymousFeedback !== undefined &&
            typeof settings.allowAnonymousFeedback !== "boolean"
        ) {
            return res.status(400).json({
                error: "allowAnonymousFeedback must be a boolean"
            });
        }

        if (
            settings.discoverable !== undefined &&
            typeof settings.discoverable !== "boolean"
        ) {
            return res.status(400).json({
                error: "discoverable must be a boolean"
            });
        }

        if (
            settings.showReputation !== undefined &&
            typeof settings.showReputation !== "boolean"
        ) {
            return res.status(400).json({
                error: "showReputation must be a boolean"
            });
        }

        if (Object.keys(allowedSettings).length === 0) {
            return res.status(400).json({
                error: "At least one privacy setting is required"
            });
        }

        const updated = await updatePrivacy(userId, allowedSettings);
        return res.status(200).json(updated);
    } catch(err) {
        if(err.message === "User not found") {
            return res.status(404).json({error: "User not found"});
        } else {
            return res.status(500).json({error: "Something went wrong"});
        }
       
    }
}

export {
    updatePrivacySettings
}