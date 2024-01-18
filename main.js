const http = require("http");
const fs = require('fs').promises;

const host = 'localhost';
const port = 8000;

let indexFile;
const requestListener = function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.end(indexFile);
};

const server = http.createServer(requestListener);

fs.readFile(__dirname + "/homepage.html")
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

const express = require("express");
const app = express();
app.use(express.json());
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