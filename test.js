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
                first: 'Aleks',
                last: 'Stepančič'
            },
            slackUserId: 'kosinusdeset',
            position: '5bcb2d2bc761be3e848bfb70',
            managerId: '5bcb319083b2cd15c46e63e9',
            email: 'aleks@mail.com',
            avatarUrl: '/public/images/aleks.jpg',
            department: 'HR',
            active: true,
            spentKudosThisWeek: 1,
        },
        {
            name: {
                first: 'Anej',
                last: 'Jerman'
            },
            slackUserId: 'tangensdeset',
            position: '5bcb2d2bc761be3e848bfb70',
            managerId: '5bcb319083b2cd15c46e63e9',
            email: 'anej@mail.com',
            avatarUrl: '/public/images/anej.jpg',
            department: 'Marketing',
            active: true,
            spentKudosThisWeek: 0,
        },
    ]).then(data => console.log(data));


app.get('/', function(req, res){
    res.send({});
});

app.listen(3000);
console.log('Server running on port 3000');