const mongoose = require("mongoose");
const SchemaTypes = mongoose.Schema.Types;

const RunSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    steps: Number,
    calories: Number,
    createdAt: {
        type: Date,
        default: Date.now
    },
    deletedAt: {
        type: Date
    }
});

module.exports = mongoose.model("Run", RunSchema);