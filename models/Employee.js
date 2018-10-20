const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Schema
const employeeSchema = new mongoose.Schema({
    name: {
        first: String,
        last: String
    },
    slackUserId: String,
    position: {
        type: Schema.Types.ObjectId,
        ref: 'Position',
        required: true
    },
    managerId: {
        type: Schema.Types.ObjectId,
        ref: 'Employee'
    },
    email: String,
    avatarUrl: String,
    department: String,
    active: Boolean,
    spentKudosThisWeek: Number,
    added: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('Employee', employeeSchema);