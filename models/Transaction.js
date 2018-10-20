const mongoose = require('mongoose');
const mongoDB = 'lorem ipsum dolor sit amet';
const Schema = mongoose.Schema;

//Connect to db
mongoose.connect(mongoDB, { useNewUrlParser: true });

//Schema
const transactionSchema = new mongoose.Schema({
    from: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    to: { type: Schema.Types.ObjectId, ref: 'Employee', required: true},
    message: String,
    amount: Number,
    weightRatio: Number,
    added: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);