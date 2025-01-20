require("dotenv").config()
const express = require('express');
const cors = require("cors");
const NsApiWrapper = require('netsuite-rest');
const axios = require('axios');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const vendorRoutes = require("./routes/vendorRoutes")
const netsuiteAuth = require('./config/customAuth');
const savedsearch= require("./routes/savedSearchRoute")
const { Pool } = require('pg');

// netsuit env variables
const consumer_key= process.env.NETSUITE_CONSUMER_KEY
const consumer_secret_key=process.env.NETSUITE_CONSUMER_SECRET
const token_id= process.env.NETSUITE_TOKEN_ID
const token_secret= process.env.NETSUITE_TOKEN_SECRET
const realm= process.env.REALM
const netsuit_uri=process.env.NETSUIT_URI

const app = express();
app.use(cors());
// db env variables
const port = process.env.SERVER_PORT || 3002; // You can change the port as needed
const user=process.env.USER
const host=process.env.HOST
const database=process.env.DATABASE
const password= process.env.PASSWORD
const DB_PORT = process.env.DB_PORT




// set up postgres database schma
// Configure the PostgreSQL connection
const pool = new Pool({
    user: user,
    host: host,
    database: database,
    password:password,
    port: DB_PORT,
    // ssl: {
    //     rejectUnauthorized: false, // Allow self-signed certificates
    //   },
});
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to PostgreSQL:-----', err.stack);
    } else {
        console.log('Connected to PostgreSQL database successfully');
    }
    release(); // Release the client back to the pool
});



// Set up the NetSuite API Wrapper

// Middleware to parse JSON bodies
app.use(express.json());

// Route to fetch all vendors
app.use("/vendors",vendorRoutes)
app.use("/vendor",vendorRoutes)
app.use("/",savedsearch)

// Route to fetch saved search results from a Restlet

// function to compute the hash for rows
const BATCH_SIZE = 200;

// app.get('/savedsearch', async (req, res) => {
//     const oauth = OAuth({
//         consumer: {
//             key:consumer_key,
//             secret:consumer_secret_key
//         },
//         signature_method: 'HMAC-SHA256',
//         hash_function(baseString, key) {
//             return crypto.createHmac('sha256', key).update(baseString).digest('base64');
//         },
//     });

//     const token = {
//         key:token_id,
//         secret:token_secret,
//     };

//     const url =netsuit_uri;

//     const requestData = {
//         url: url,
//         method: 'GET',
//     };

//     const headers = {
//         ...oauth.toHeader(oauth.authorize(requestData, token)),
//         Authorization: `${oauth.toHeader(oauth.authorize(requestData, token)).Authorization}, realm=${realm}`,
//     };

//     try {
//         const response = await axios.get(url, { headers });
//         const results = response.data;
//         const client = await pool.connect();

//         try {
//             await client.query('BEGIN'); // Start transaction

//             // Clear the database table
//             await client.query('DELETE FROM dbA');
//             console.log('Cleared existing data from dbA');

//             // Split the data into batches of 100 rows
//             for (let i = 0; i < results.length; i += BATCH_SIZE) {
//                 const batch = results.slice(i, i + BATCH_SIZE);

//                 const insertQueries = batch.map(record => {
//                     return {
//                         text: `
//                             INSERT INTO dbA (
//                                 internal_id, posting_date, document_type, subsidiary, vendor_doc_date,
//                                 external_document_no, transaction_number, document_number, entry_date,
//                                 gl_account_no, gl_account_name, narration, narration_line_level,
//                                 main_line_name, name, amount, amount_debit, amount_credit, exchange_rate,
//                                 currency, amount_foreign_currency, debit_fx_amount, credit_fx_amount,
//                                 invoice_number, department, location, ba_code, states_2, expense_type,
//                                 prid_location, project_id_code, business_type, user_id, status, purchase_order
//                             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
//                                       $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
//                                       $31, $32, $33, $34, $35)
//                         `,
//                         values: [
//                             record.id,
//                             record.columns.find(c => c.name === 'trandate')?.value || null,
//                             record.columns.find(c => c.name === 'type')?.value || null,
//                             record.columns.find(c => c.name === 'subsidiarynohierarchy')?.value || null,
//                             record.columns.find(c => c.name === 'custbody_doc_date')?.value || null,
//                             record.columns.find(c => c.name === 'custbody_external_doc_no')?.value || null,
//                             record.columns.find(c => c.name === 'transactionnumber')?.value || null,
//                             record.columns.find(c => c.name === 'number')?.value || null,
//                             record.columns.find(c => c.name === 'datecreated')?.value || null,
//                             record.columns.find(c => c.name === 'account')?.value || null,
//                             record.columns.find(c => c.name === 'memomain')?.value || null,
//                             record.columns.find(c => c.name === 'memo')?.value || null,
//                             record.columns.find(c => c.name === 'line.memo')?.value || null,
//                             record.columns.find(c => c.name === 'mainname')?.value || null,
//                             record.columns.find(c => c.name === 'entity')?.value || null,
//                             parseFloat(record.columns.find(c => c.name === 'formulacurrency')?.value) || 0,
//                             parseFloat(record.columns.find(c => c.name === 'debitamount')?.value) || 0,
//                             parseFloat(record.columns.find(c => c.name === 'creditamount')?.value) || 0,
//                             parseFloat(record.columns.find(c => c.name === 'exchangerate')?.value) || 0,
//                             record.columns.find(c => c.name === 'currency')?.value || null,
//                             parseFloat(record.columns.find(c => c.name === 'formulanumeric')?.value) || 0,
//                             parseFloat(record.columns.find(c => c.name === 'debitfxamount')?.value) || 0,
//                             parseFloat(record.columns.find(c => c.name === 'creditfxamount')?.value) || 0,
//                             record.columns.find(c => c.name === 'invoicenum')?.value || null,
//                             record.columns.find(c => c.name === 'department')?.value || null,
//                             record.columns.find(c => c.name === 'location')?.value || null,
//                             record.columns.find(c => c.name === 'class')?.value || null,
//                             record.columns.find(c => c.name === 'cseg_sorigin_state')?.value || null,
//                             record.columns.find(c => c.name === 'cseg_exp_type')?.value || null,
//                             record.columns.find(c => c.name === 'cseg1')?.value || null,
//                             record.columns.find(c => c.name === 'custbody_proj_id')?.value || null,
//                             record.columns.find(c => c.name === 'cseg4')?.value || null,
//                             record.columns.find(c => c.name === 'createdby')?.value || null,
//                             record.columns.find(c => c.name === 'statusref')?.value || null,
//                             record.columns.find(c => c.name === 'custbody_bs_sg_po_ref_number')?.value || null,
//                         ],
//                     };
//                 });

//                 // Execute batch insert queries
//                 for (const query of insertQueries) {
//                     await client.query(query.text, query.values);
//                 }
//                 console.log(`Inserted batch of ${batch.length} rows`);
//             }

//             await client.query('COMMIT'); // Commit transaction
//             res.json({ message: 'Data saved successfully', rowsProcessed: results.length });
//         } catch (error) {
//             await client.query('ROLLBACK'); // Rollback transaction on error
//             console.error('Transaction failed:', error.message);
//             res.status(500).json({ error: 'Failed to save data' });
//         } finally {
//             client.release();
//         }
//     } catch (err) {
//         console.error('Error fetching data:', err.response?.data || err.message);
//         res.status(500).json({ error: 'Failed to fetch data' });
//     }
// });

app.get('/', (req, res) => {
    res.send('NetSuite API Server is running');
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});