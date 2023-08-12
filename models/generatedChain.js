import mongoose from "mongoose";
const Schema = mongoose.Schema;

const generatedChainSchema = Schema({
    objects: {
        type: []
    },
    startObject: {
        type: String,
    },
    percentage: {
        type: Number
    }
}, {timestamps: true})

export const GeneratedChain = mongoose.model('generatedChain', generatedChainSchema)