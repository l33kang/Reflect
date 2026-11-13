import {loginUser as loginUserService} from '../services/authServices.js';

const loginUser = async (req, res) => {
    const {email, password} = req.body;

    if(!email || !password) {
        return res.status(400).json({error: "Both email and password are required"});
    }
    try {
        const result = await loginUserService(email, password);
        return res.status(200).json(result);
    } catch (err) {

            if(err.message === "User not found") {
                    return res.status(401).json({error: "Invalid Email or Password"});
                }
            else if(err.message === "Invalid password") {
                return res.status(401).json({error: "Invalid Email or Password"});
            } else {
                return res.status(500).json({error: "Unexpected error"});
            }
            
    }
}

export {
    loginUser
}