const mongoose = require('mongoose');

const Employee = require('./models/Employee');

const mongoURI = 'mongodb://root:root123@ds237363.mlab.com:37363/celtrakudos';

mongoose.connect(mongoURI, { useNewUrlParser: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = function applyManagerFeedback(a_managerComment, a_managerApproval, a_transactionId) {
    Employee.findByIdAndUpdate(
                                a_transactionId,
                                {
                                    managerComment: a_managerComment,
                                    approved: a_managerApproval
                                });
}