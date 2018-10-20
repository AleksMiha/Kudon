const express = require('express');
const router = express.Router();
const {
  WebClient
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

const admin_aproval_MESSAGE = require('../messages/admin_aproval');
const dialog_MESSAGE = require('../messages/dialog');


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
    if (req.body.event.message._id) {
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

// router.post('/commands/kudos', function (req, res) {
//   const channel_id = req.body.channel;

// });
const dialog_url = "https://slack.com/api/dialog.open";
const dialog = {
  "callback_id": "kudos_prompt",
  "title": "Send kudos",
  "submit_label": "Request",
  "elements": [{
      "label": "Assignee",
      "name": "bug_assignee",
      "type": "select",
      "data_source": "users"
    },
    {
      "type": "text",
      "label": "Amount of Kudos",
      "name": "Amount"
    },
    {
      "label": "Add comment",
      "name": "comment",
      "type": "textarea",
      "hint": "Provide additional information if needed."
    }

  ]
};

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
// res.json({
//     "trigger_id": "13345224609.738474920.8088930838d88f008e0",
//     "dialog": {
//       "callback_id": "ryde-46e2b0",
//       "title": "Request a Ride",
//       "submit_label": "Request",
//       "notify_on_cancel": true,
//       "state": "Limo",
//       "elements": [
//           {
//               "type": "text",
//               "label": "Pickup Location",
//               "name": "loc_origin"
//           },
//           {
//               "type": "text",
//               "label": "Dropoff Location",
//               "name": "loc_destination"
//           }
//       ]
//     }
//   })
// {
//     "text": "This is your first interactive message",
//     "attachments": [
//         {
//             "text": "Building buttons is easy right?",
//             "fallback": "Shame... buttons aren't supported in this land",
//             "callback_id": "accept",
//             "color": "#3AA3E3",
//             "attachment_type": "default",
//             "actions": [
//                 {
//                     "name": "yes",
//                     "text": "yes",
//                     "type": "button",
//                     "value": "yes"
//                 },
//                 {
//                     "name": "no",
//                     "text": "no",
//                     "type": "button",
//                     "value": "no"
//                 }
//             ]
//         }
//     ]
// })

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
    if (payload.actions[0].value === "yes") {
      res.send("You nice person");
    }
    if (payload.actions[0].value === "no") {
      res.send("you sucks");
    } 
  }
  if (payload.callback_id === "kudos_prompt") {
    res.status(200).end();
    const upperChannelId = null //TODO: get upper channel slack
    web.chat.postMessage({
      channel: payload.user.id,
      ...admin_aproval_MESSAGE
    })
    .catch(console.error);
  }
});


module.exports = router;