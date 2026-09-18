import { 
    createUser as createUserService,
    getAllUsers,
    getUserById as getUserByIdService,
    updateUserProfile as updateUserProfileService
} from '../services/userServices.js';

const createUser = async (req, res) => {
    const {email,username, password, firstName, lastName, bio} = req.body;
    
    if (!email || !username || !password) {
        return res.status(400).json({error: "Email, Username and password are required"});
    }

    try {
       const user = await createUserService({email, username, password, firstName, lastName, bio});
       res.status(201).json(user);
    } catch (err) {
        console.error(err)

        if(err.code === 'P2002') {
            return res.status(409).json({error: "Email or username already exists"});
        }
        res.status(500).json({error: "Could not create user"})
    }


}

const getUsers = async (req, res) => {
    try {
        const users = await getAllUsers()
        res.status(200).json(users)
    } catch (err) {
        res.status(500).json({error: "Could not fetch users"})
    }

}

const getUserById = async (req, res) => {
    const {id} = req.params;

    try {
        const user = await getUserByIdService(id);
        if(!user) {
            return res.status(404).json({error: "Not found"});
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({error: "Could not fetch user"})
    }
}

const updateUserProfile = async (req, res) => {
    const {id} = req.params;
    const {firstName, lastName, bio} = req.body;

    try {
        const profile = await updateUserProfileService(id, {firstName, lastName, bio});
        res.status(200).json(profile);
    } catch (err) {
        res.status(500).json({error: "Could not update user profile"});
    }
}

export {
    createUser,
    getUsers,
    getUserById,
    updateUserProfile
}