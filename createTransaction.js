//const express = require('express');
const mongoose = require('mongoose');

//const PositionModel = require('./models/Position');
const Employee = require('./models/Employee');
const Transaction = require('./models/Transaction');

const mongoURI = 'mongodb://root:root123@ds237363.mlab.com:37363/celtrakudos';

//const app = express();

mongoose.connect(mongoURI, { useNewUrlParser: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));



function getEmployee(a_param) {
    return new Promise((resolve,reject) => {
        //console.log('a_param is ', a_param);
        Employee.find(a_param)
            .populate('position')
            .then(employee => {
                //console.log('this is empl', employee)
                resolve(employee[0])
            })
            .catch(err => {
                console.log('Error at getEmployee', err, 'at querying parameter', a_param)
            });
    });
}

module.exports = function createTransaction(transaction) {

    return new Promise((resolve, reject) => {
        //console.log('Pre promise 1');
        Promise.all([
            getEmployee({slackUserId: transaction.fromSlackId}),  //get from _id
            getEmployee({slackUserId: transaction.fromSlackId})     //get to _id
        ]).then((dataFirst) => {
            //console.log('Pre promise 2');
            Promise.all([
                getEmployee({_id: dataFirst[0]}), //from _id
                getEmployee({_id: dataFirst[1]}), //to _id
            ]).then((employeeData) => {
                //both persons are still an active part of the company
                const validSender = employeeData[0].active;
                const validReciever = employeeData[1].active;
                //the user is not sending kudos to himself
                const notSameUser = (employeeData[0]._id !== employeeData[1]._id);
                if (!(validSender && validReciever && notSameUser)) {
                    reject({validSender, validReciever, notSameUser});
                }
                Transaction.create({
                    from: employeeData[0]._id,         //from _id
                    to: employeeData[1]._id,           //to _id
                    message: transaction.message,
                    amount: transaction.amount,
                    weightRatio: (employeeData[0].position.weight / employeeData[1].position.weight),
                    approved: null,
                    manager: employeeData[1].managerId

                })
                .then(dataThird => {
                    //console.log('Pre promise 3', employeeData[1].managerId);
                    //console.log('Pre promise 3 sasag', employeeData);
                    Promise.all([/*getEmployee({dataThird.to}), */getEmployee({_id: employeeData[1].managerId})])
                    .then(managerInfo => {
                        //console.log(managerInfo);
                        resolve({
                            senderSlackId: transaction.fromSlackId,
                            managerSlackId: managerInfo[0].slackUserId,
                            recieverSlackId: transaction.toSlackId,
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
};
/*
createTransaction({
    fromSlackId: 'kafje',
    toSlackId: 'malopolje',
    amount: 5555,
    message: 'this is an attempt'

})
    .then(data=>console.log(data))
    .catch(err=>console.log('error on call createTransaction', err));


app.get('/', (req, res)=>{
    res.send('working');
})

app.listen(3000);
console.log('listening to port 3000')*/