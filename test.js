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

/*Employee.insertMany(
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
    ]).then(data => console.log(data));*/
//Employee.deleteMany({slackUserId: 'kubicnimeter'}).then(data => console.log(data));

function validateActivity(a_employeeId) {
    return Employee.findById(a_employeeId)
        .then(data => {
            return (data.active === true);
        })
        .catch(err => console.log(err))
}

function getWeight(a_employeeId) {
    return Employee.findById(a_employeeId)
        .populate('position')
        .then(data => {
            return (data.position.weight);
        })
        .catch(err => console.log(err))
}

function getEmployeeIdFromSlackId(a_slackId) {
    return Employee.find({slackUserId: a_slackId})
        .then(data => {
            return (data._id);
        })
        .catch(err => console.log(err))
}

async function createTransaction(transaction) {
    const fromEmployee = transaction.from;
    const toEmployee = transaction.to;
    //person giving and person recieving kudos is not the same person => true
    const differentPerson = !(fromEmployee === toEmployee);

    //ensure both reciever and giver of kudos are an active part of the company
    const giverActivePerson = await validateActivity(fromEmployee);
    const recieverActivePerson = await validateActivity(toEmployee);
    
    //get weight ratio which is defined as position.weight of (from / to)
    const weightRationFrom = await getWeight(fromEmployee);
    const weightRationTo = await getWeight(toEmployee);

    const weightRatio = weightRationFrom / weightRationTo;
    console.log(giverActivePerson, recieverActivePerson, weightRatio);

}

createTransaction({
    from: '5bcb331fb29ebf33ecc5c4ec',
    to: '5bcb483f895e7e31b49641c0',
});

app.get('/callme', function(req, res){
    res.send({});
});

app.listen(3000);
console.log('Server running on port 3000');