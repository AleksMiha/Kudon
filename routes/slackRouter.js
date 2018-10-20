const express = require('express');
const router = express.Router();
const { WebClient } = require('@slack/client');
const secrets = require('../config/slack_secret');
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({ extended: false })

const CLIENT_ID = secrets.CLIENT_ID;
const CLIENT_SECRET = secrets.CLIENT_SECRET;
const BOT_TOKEN = secrets.BOT_TOKEN;


const web = new WebClient(BOT_TOKEN);
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
    if (req.body.event.message.bot_id) {
      res.sendStatus(200);
    } else {
    if (req.body.event.text.includes("sup")) {
      ts = req.body.event.ts;
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

router.post('/commands/kudos', function (req, res) {
  const channel_id = req.body.channel;
  res.json({
    "text": "This is your first interactive message",
    "attachments": [
        {
            "text": "Building buttons is easy right?",
            "fallback": "Shame... buttons aren't supported in this land",
            "callback_id": "button_tutorial",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "yes",
                    "text": "yes",
                    "type": "button",
                    "value": "yes"
                },
                {
                    "name": "no",
                    "text": "no",
                    "type": "button",
                    "value": "no"
                },
                {
                    "name": "maybe",
                    "text": "maybe",
                    "type": "button",
                    "value": "maybe",
                    "style": "danger"
                }
            ]
        }
    ]
})
});

router.post('/commands/leaderboard', function (req, res) {
  console.log(req.body);
  res.send("Here is your leaderboard");
});

// router.post('/commands/kudos', urlencodedParser, (req, res) =>{
//   res.status(200).end() // best practice to respond with empty 200 status code
//   const reqBody = req.body
//   const responseURL = reqBody.response_url
//   if (reqBody.token != YOUR_APP_VERIFICATION_TOKEN){
//       res.status(403).end("Access forbidden")
//   }else{
//       const message = {
//           "text": "This is your first interactive message",
//           "attachments": [
//               {
//                   "text": "Building buttons is easy right?",
//                   "fallback": "Shame... buttons aren't supported in this land",
//                   "callback_id": "access",
//                   "color": "#3AA3E3",
//                   "attachment_type": "default",
//                   "actions": [
//                       {
//                           "name": "yes",
//                           "text": "yes",
//                           "type": "button",
//                           "value": "yes"
//                       },
//                       {
//                           "name": "no",
//                           "text": "no",
//                           "type": "button",
//                           "value": "no"
//                       },
//                       {
//                           "name": "maybe",
//                           "text": "maybe",
//                           "type": "button",
//                           "value": "maybe",
//                           "style": "danger"
//                       }
//                   ]
//               }
//           ]
//       }
//       sendMessageToSlackResponseURL(responseURL, message)
//   }
// })


router.post('/interactive/action', function (req, res) {
  const payload = JSON.parse(req.body.payload);
  res.send("Here is your fcking response");
});


module.exports = router;