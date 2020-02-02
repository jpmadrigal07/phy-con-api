const mongoose = require("mongoose");

const PulseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    pulse: Number,
    createdAt: {
        type: Date,
        default: Date.now
    },
    deletedAt: {
        type: Date
    }
});

module.exports = mongoose.model("Pulse", PulseSchema);