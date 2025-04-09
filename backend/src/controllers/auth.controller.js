import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
    const { email, fullName, password } = req.body;
    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        //hash password
        const salt = await bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const newUser = new User({
            email,
            fullName,
            password: hashedPassword,
        });
        if (newUser) {
            //generate token
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                email: newUser.email,
                fullName: newUser.fullName,
                profilePic: newUser.profilePic
            });
        } else {
            return res.status(400).json({ message: 'Invalid user data.' });
        }

    } catch (error) {
        console.error("ERROR in signup controller", error);
        res.status(500).json({ message: 'Internal server error' });
    }
    res.send('Signup Route');
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        //generate token
        generateToken(user._id, res);
        res.status(200).json({
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            profilePic: user.profilePic
        });
    } catch (error) {
        console.error("ERROR in login controller", error);
        res.status(500).json({ message: 'Internal server error' });
    }

}

export const logout = async (req, res) => {
    try {
        res.clearCookie("access_token", {
            httpOnly: true,
            expires: new Date(0),
        });
        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        console.error("ERROR in logout controller", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;
        if (!profilePic) {
            return res.status(400).json({ message: 'Please provide a profile picture' });
        }
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId, {
            profilePic: uploadResponse.secure_url,
        }, { new: true });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("ERROR in updateProfile controller", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const checkAuth = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.error("ERROR in checkAuth controller", error);
        res.status(500).json({ message: 'Internal server error' });
        
    }
}