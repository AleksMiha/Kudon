const mongoose = require('mongoose');

//Schema
const positionSchema = new mongoose.Schema({
    jobTitle: String,
    weight: Number,
    kudosLimit: Number,
    added: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Position', positionSchema);