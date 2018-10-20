const express = require('express');
const router = express.Router();
const { WebClient } = require('@slack/client');
const secrets = require('../config/slack_secret');

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
  if (req.body.event.type === "message") {
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
  } else {
    res.sendStatus(200);
  }
});

router.post('/message_action', function (req, res) {
  console.log(req.body);
  res.send("You sent kudos");
});

router.post('/commands/leaderboard', function (req, res) {
  console.log(req.body);
  res.send("Here is your leaderboard");
});

// router.post('/commands/kudos', function (req, res) {
//   console.log(req.body);
//   res.json({
//     text: "It is cool",
//     attachments: [
//       {
//           text:"Partly cloudy today and tomorrow"
//       }
//   ]
//   });
// });
//   web.chat.postMessage({
//     channel: conversationId,
//     text: 'Hello there',
//     attachments: [
//       {
//         "fallback": "Required plain-text summary of the attachment.",
//         "color": "#36a64f",
//         "author_name": "Bobby Tables",
//         "author_link": "http://flickr.com/bobby/",
//         "author_icon": "http://flickr.com/icons/bobby.jpg",
//         "title": "Slack API Documentation",
//         "title_link": "https://api.slack.com/",
//         "text": "Optional text that appears within the attachment",
//         "fields": [
//           {
//             "title": "Priority",
//             "value": "High",
//             "short": false
//           }
//         ],
//         "image_url": "http://my-website.com/path/to/image.jpg",
//         "thumb_url": "http://example.com/path/to/thumb.png",
//         "footer": "Slack API",
//         "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
//         "ts": 123456789
//       }
//     ]
//   }).then(res => console.log(res))
// });

module.exports = router;