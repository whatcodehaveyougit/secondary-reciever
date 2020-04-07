"use strict";

// Imports dependencies and set up http server
const express = require("express"),
body_parser = require("body-parser"),
fs = require("fs"),
app = express().use(body_parser.json()), // creates express http server
chatBot = require("./models/chatbot");

let botInstances = [];

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

// Accepts POST requests at /webhook endpoint
app.post("/webhook", (req, res) => {
  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === "page") {
    body.entry.forEach(function(entry) {
      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;

      let currentBot = botInstances.find(bot => bot.userId === sender_psid);

      if (!currentBot) {
        currentBot = new chatBot(sender_psid);
        botInstances.push(currentBot)
      }

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message || webhook_event.attachments) {
        currentBot.userAnswers[currentBot.currentQuestion] = webhook_event.message.text;
        currentBot.handleMessage(webhook_event.message);
      } else if (webhook_event.postback) {
        currentBot.userAnswers[currentBot.currentQuestion] = webhook_event.postback.text;
        currentBot.handlePostback(webhook_event.postback);
      }
    });
    // Return a '200 OK' response to all events
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Accepts GET requests at the /webhook endpoint
app.get("/webhook", (req, res) => {
  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = process.env.VERIFICATION_TOKEN;

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Respond with 200 OK and challenge token from the request
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

// function finish(sender_psid) {
//   console.log("Users answers: ", userAnswers);
//   let today = new Date();
//   let dd = String(today.getDate()).padStart(2, '0');
//   let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
//   let yyyy = today.getFullYear();
//   let hour = String(today.getHours()).padStart(2, '0');
//   let minute = String(today.getMinutes()).padStart(2, '0');
//   let date = dd + "-" + mm + "-" + yyyy + "-" + hour + ":" + minute;
//
//   fs.writeFile(`${sender_psid}_${date}.JSON`, userAnswers, err => {console.error()});
// }
