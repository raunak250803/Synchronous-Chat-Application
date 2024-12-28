import { Server as SocketIOServer } from "socket.io";
import Message from "./models/MessagesModel.js";

const setupSocket = (server) => {
    const io = new SocketIOServer(server, {
        cors:{
            origin: process.env.ORIGIN,
            methods: ["GET", "POST"],
            credentials: true,
        },

    });
    const userSocketMap = new Map();

    const disconnect = (socket) => {
        console.log(`Client Disconnected: ${socket.id}`);
        for(const [userId, socketId] of userSocketMap.entries()){
            if(socketId === socket.id){
                userSocketMap.delete(userId);
                break;
            }
        }
    };

    const sendMessage = async(message) => {
        try{
            const senderSocketId = userSocketMap.get(message.sender);
            const recipientSocketId = userSocketMap.get(message.recipient);

            const createdMessage = await Message.create(message);
            console.log("Message created in DB:", createdMessage);

            const messageData = await Message.findById(createdMessage._id)
            .populate("sender", "id email firstName lastName image color")
            .populate("recipient", "id email firstName lastName image color");
            console.log("Populated message data:", messageData);

            if (recipientSocketId) {
                console.log("Emitting to recipient:", recipientSocketId);
                io.to(recipientSocketId).emit("receiveMessage", messageData);
            } else {
                console.error("Recipient socket ID not found");
            }

            if (senderSocketId) {
                console.log("Emitting to sender:", senderSocketId);
                io.to(senderSocketId).emit("receiveMessage", messageData);
            } else {
                console.error("Sender socket ID not found");
            }
        }
        catch(error){
            console.error("Error in sendMsg", error);
        }

    }

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;

        if(userId) {
            userSocketMap.set(userId, socket.id);
            console.log(`User Connected: ${userId} with socketID: ${socket.id}`);
        } else {
            console.log("User ID not provided during connection.")
        }

        socket.on("sendMessage", (message) => {
        console.log("Server received message:", message); // Debugging message received
        sendMessage(message); // Process the message
        });


        socket.on("disconnect", () => disconnect(socket));
    })
}

export default setupSocket;