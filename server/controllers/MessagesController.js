import express from 'express';
import path from 'path';
import { mkdirSync, renameSync } from 'fs';
import Message from "../models/MessagesModel.js";

const app = express();
const __dirname = path.dirname(new URL(import.meta.url).pathname);
// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

export const getMessages = async (request, response, next) => {
    try {
        const user1 = request.userId;
        const user2 = request.body.id;

        if (!user1 || !user2) {
            return response.status(400).send("Both user ID's are required.");
        }

        const messages = await Message.find({
            $or: [
                { sender: user1, recipient: user2 }, { sender: user2, recipient: user1 },
            ],
        }).sort({ timestamp: 1 });

        return response.status(200).json({
            messages
        });
    } catch (error) {
        console.log({ error });
        return response.status(500).send("Internal Server Error");
    }
};

export const uploadFile = async (request, response, next) => {
    try {
        if (!request.file) {
            return response.status(400).send("File is required");
        }

        const date = Date.now();
        const fileDir = `uploads/files/${date}`;
        const fileName = `${fileDir}/${request.file.originalname}`;

        // Create the directory if it doesn't exist
        mkdirSync(fileDir, { recursive: true });

        // Rename the file to its new location
        renameSync(request.file.path, fileName);

        console.log("File uploaded to:", fileName);

        // Return the file path in the response
        return response.status(200).json({
            filePath: fileName
        });
    } catch (error) {
        console.log({ error });
        return response.status(500).send("Internal Server Error");
    }
};
