import axios from "axios";
import express from "express";
import bodyParser from "body-parser";
import http from "http";
import fs from 'fs/promises'; // Note the change here

import path from 'path';
import { channel } from 'diagnostics_channel';
import { Console, error } from 'console';
import { promises } from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import SendbirdChat, { ConnectionHandler } from '@sendbird/chat';
import { GroupChannelModule ,GroupChannelHandler } from "@sendbird/chat/groupChannel"
import SendBirdDesk from 'sendbird-desk';
/**
 * Install Sendbird
 */
import SendBird from "sendbird";
const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

var APP_ID = 'AD791A35-62CA-4E37-A490-79C7368C5D77';
//var USER_ID = 'bot1';
var BOT_ID = 'bot1';
const TOKEN = 'eb55f1c4e4118a422644b97f0e62ba1f39014649';
const ENTRYPOINT = 'https://api-AD791A35-62CA-4E37-A490-79C7368C5D77.sendbird.com/v3/bots';

//dataset
var USER_ID="939665";
var accesstoken = "026371109b6f10d35f69223599a1f458005be98a";
// Serve static files from the root folder
app.use(express.static(__dirname));

// Serve index.html as the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    // Running the connectDesk() function.
console.log("Start code");
console.log(USER_ID);
connectDesk(USER_ID);

});



app.post("/hand_off", async(req, res) => {
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


var sb = new SendBird({appId: APP_ID});

//connecttoSB(userid,accesstoken);
  //connect to sendbird
  async function connecttoSB(userid,Token)
  {

    //to use await need use async function
    //for new users to login and reoccurring users
    if (userid !="anonymous" || Token != null)
    {
        try {
        await sb.connect(userid,Token);
        }
        catch (error) {
        await sb.connect(userid);
        }
    }
    else {
        await sb.connect(userid);
    }
    console.log(sb.currentUser);
    return sb.currentUser;
    }

    // The USER_ID below should be unique to your Sendbird application.
async function connectDesk(USER_ID) {
    console.log(APP_ID)
    console.log("AD791A35-62CA-4E37-A490-79C7368C5D77")
    // const sb = SendBird.init({
    //     appId: APP_ID,
    //     modules: [new GroupChannelModule()],
    // })
    
    // const sb = SendbirdChat.init({
    //   appId : APP_ID,
    //   modules: [
    //     new GroupChannelModule()
    //   ]
    // });
    // //console.log(sb)
    // var handlerId="testingone123"
    // sb.groupChannel.addGroupChannelHandler(handlerId, new GroupChannelHandler({
    //   onMessageReceived: (channel, message) => {
    //     // message received
    //   }
    // }));
    
    const user = sb.connect(USER_ID,accesstoken).then(res =>{console.log(res)});
    // console.log(user);
    var channelUrl="bot-channel-url";
    const autoAccept = false;
    await sb.setChannelInvitationPreference(autoAccept);
    var otheruser=new SendBird({appId: APP_ID});
    await otheruser.connect("bot1","ec128da9e68474e5c2f1297e1d76182de4a07988")
    var inchannel = await otheruser.GroupChannel.getChannel(channelUrl);
    var result = await inchannel.inviteWithUserIds([USER_ID])
    console.log(result);
    const channel = await sb.GroupChannel.getChannel(channelUrl);
    try
      {await channel.acceptInvitation();}
      catch (err){}
    var message = "pls work"
    
    await channel.sendUserMessage(message,function(res,error){})
      // .onPending((message) => {
      //   // message is pending to be sent
      // })
      // .onSucceeded((message) => {
      //   // message sent
      // })
      // .onFailed((err, message) => {
      //   // message not sent
      // });

    // try {
        
    //     const user = await sb.connect(USER_ID,accesstoken);
    //     // The user is connected to Sendbird server.
    //     console.log(user);
    //     console.log("connected");
    //     // const channel = await sb.groupChannel.createChannel(new GroupChannelParams());
    //     // console.log(channel)
    //   } catch (err) {
    //     // Handle error.
    //     console.log(accesstoken)
    //     console.log(err)
    //   }
    // try {
    //     console.log("Before connect");
    //     console.log(USER_ID);
    //     //const user = await sb.connect(USER_ID,accesstoken);
    //     sb.connect(USER_ID, accesstoken, (user, error) => {
    //         if (error) {
    //             // Handle error.
    //         }
        
    //         SendBirdDesk.init(sb,SendbirdDesk.DeviceOsPlatform.MOBILE_WEB);
        
    //         SendBirdDesk.authenticate(USER_ID, accesstoken,
    //             (user, error) => {
    //                 if (error) {
    //                     // Handle error.
    //                 }
        
    //                 // SendBirdDesk is now initialized,
    //                 // and the customer is authenticated and connected to the Sendbird server.
    //                 // The customer can message and chat with an agent.
    //         });
    //     });
    // } catch (error) {
    //     // Handle error.
    //     console.log(error)
    //     console.log("no connect")
    // }
}

function createticket()
{    

    var title="test 2";
    
    var priority = "LOW";
    var related_channel_url = ["sendbird_group_channel_414329462_bcc7edc1072c2665ea22d0d525bd8b35382a19e3"];
    console.log("happen")
    Ticket.create(title, USER_ID, priority, related_channel_url, (ticket, error) => {
        if (error) {
            // Handle error.
        }
        console.log(ticket);
        // The ticket is created.
        // The customer and agent can chat with each other by sending a message through the ticket.channel.sendUserMessage() or sendFileMessage().
        // The ticket.channel property indicates the group channel object within the ticket.
    });
}
