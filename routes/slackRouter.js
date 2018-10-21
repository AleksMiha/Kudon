const express = require('express');
const router = express.Router();
const {
  WebClient,
  IncomingWebhook
} = require('@slack/client');
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


const web = new WebClient(BOT_TOKEN);
const webhook = new IncomingWebhook(WEBHOOK_URL);

function postRandomKudo() {
  //retrieve from database
  const clientSentFrom = "Aleks";
  const clientSentTo = "Miha";
  const comment = "Becasue you work hard";
  const ammount = "666";
  const _date = "21.10.2018";
  const content = `Random kudo:
  On ${_date}
  User: ${clientSentFrom}
  sent ${clientSentTo}
   ${ammount} kudos
  Comment: ${comment}
  `
  webhook.send(content, function (err, res) {
    if (err) {
      console.log('Error:', err);
    } else {
      console.log('Message sent: ', res);
    }
  });
}

setInterval(postRandomKudo, 1000 * 60 * 5);

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
    if (req.body.event.message._id) {
      res.sendStatus(200);
    } else {
      if (req.body.event.text.includes("sup")) {
        console.log(req.body.event);
        const conversationId = req.body.event.channel;
        res.sendStatus(200);
        web.chat.postMessage({
            channel: conversationId,
            text: `You just said something`
          })
          .catch(console.error);
      }
    }
  }
});

// router.post('/commands/kudos', function (req, res) {
//   const channel_id = req.body.channel;

// });
const dialog_url = "https://slack.com/api/dialog.open";
// handle the post triggered by slash command using node express
router.post('/commands/kudos', (req, res) => {
  console.log(req.body);

  console.log('trigger id', req.body.trigger_id)
  console.log('type of trigger id', typeof (req.body.trigger_id))

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
    console.log(res.data);
  }).catch(err => console.log(err))
});

router.post('/commands/leaderboard', function (req, res) {
  console.log(req.body);
  res.send("Here is your leaderboard");
});



router.post('/interactive/action', function (req, res) {
  const payload = JSON.parse(req.body.payload);
  const sender_id = payload.user.id
  console.log(payload);
  //TODO: save to database
  if (payload.callback_id === "accept") {
      const kudoGiverId = "4321";
      const toUserSlackId = "1234"; //Need
      const amount = "666";  //Need
      const bossComment = "Let it be"; //Need
      const bossName = "Mirko Novak"
      const employeeComment = "You deserve it";
      const toUserSlackName = "Luka Petelin";
      const fromUserSlackName = "Mirko Car";
      const reference = payload.actions[0].value.ref;

    if (payload.actions[0].value.answer === "yes") {
      res.send("You nice person");
       //change aproval database
       //Need toUserSlackId      
       web.chat.postMessage({
        channel: kudoGiverId,
        text: `Your ${amount} kudos were successfully transfered to ${toUserSlackName},
        his boss ${bossName} said: ${bossComment}. `
      });
       web.chat.postMessage({
        channel: toUserSlackId,
        text: `Your co-worker ${fromUserSlackName} is giving you ${amount} of Kudos.
        He said: ${employeeComment}.
        Your boss ${bossName} aproved it, his commment: ${bossComment}`
      });
    }
    if (payload.actions[0].value.answer === "no") {
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
    //add to database kudos sending
    
    newTransaction({
      message,
      fromSlackId: fromUserId,
      toSlackId: toUserId,
      amount
    }).then(data => {
      const { senderSlackId, managerSlackId, recieverSlackId, amount, transactionId, message } = data;
      console.log("data is data", data)
      web.chat.postMessage({
        channel: payload.user.id, 
        // ...admin_aproval_MESSAGE
        "text": `User <@${senderSlackId}>, \n Wants to send: ${amount} Kudos, \n To: <@${recieverSlackId}>,\n He is saying that: ${message}`,
        "attachments": [
          {
              "text": "Building buttons is easy right?",
              "fallback": "Shame... buttons aren't supported in this land",
              "callback_id": "accept",
              "color": "#3AA3E3",
              "attachment_type": "default",
              "actions": [
                  {
                      "name": "yes",
                      "text": "yes",
                      "type": "button",
                      "value": {
                        "answer": "yes",
                        "ref": `${transaction_id}`
                      }
  
                  },
                  {
                      "name": "no",
                      "text": "no",
                      "type": "button",
                      "value": {
                        "answer": "no",
                        "ref": `${transaction_id}`
                      }
                  }
              ]
          }
      ]   
      })
      .catch(console.error);
    }).catch(err => console.log("there is an error"));

    
    // const toUserName  retrievaš iz baze
    //TODO: 
    //get trade_id and pass it to the admin_aproval
    res.status(200).end();
  }
});
module.exports = router;