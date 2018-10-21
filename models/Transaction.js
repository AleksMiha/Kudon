const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Schema
const transactionSchema = new mongoose.Schema({
    from: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    message: String,
    amount: Number,
    weightRatio: Number,
    approved: Boolean,
    managerComment: String,
    added: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Transaction', transactionSchema);