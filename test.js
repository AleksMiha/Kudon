const express = require('express');
const mongoose = require('mongoose');

const PositionModel = require('./models/Position');
const Employee = require('./models/Employee');
const Transaction = require('./models/Transaction');

const mongoURI = 'mongodb://root:root123@ds237363.mlab.com:37363/celtrakudos';

mongoose.connect(mongoURI, { useNewUrlParser: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));


function validateActivity(a_employeeId) {
    return new Promise((resolve, reject) => {
        Employee.findById(a_employeeId)
        .then(data => resolve(data.active === true))
        .catch(err => console.log(`Error at validateActivity`, err));
    })
}

function getWeight(a_employeeId) {
    return new Promise((resolve, reject) => {
        Employee.findById(a_employeeId)
        .populate('position')
        .then(data => resolve(data.position.weight))
        .catch(err => console.log(`Error at getWeight`, err));
    })
}

function getEmployeeIdFromSlackId(a_slackId) {
    return new Promise((resolve, reject) => {
        Employee.findOne({slackUserId: a_slackId})
        .then(data => resolve(data._id))
        .catch(err => console.log(`Error at getEmployeeIdFromSlackId`, err));
    });
}

function getRecievantSlackId(a_employeeId) {
    return new Promise((resolve, reject) => {
        Employee.findById(a_employeeId)
        .then(data => {
            console.log("Data reading at getRecievantSalckId", data);
            resolve(data.slackUserId)
        })
        .catch(err => console.log(`Error at getRecivantSlackId`, err));
    });
}   


function getRecivantManagerSlackId(a_employeeId) {
    return new Promise((resolve, reject) => {
        Employee.findById(a_employeeId).populate('managerId')
        .then(data => resolve(data.managerId.slackUserId))
        .catch(err => console.log(`Error at getRecivantManagerSlackId`, err));
    });
}

module.exports = function createTransaction(transaction) {
    /*
    //from slack we get sender's slackId and reciever's slackId; we need both '_id's
     new Promise.all([
        getEmployeeIdFromSlackId(transaction.fromSlackId), 
        getEmployeeIdFromSlackId(transaction.toSlackId)
    ])
        .then(data => {
            resolve({
                fromEmployee: data[0], 
                toEmployee: data[1]
            });
        })
        .catch(err => console.log(`Error at employeeIds`, err));
        
    const fromEmployee = employeeIds.fromEmployee;
    const toEmployee = employeeIds.toEmployee;
    
    //person giving and person recieving kudos is not the same person => true
    const differentPerson = !(employeeIds.fromEmployee === employeeIds.toEmployee);

    //ensure both reciever and giver of kudos are an active part of the company
    //get weight ratio which is defined as position.weight of (from / to)
    let promiseData = new Promise.all([
        validateActivity(fromEmployee), 
        validateActivity(toEmployee),
        getWeight(fromEmployee),
        getWeight(toEmployee)
    ])
        .then(data => {
            resolve({
                giverActivePerson: data[0], 
                recieverActivePerson: data[1],
                weightRationFrom: data[2],
                weightRationTo: data[3]
            });
        })
        .catch(err => console.log(`Error at promiseData`, err));
    /*const giverActivePerson = await validateActivity(fromEmployee);
    const recieverActivePerson = await validateActivity(toEmployee);
    
    const weightRationFrom = await getWeight(fromEmployee);
    const weightRationTo = await getWeight(toEmployee);*/
        /*
    const kudoIsValid = (differentPerson && promiseData.giverActivePerson && promiseData.recieverActivePerson);

    const weightRatio = promiseData.weightRationFrom / promiseData.weightRationTo;

    //console.log(giverActivePerson, recieverActivePerson, weightRatio);

    const newTransaction = {
        from: employeeIds.fromEmployee,
        to: employeeIds.toEmployee,
        message: transaction.message,
        amount: transaction.amount,
        weightRatio: weightRatio,
        approved: false
    };*/

    return new Promise((resolve, reject) => {
        console.log('Pre promise 1');
        Promise.all([
            getEmployeeIdFromSlackId(transaction.fromSlackId),  //get from _id
            getEmployeeIdFromSlackId(transaction.toSlackId)     //get to _id
        ]).then((dataFirst) => {
            console.log('Pre promise 2');
            Promise.all([
                validateActivity(dataFirst[0]), //from _id
                validateActivity(dataFirst[1]), //to _id
                getWeight(dataFirst[0]),        //from _id
                getWeight(dataFirst[1])         //to _id
            ]).then((dataSecond) => {
                console.log('Pre database insertion');
                
                Transaction.create({
                    from: dataFirst[0],         //from _id
                    to: dataFirst[1],           //to _id
                    message: transaction.message,
                    amount: transaction.amount,
                    weightRatio: (dataSecond[2] / dataSecond[3]),
                    approved: false
                })
                .then(dataThird => {
                    console.log('Pre promise 3');
                    console.log("Data reading at Pre promise 3", dataThird);
                    Promise.all([getRecievantSlackId(dataThird.to), getRecivantManagerSlackId(dataThird.to)])
                    .then(values => {
                        console.log(values);
                        console.log('Before retriveing data', values[0], values[1]);
                        resolve({
                            recivantId: values[0], 
                            managerId: values[1]
                        });
                    })
                })
                .catch(err => {
                    console.log(err);
                    reject('error');
                });
            });    
           })     
       })
}




/*
createTransaction({
    fromSlackId: 'zelenicaj',
    toSlackId: 'skatlica',
    message: 'Hello form the other side',
    amount: 5
});

app.get('/callme', function(req, res){
    res.send({});
});

app.listen(3000);
console.log('Server running on port 3000');*/