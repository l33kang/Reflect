import express from "express";
import prisma from "../config/database.js";

const router = express.Router();

//Get all users
router.get("/", async (req, res) => {
    const users = await prisma.user.findMany();

    res.json(users);
});

//Get a user by ID
router.get("/:id", async (req, res) => {
    const {id} = req.params;

    const user = await prisma.user.findUnique({
        where: {
            id
        }, 
        include: {
            profile: true
        }
    });

    if(!user) {
        return res.status(404).json({error: "User not found"});
    }

    res.json(user);
});

//Create a new user
router.post("/", async (req, res) => {
    const {email, username, firstName, lastName, bio} = req.body;

    if (!email || !username) {
        return res.status(400).json({error: "Email and username are required"});
    }
    try {
        const user = await prisma.user.create({
        data: {
            email,
            username,
            profile: {
                create: {
                    firstName,
                    lastName,
                    bio
                }
            }
        },
        include: {
            profile: true
        }
    });

    res.status(201).json(user);

    } catch (error) {
        console.error(error);

        if(error.code === 'P2002') {
            return res.status(409).json({error: "Email or username already exists"});
        }
        res.status(500).json({error: "Could not create user"});
    }
    
});

//Update a user's profile by ID
router.put("/:id/profile", async (req, res) => {
    const {id} =req.params;
    const {firstName, lastName, bio} = req.body;

    const profile = await prisma.profile.update({
        where: {
            userId: id
        },
        data: {
            firstName,
            lastName,
            bio
        }
    });

    res.status(200).json(profile);
});

export default router;