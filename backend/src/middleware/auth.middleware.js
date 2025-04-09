import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    let token = req.cookies.access_token;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }
        const user = await User.findById(decoded.userId).select("-password"); // Exclude password from user object
        if (!user) {
            return res.status(401).json({ message: "User Not Found" });
        }
        req.user = user; // Attach user to request object
        next();
    } catch (error) {
        console.error("ERROR in protectRoute middleware", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }

}