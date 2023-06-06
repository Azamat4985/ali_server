import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String
    },
    password: {
        type: String
    },
    role: {
        type: String
    },
    name: {
        type: String
    },
    favourites: {
        type: [String]
    }
})

export const User = mongoose.model("User", userSchema);