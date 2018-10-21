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

function getEmployeeInfoFromSlackId(a_slackId) {
    return new Promise((resolve, reject) => {
        Employee.findOne({slackUserId: a_slackId})  
        .then(data => resolve(data._id))
        .catch(err => console.log(`Error at getEmployeeIdFromSlackId`, err));
    });
}

function getRecievantSlackId(a_employeeId) {
    return new Promise((resolve, reject) => {
        Employee.findById(a_employeeId)
        .then(data => resolve(data.slackUserId))
        .catch(err => console.log(`Error at getRecivantSlackId`, err));
    });
}   


function getRecivantManagerSlackId(a_employeeId) {
    return new Promise((resolve, reject) => {
        console.log('before query!', a_employeeId);
        Employee.findOne({_id: a_employeeId}).populate('managerId')
        .then(data => {
            //console.log('after query!', data);
            //console.log("Data reading at getRecievantSalckId", data.managerId.slackUserId);
            resolve(data.managerId.slackUserId);
        })
        .catch(err => console.log(`Error at getRecivantManagerSlackId`, err));
    });
}

function applyManagerFeedback(a_managerComment, a_managerApproval, a_transactionId) {
    Employee.findByIdAndUpdate(
                                a_transactionId,
                                {
                                    managerComment: a_managerComment,
                                    approved: a_managerApproval
                                });
}

module.exports = function createTransaction(transaction) {
    /*
    //person giving and person recieving kudos is not the same person => true
    
    //ensure both reciever and giver of kudos are an active part of the company
    //get weight ratio which is defined as position.weight of (from / to)
    
    const differentPerson = !(employeeIds.fromEmployee === employeeIds.toEmployee);
    const kudoIsValid = (differentPerson && promiseData.giverActivePerson && promiseData.recieverActivePerson);

    */

    return new Promise((resolve, reject) => {
        //console.log('Pre promise 1');
        Promise.all([
            getEmployeeInfoFromSlackId(transaction.fromSlackId),  //get from _id
            getEmployeeInfoFromSlackId(transaction.toSlackId)     //get to _id
        ]).then((dataFirst) => {
            //console.log('Pre promise 2');
            Promise.all([
                validateActivity(dataFirst[0]), //from _id
                validateActivity(dataFirst[1]), //to _id
                getWeight(dataFirst[0]),        //from _id
                getWeight(dataFirst[1])         //to _id
            ]).then((dataSecond) => {
                    Transaction.create({
                    from: dataFirst[0],         //from _id
                    to: dataFirst[1],           //to _id
                    message: transaction.message,
                    amount: transaction.amount,
                    weightRatio: (dataSecond[2] / dataSecond[3]),
                    approved: null
                })
                .then(dataThird => {
                    //console.log('Pre promise 3', dataThird.to);
                    Promise.all([getRecievantSlackId(dataThird.to), getRecivantManagerSlackId(dataThird.to)])
                    .then(values => {
                        console.log(values);
                        resolve({
                            /*
                            recivantId: values[0], 
                            managerId: values[1],*/
                            senderSlackId: transaction.fromSlackId,
                            managerSlackId: values[1],
                            recieverSlackId: values[0],
                            amount: transaction.amount,
                            transactionId: dataThird._id,
                            message: transaction.message
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