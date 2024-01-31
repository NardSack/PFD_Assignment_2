// const http = require("http");
// const fs = require('fs').promises;
// const SendbirdChat = require( '@sendbird/chat');
// const SendBirdDesk=require( 'sendbird-desk');
// const Ticket=require( 'sendbird-desk');
import http from "http";
import { promises as fs } from 'fs';
import SendbirdChat from '@sendbird/chat';
import SendBirdDesk from 'sendbird-desk';
import Ticket from 'sendbird-desk';
import axios from "axios";
import express from "express";
import bodyParser from "body-parser";
const APP_ID = 'AD791A35-62CA-4E37-A490-79C7368C5D77';
const host = 'localhost';
const port = 8000;
import { fileURLToPath } from 'url';
import path from 'path';
// const axios = require("axios");
// const express = require("express");
// const bodyParser = require("body-parser");
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

let indexFile;
const requestListener = function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.end(indexFile);
};

//const server = http.createServer(requestListener);
const server = http.createServer(app);
const SENDBIRDDESKAPITOKEN = '5c8b8e5ed3aac9c479d9cfc9e1ffca4d12e19e27';
connectDesk();
// fs.readFile(__dirname + "/index.html")
//     .then(contents => {
//         indexFile = contents;
//         server.listen(port, host, () => {
//             console.log(`Server is running on http://${host}:${port}`);
//             createtickets();
//             testposthandoff();
//         });
//     })
//     .catch(err => {
//         console.error(`Could not read index.html file: ${err}`);
//         process.exit(1);
//     });
const currentModuleUrl = new URL(import.meta.url);
const currentModulePath = fileURLToPath(currentModuleUrl);
const currentModuleDir = path.dirname(currentModulePath);
console.log(currentModuleDir);
fs.readFile(currentModuleDir + "/index.html")
    .then(contents => {
        indexFile = contents;
        server.listen(port, host, () => {
            console.log(`Server is running on http://${host}:${port}`);
            createtickets();
            testposthandoff();
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
  console.log('working')
app.post("/hand_off", async(req, res) => {
    console.log(req.body);
    const channelUrl = req.body.channel_url;
    res.status(200);
    res.send({ "message": "test1 done" });
    try {
        const updateResponse = await updateTicketStatus(channelUrl);
        
        if (updateResponse.success) {
            res.status(200).send({ "message": "Handing over to a human. Just a minute please." });
        } else {
            throw new Error(`updatae ticket error ${updateResponse.message}`);
        }
    } catch (e) {
        res.status(400).send({ "error": true, "message": e.message || "Failed to perform hand over" });
    }
});
console.log('working')
async function updateTicketStatus (channelUrl) {
    try {
      console.log("test 0")
      const ticket = await axios.get(`https://desk-api-${APP_ID}.sendbird.com/platform/v1/tickets?channel_url=${channelUrl}`, {
         headers: { 
           "Content-Type": "application/json; charset=utf8",
           "SENDBIRDDESKAPITOKEN": SENDBIRDDESKAPITOKEN
         }
      })
      console.log("test")
      const ticketId = ticket.data.results[0].id
      const ticketUpdate = await axios.patch(`https://desk-api-${APP_ID}.sendbird.com/platform/v1/tickets/${ticketId}`,{
        "priority": "HIGH"}, {
         headers: { 
           "Content-Type": "application/json; charset=utf8",
           "SENDBIRDDESKAPITOKEN": SENDBIRDDESKAPITOKEN
         }
      })
      console.log("test 2")

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
      console.log("test 3")

      return { success: true, message: 'Ticket updated successfully' };
    } catch (e) {
      console.log(`ticket error ${e}`)///////////////////////////////////////////////////////////
      return { success: false, message: 'Failed to update ticket' };
    }
  }
  

  const handOffData = {
    channel_url: "bot-channel-url", // Replace with the actual channel URL
    // Add any other required data for hand off
  };
  function testposthandoff(){
  axios.post("http://localhost:8000/hand_off", handOffData)
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.error(`this is the error transfer ${error.message}`);
    });
  }
  function createtickets()
  {
    var ticketparam = {
      title:"test 1",
      user : "939665",
      priority : "LOW",
      related_channel_url : ["bot-channel-url"]
    }
    axios.post("http://localhost:8000/new_ticket_webhook",ticketparam)
    .then(response => {
      console.log(response.data);
    })    
    .catch(error => {
      console.error(`this is the error newticket ${error.message}`);
    });
  }
  app.post("/newticket", async(req, res) => {
    tickettitle = req.body.title;
    username = req.body.user;
    priority =req.body.priority;
    relatedchannels = req.body.related_channel_url
    Ticket.create(tickettitle,username,priority,relatedchannels, (ticket, error) => {
      if (error) {
        // Handle error.
        console.log(error);
    }
    });
    
  })
  //connect user 
  var USER_ID = "939665";
  var ACCESS_TOKEN="026371109b6f10d35f69223599a1f458005be98a"
  async function connectDesk() {
    const params = {
        appId: APP_ID,
        // modules: [new GroupChannelModule()],
    }
    const sb = SendbirdChat.init(params);
    try {
        await sb.connect(USER_ID);
        SendBirdDesk.init(sb);
        SendBirdDesk.authenticate(USER_ID, ACCESS_TOKEN,
          (user, error) => {
              if (error) {
                  // Handle error.
              }
              // SendBirdDesk is now initialized,
              // and the customer is authenticated and connected to the Sendbird server.
              // The customer can message and chat with an agent.
      });
        // The customer is authenticated and connected to the Sendbird server.
    } catch (error) {
        // Handle error.
    }
}

