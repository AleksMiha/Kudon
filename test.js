const express = require('express');
const mongoose = require('mongoose');

const PositionModel = require('./models/Position');
const Employee = require('./models/Employee');
const Transaction = require('./models/Transaction');
let app = express();

const mongoURI = 'mongodb://root:root123@ds237363.mlab.com:37363/celtrakudos';
//mongoose.connect(mongoURI, { useNewUrlParser: true });
mongoose.connect(mongoURI, { useNewUrlParser: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
//mongoose.Promise = global.Promise;

Employee.insertMany(
    [
        {
            name: {
                first: 'Vid',
                last: 'Zelen'
            },
            slackUserId: 'zelenicaj',
            position: '5bcb2d2bc761be3e848bfb73',
            managerId: '5bcb483f895e7e31b49641c0',
            email: 'vid@mail.com',
            avatarUrl: '/public/images/vid.jpg',
            department: 'Data science',
            active: true,
            spentKudosThisWeek: 4,
        },
        {
            name: {
                first: 'Aljaž',
                last: 'Kres'
            },
            slackUserId: 'malopolje',
            position: '5bcb2d2bc761be3e848bfb73',
            managerId: '5bcb4840895e7e31b49641c1',
            email: 'aljaz@mail.com',
            avatarUrl: '/public/images/aljaz.jpg',
            department: 'Frontend',
            active: true,
            spentKudosThisWeek: 1,
        },
    ]).then(data => console.log(data));
//Employee.deleteMany({slackUserId: 'kubicnimeter'}).then(data => console.log(data));

function validateActivity(id) {
    return Employee.findOne({slackUserId: id})
        .then(data => {
            if (data.active === true) {
                return true;
            } else {
                return false;
            }
        }).catch(err => console.log(err))
}

function createTransaction(transaction) {
    //person giving and person recieving kudos is not the same person => true
    const differentPerson = !(transaction.from === transaction.to);

    //ensure both reciever and giver of kudos are an active part of the company
    const giverActivePerson = validateActivity(transaction.from);
    const recieverActivePerson = validateActivity(transaction.to);


}



app.get('/callme', function(req, res){
    res.send({});
});

app.listen(3000);
console.log('Server running on port 3000');