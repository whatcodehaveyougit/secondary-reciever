const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN,
request = require("request"),

class chatBot {
  constructor (userId) {
    this.userId = userId;
  }


    // Send the HTTP request to the Messenger Platform
    request(
        {
          uri: `https://graph.facebook.com/v4.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
          // qs: { access_token: PAGE_ACCESS_TOKEN },
          method: "POST",
          body: JSON.stringify(request_body),
          headers: { 'Content-Type': 'application/json'}
        },
        (err, res, body) => {
          if (err) {
            console.error("Unable to send message:" + err);
          } else if (body.includes("recipient_id")) {
            console.log("message sent!", body);
          }
        }
    );

  }

module.exports = chatBot;
