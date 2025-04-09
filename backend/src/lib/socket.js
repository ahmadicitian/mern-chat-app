import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [process.env.CLIENT_URL]
    }
});

export function getReceiverSocketId(userId) {
    return userSocketMap[userId]; // Get the socket ID for the user
}

//used to store onlie users
const userSocketMap = {}; // Map to store user IDs and their corresponding socket IDs

// io is the Socket.IO server instance which is attached to the HTTP server
// and can be used to listen for incoming connections and events.
io.on("connection", (socket) => {
    console.log("New client connected", socket.id);
    // Listen for user login event
    const userId = socket.handshake.query.userId; // Get user ID from query params
    if (userId) {
        userSocketMap[userId] = socket.id; // Store the socket ID for the user
        console.log(`User ${userId} connected with socket ID ${socket.id}`);
    }
    //io.emit() is used to send messages to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    socket.on("disconnect", () => {
        console.log("Client disconnected", socket.id);
        // Remove the user from the map when they disconnect
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { io, server, app };