require("dotenv").config();
const express = require('express');
const cors = require("cors");
const NsApiWrapper = require('netsuite-rest');
const axios = require('axios');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const vendorRoutes = require("./routes/vendorRoutes");
const netsuiteAuth = require('./config/customAuth');
const savedsearch = require("./routes/savedSearchRoute");
const { Pool } = require('pg');
const cron = require("node-cron");
const nodemailer = require('nodemailer'); // Import Nodemailer
const {smtp_port,smtp_user,smtp_pass,smtp_from,smtp_to} = require("./config/smtp.js")


// DB environment variables
const port = process.env.SERVER_PORT || 3002; // You can change the port as needed
const user = process.env.USER;
const host = process.env.HOST;
const database = process.env.DATABASE;
const password = process.env.PASSWORD;
const DB_PORT = process.env.DB_PORT;

const app = express();
app.use(cors());
app.use(express.json());
console.log(smtp_pass)

// Route to fetch all vendors
app.use("/vendors", vendorRoutes);
app.use("/vendor", vendorRoutes);
app.use("/", savedsearch);

app.get('/', (req, res) => {
    res.send('NetSuite API Server is running');
});

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: smtp_user,
      pass: smtp_pass,
    },
  });
// Schedule a Cron Job
cron.schedule('*/1 * * * *', async () => {
    console.log('Server triggered: Automatically hitting APIs...');

    try {
        // Automatically hit your API endpoints
        const response4705 = await axios.get('http://localhost:3002/4705');
        console.log('Response from /4705:', response4705.data);

        const response4541 = await axios.get('http://localhost:3002/4541');
        console.log('Response from /4541:', response4541.data);

        // Send success email
        await transporter.sendMail({
            from: smtp_from,
            to: smtp_to,
            subject: 'Database update result: Success',
            html: `
                <p>Dear Team,</p>
                <p>The scheduled database update job has been executed successfully on <b>${new Date().toLocaleString()}</b>. Below are the details of the API responses:</p>
                <ul>
                    <li><b>API Endpoint /4705:</b> ${response4705.data.message}, Rows Processed: ${response4705.data.rowsProcessed}</li>
                    <li><b>API Endpoint /4541:</b> ${response4541.data.message}, Rows Processed: ${response4541.data.rowsProcessed}</li>
                </ul>
                <p>Kindly review and let us know if any further actions are required.</p>
                <p>Best regards,<br>Your Beloved Node Server ❤️</p>
            `
        });
        

        console.log('Success email sent!');
    } catch (err) {
        console.error('Error in cron job:', err.message);

        // Send failure email
        await transporter.sendMail({
            from: smtp_from,
            to: smtp_to,
            subject: 'Database Update Result: Failure',
            html: `
                <p>Dear Team,</p>
                <p>The scheduled database job encountered an error during execution on <b>${new Date().toLocaleString()}</b>. Below are the error details:</p>
                <p><b>Error Message:</b> ${err.message}</p>
                <p>Please investigate the issue and take corrective measures at the earliest convenience.</p>
                <p>Best regards,<br>Your Beloved Node Server ❤️ </p>
            `
        });
         await transporter.sendMail({
            from: smtp_from, // Sender address
            to: smtp_to, // Recipient email
            subject: 'Database Update Failure Notification',
            text: `Database update job failed at ${new Date().toLocaleString()}.\n\nError: ${err.message}`
        });

        console.log('Failure email sent!');
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port} `);
});
