import mongoose from "mongoose";

export const connection = () => {
    mongoose.connect(process.env.MONGO_URI, {
        dbName: "NoteYouTube",
    }).then(() => {
        console.log("Connected to database successfully");
    }).catch((err) => {
        console.log("Error connecting to database: ", err);
    });
}