const express = require('express');
const router = express.Router();
const {
  WebClient,
  IncomingWebhook
} = require('@slack/client');
const Transaction = require('../models/Transaction');
const Employee = require('../models/Employee');
const secrets = require('../config/slack_secret');
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({
  extended: false
})
const axios = require('axios');
const CLIENT_ID = secrets.CLIENT_ID;
const CLIENT_SECRET = secrets.CLIENT_SECRET;
const BOT_TOKEN = secrets.BOT_TOKEN;
const WEBHOOK_URL = secrets.WEBHOOK_URL;

const admin_aproval_MESSAGE = require('../messages/admin_aproval');
const dialog_MESSAGE = require('../messages/dialog');
const newTransaction = require('../test')
const isKudosDialog = require('../messages/isKudosDialog');


const web = new WebClient(BOT_TOKEN);
const webhook = new IncomingWebhook(WEBHOOK_URL);

Transaction.count().exec(function (err, count) {
  // Get a random entry
  var random = Math.floor(Math.random() * count)
  Transaction.findOne().skip(random).populate('from', 'slackUserId').populate('to', 'slackUserId').exec(
    function (err, result) {
      // Tada! random user
      webhook.send(postRandomKudo(result.from.slackUserId, result.to.slackUserId, result.message, result.amount, result.added), function (err, res) {
        if (err) {
          console.log('Error:', err);
        } else {
          console.log('Message sent: ', res);
        }
      });
      // console.log(result) 
    })
})

function postRandomKudo(clientSentFrom, clientSentTo, comment, amount, _date) {
  const content = {
    "text": "Random Kudo",
    "attachments": [{
      "fallback": "Required plain-text summary of the attachment.",
      "color": "#36a64f",
      "pretext": "Optional text that appears above the attachment block",
      "title": "From",
      "text": `<@${clientSentFrom}>`,
      "fields": [{
          "title": "To",
          "value": `<@${clientSentTo}>`,
          "short": false
        },
        {
          "title": "Amount",
          "value": `${amount}`,
          "short": false
        },
        {
          "title": "Comment",
          "value": `${comment}`,
          "short": false
        }
      ],
      "footer": "Slack API",
      "ts": 123456789
    }]
  }
  return content;
}


setInterval(postRandomKudo, 1000 * 60 * 3);

/* GET users listing. */
router.get('/oauth', function (req, res) {
  // When a user authorizes an app, a code query parameter is passed on the oAuth endpoint. If that code is not there, we respond with an error message
  if (!req.query.code) {
    res.status(500);
    res.send({
      "Error": "Looks like we're not getting code."
    });
    console.log("Looks like we're not getting code.");
  } else {
    // If it's there...

    // We'll do a GET call to Slack's `oauth.access` endpoint, passing our app's client ID, client secret, and the code we just got as query parameters.
    request({
      url: 'https://slack.com/api/oauth.access', //URL to hit
      qs: {
        code: req.query.code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      }, //Query string data
      method: 'GET', //Specify the method

    }, function (error, response, body) {
      if (error) {
        console.log(error);
      } else {
        res.json(body);

      }
    })
  }
});

router.post('/event/kudos', (req, res, next) => {

  // res.send(req.body.challenge);
  if (req.body.event.type === "message") {
    // console.log(req.body)
    const rt = req.body.event.text;
    // console.log(rt)
    // console.log(rt.includes("ty"));
    if (rt.includes("ty") || rt.includes("thanks") || rt.includes("hvala")) {
      const conversationId = req.body.event.channel;
      // console.log(isKudosDialog);
      web.chat.postMessage({
        channel: conversationId,
        text: isKudosDialog.text,
        attachments: isKudosDialog.attachments
      });
      res.sendStatus(200);
    } else {
      res.sendStatus(200);
    }
  }
});

// router.post('/commands/kudos', function (req, res) {
//   const channel_id = req.body.channel;

// });
const dialog_url = "https://slack.com/api/dialog.open";
// handle the post triggered by slash command using node express
router.post('/commands/kudos', (req, res) => {
  // console.log(req.body);

  // console.log('trigger id', req.body.trigger_id)
  // console.log('type of trigger id', typeof (req.body.trigger_id))

  // post dialog to dialog url
  axios.post(dialog_url, {
    dialog: dialog_MESSAGE,
    trigger_id: req.body.trigger_id
  }, {
    headers: {
      'Content-type': 'application/json',
      'charset': 'UTF-8',
      'Authorization': `Bearer ${BOT_TOKEN}`
    }
  }).then(res => {
    // console.log(res.data);
  }).catch(err => console.log(err))
});

router.post('/commands/leaderboard', function (req, res) {
  console.log(req.body);
  res.send("Here is your leaderboard");
});



