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
                first: 'Ivo',
                last: 'Bosc'
            },
            slackUserId: 'kafje',
            position: '5bcb2d2bc761be3e848bfb72',
            managerId: '5bcb331fb29ebf33ecc5c4ec',
            email: 'nejc@mail.com',
            avatarUrl: '/public/images/nejc.jpg',
            department: 'Backend',
            active: true,
            spentKudosThisWeek: 1,
        },
        {
            name: {
                first: 'Vili',
                last: 'Resni'
            },
            slackUserId: 'pineappletea',
            position: '5bcb2d2bc761be3e848bfb72',
            managerId: '5bcb331fb29ebf33ecc5c4ed',
            email: 'vasilj@mail.com',
            avatarUrl: '/public/images/vasilij.jpg',
            department: 'Frontend',
            active: true,
            spentKudosThisWeek: 2,
        },
    ]).then(data => console.log(data));


app.get('/', function(req, res){
    res.send({});
});

app.listen(3000);
console.log('Server running on port 3000');