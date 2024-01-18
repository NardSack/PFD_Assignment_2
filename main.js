const http = require("http");
const fs = require('fs').promises;

const host = 'localhost';
const port = 8000;

const axios = require("axios");
const express = require("express");
const app = express();
app.use(express.json());

let indexFile;
const requestListener = function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.end(indexFile);
};

const server = http.createServer(requestListener);

fs.readFile(__dirname + "/index.html")
    .then(contents => {
        indexFile = contents;
        server.listen(port, host, () => {
            console.log(`Server is running on http://${host}:${port}`);
        });
    })
    .catch(err => {
        console.error(`Could not read index.html file: ${err}`);
        process.exit(1);
    });


app.post("/new_ticket_webhook", async (req, res) => {
    // Send 200 OK response
   res.status(200).send("OK"); // Respond right away to avoid duplicate webhooks
   const data = req.body.data; // Extract data from request body
   const eventType = req.body.eventType; // Extract event type from request body
   // Check if the event type is 'TICKET.CREATED'
   if (eventType === 'TICKET.CREATED') {
       const channelUrl = data.channelUrl; // Extract channel URL from data
       const botId = "ticket_bot_1"; // Specify bot ID
         // Invite bot to the channel
        const sendInvite = await inviteBotToChannel(channelUrl, botId);
 }
 });
 async function inviteBotToChannel(channelUrl, botId) {
    const endpoint = `https://api-${APP_ID}.sendbird.com/v3/group_channels/${channelUrl}/invite`;
    const headers = {
      'Content-Type': 'application/json',
      'Api-Token': API_TOKEN 
    };
    const data = {user_ids: [botId]};
    try {
      // Send a POST request to invite the bot
      const response = await axios.post(endpoint, data, { headers: headers });
      return response.data;
    } catch (error) {
      // Throw an error if the invitation fails
      throw new Error(`Failed to invite bot. Status: ${error.response.status}. Response:   
      ${error.response.data}`);
    }
  }
  // Helper function to add a user to a SendBird channel
app.post("/hand_off", async(req, res) => {
    console.log(req.body);
    const channelUrl = req.body.channel_url;

    try {
        const updateResponse = await updateTicketStatus(channelUrl);
        
        if (updateResponse.success) {
            res.status(200).send({ "message": "Handing over to a human. Just a minute please." });
        } else {
            throw new Error(updateResponse.message);
        }
    } catch (e) {
        res.status(400).send({ "error": true, "message": e.message || "Failed to perform hand over" });
    }
});

async function updateTicketStatus (channelUrl) {
    try {
      const ticket = await axios.get(`https://desk-api-${APP_ID}.sendbird.com/platform/v1/tickets?channel_url=${channelUrl}`, {
         headers: { 
           "Content-Type": "application/json; charset=utf8",
           "SENDBIRDDESKAPITOKEN": SENDBIRDDESKAPITOKEN
         }
      })
      const ticketId = ticket.data.results[0].id
      const ticketUpdate = await axios.patch(`https://desk-api-${APP_ID}.sendbird.com/platform/v1/tickets/${ticketId}`,{
        "priority": "HIGH"}, {
         headers: { 
           "Content-Type": "application/json; charset=utf8",
           "SENDBIRDDESKAPITOKEN": SENDBIRDDESKAPITOKEN
         }
      })
      const assignGroup = await axios.post(`https://desk-api-${APP_ID}.sendbird.com/platform/v1/tickets/transfer_to_group`,{
        "tickets": [ticketId],
        "status": "PENDING",
        "groupKey":"example1"
      }, {
         headers: { 
           "Content-Type": "application/json; charset=utf8",
           "SENDBIRDDESKAPITOKEN": SENDBIRDDESKAPITOKEN
         }
      })
      return { success: true, message: 'Ticket updated successfully' };
    } catch (e) {
      console.log(e)
      return { success: false, message: 'Failed to update ticket' };
    }
  }