router.post('/interactive/action', function (req, res) {
  const payload = JSON.parse(req.body.payload);
  const sender_id = payload.user.id;
  // console.log(payload);

  if (payload.callback_id === "dialog") {
    if (payload.actions[0].value === "yes") {
      axios.post(dialog_url, {
        dialog: dialog_MESSAGE,
        trigger_id: payload.trigger_id
      }, {
        headers: {
          'Content-type': 'application/json',
          'charset': 'UTF-8',
          'Authorization': `Bearer ${BOT_TOKEN}`
        }
      }).then(res => {
        // console.log(res.data);
      }).catch(err => console.log(err))
    } else {
      res.status(200).end();
    }
  }
  //TODO: save to database
  if (payload.callback_id === "accept") {
    console.log(payload);

    const reference = payload.actions[0].value.split('_')[0];
    console.log(reference);

    if (payload.actions[0].value.split('_')[1] === "yes") {
      res.status(200).end();
      //change aproval database
      //Need toUserSlackId     
      Transaction.findById(reference).then(data => {
        console.log("Transaction data", data);
        // console.log("data: ", data)
        web.chat.postMessage({
          channel: data.from_slackId,
          text: `Your ${data.amount} kudos were successfully transfered to <@${data.to_slackId}>,
          his boss <@${data.manager_slackId}> oprove it. `
        }).catch(err => console.log("there was an error with web.chat", err));
        web.chat.postMessage({
          channel: data.to_slackId,
          text: `Your co-worker <@${data.from_slackId}> is giving you ${data.amount} of Kudos.
          He said: ${data.messege}.
          Your boss <@${data.manager_slackId} aprove it.`
        }).catch(err => console.log("there was an error with web.chat", err));;
      }).catch(err => console.log("error in answer action", err));
    }
    if (payload.actions[0].value.split("_")[1] === "no") {
        Transaction.findById(reference).then(data => {
          console.log("Transaction data", data);
          // console.log("data: ", data)
          web.chat.postMessage({
            channel: data.from_slackId,
            text: `Boss <@${data.manager_slackId}> is angry at you, 
            so he does not want you to give ${data.amount} kudos
            to <@${data.to_slackId}>.`
          }).catch(err => console.log("there was an error with web.chat", err));
          web.chat.postMessage({
            channel: data.to_slackId,
            text: `Your co-worker <@${data.from_slackId}> was offering you ${data.amount} of Kudos, 
            But your boss <@${data.manager_slackId} sadly cancell the transaction.`
          }).catch(err => console.log("there was an error with web.chat", err));;
        }).catch(err => console.log("error in answer action", err));
      res.send("you sucks");
      web.chat.postMessage({
        channel: toUserSlackId,
        text: `Your co-worker ˘${fromUserSlackName} sent you ${amount} of Kudos,
          but your boss ${bossName}
          rejected transaction due to: ${toUserSlackName}.`
      });
      web.chat.postMessage({
        channel: kudoGiverId,
        text: `You have sent ${amount} of kudos,
         but his boss ${bossName} rejected transaction,
         due to ${bossComment}`
      });
      //change aproval database to refused
    }
  }

  if (payload.callback_id === "kudos_prompt") {
    const fromUserId = payload.user.id;
    const fromUserName = payload.user.name;
    const toUserId = payload.submission.toUser;
    const message = payload.submission.comment;
    const amount = Number(payload.submission.Amount);
    console.log("From userId", fromUserId);
    console.log("To UserId", toUserId);


    res.status(200).end();
    Employee.findOne({
      slackUserId: toUserId
    }).populate('managerId').then((data) => {
      console.log("data: ", data)
      data.set({
        kudos: data.kudos + amount
      })
      data.save().then(msg => console.log("msg", msg)).catch(err => console.log("error at save", msg));
      Employee.updateOne({
        slackUserId: fromUserId
      }, {
        kudos: data.kudos - amount
      }).then(msg => console.log("update from", msg)).catch(err => console.error(err))
      Employee.findOne({
          slackUserId: fromUserId
        })
        .then(_msg => {
          console.log("_msg", _msg);
          Transaction.create({
              from: _msg._id,
              to: data._id,
              message: message,
              amount: amount,
              manager: data.managerId._id,
              from_slackId: fromUserId,
              to_slackId: toUserId,
              manager_slackId: data.managerId.slackUserId
            })
            .then(msg => {
              console.log("msg2", msg);
              web.chat.postMessage({
                  channel: data.managerId.slackUserId,
                  // ...admin_aproval_MESSAGE
                  "text": `User <@${fromUserId}>, \n Wants to send: ${amount} Kudos, \n To: <@${toUserId}>,\n He is saying that: ${message}`,
                  "attachments": [{
                    "text": "Building buttons is easy right?",
                    "fallback": "Shame... buttons aren't supported in this land",
                    "callback_id": "accept",
                    "color": "#3AA3E3",
                    "attachment_type": "default",
                    "actions": [{
                        "name": "yes",
                        "text": "yes",
                        "type": "button",
                        "value": `${msg._id}_yes`

                      },
                      {
                        "name": "no",
                        "text": "no",
                        "type": "button",
                        "value": `${msg._id}_no`
                      }
                    ]
                  }]
                }
              )

            })
            .catch(err => console.error(err));
        }).catch(err => console.log("error at create", err));
    });


  }});


// const { senderSlackId, managerSlackId, recieverSlackId, amount, transactionId, message } = data;


// const toUserName  retrievaš iz baze
//TODO: 
//get trade_id and pass it to the admin_aproval



module.exports = router;