import mongoose from "mongoose";
const Schema = mongoose.Schema;

const chainSchema = Schema({
  name: {
    type: String,
  },
  objects: [
    {
        all_scores: {type: Number},
        score: {type: Number},
        id: {type: String},

    }
  ],
  probability: { type: Number },
  createdBy: {type: String}
}, {timestamps: true});

export const Chain = mongoose.model("Chain", chainSchema);
