const axios = require('axios');
const pool = require('../config/db');
const createNetsuiteAuthHeaders = require('../config/customAuth');

const consumer_key= process.env.NETSUITE_CONSUMER_KEY
const consumer_secret_key=process.env.NETSUITE_CONSUMER_SECRET
const token_id= process.env.NETSUITE_TOKEN_ID
const token_secret= process.env.NETSUITE_TOKEN_SECRET
const realm= process.env.REALM
const netsuit_uri=process.env.NETSUIT_URI
// Constants
const BATCH_SIZE = 999;

// Controller for /savedsearch route
const fetchAndSaveSavedSearch4705 = async (req, res) => {
    try {
        // Generate headers
        const headers = createNetsuiteAuthHeaders(
         consumer_key,consumer_secret_key,token_id,token_secret,netsuit_uri,realm
        );

        // Fetch data from Netsuite
        const response = await axios.get(netsuit_uri, { headers });
        const results = response.data;

        const client = await pool.connect();
        try {
            await client.query('BEGIN'); // Start transaction

            // Clear the database table
            await client.query('DELETE FROM db4705');
            console.log('Cleared existing data from db4705');

            // Process data in batches
            for (let i = 0; i < results.length; i += BATCH_SIZE) {
                const batch = results.slice(i, i + BATCH_SIZE);

                const insertQueries = batch.map(record => {
                    return {
                        text: `
                            INSERT INTO db4705 (
                                internal_id, posting_date, document_type, subsidiary, vendor_doc_date,
                                external_document_no, transaction_number, document_number, entry_date,
                                gl_account_no, gl_account_name, narration, narration_line_level,
                                main_line_name, name, amount, amount_debit, amount_credit, exchange_rate,
                                currency, amount_foreign_currency, debit_fx_amount, credit_fx_amount,
                                invoice_number, department, location, ba_code, states_2, expense_type,
                                prid_location, project_id_code, business_type, user_id, status, purchase_order
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
                                      $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
                                      $31, $32, $33, $34, $35)
                        `,
                        values: [
                            record.id,
                            record.columns.find(c => c.name === 'trandate')?.value || null,
                            record.columns.find(c => c.name === 'type')?.value || null,
                            record.columns.find(c => c.name === 'subsidiarynohierarchy')?.value || null,
                            record.columns.find(c => c.name === 'custbody_doc_date')?.value || null,
                            record.columns.find(c => c.name === 'custbody_external_doc_no')?.value || null,
                            record.columns.find(c => c.name === 'transactionnumber')?.value || null,
                            record.columns.find(c => c.name === 'number')?.value || null,
                            record.columns.find(c => c.name === 'datecreated')?.value || null,
                            record.columns.find(c => c.name === 'account')?.text || null,
                            record.columns.find(c => c.name === 'memomain')?.text || null,
                            record.columns.find(c => c.name === 'memo')?.text || null,
                            record.columns.find(c => c.name === 'line.memo')?.text || null,
                            record.columns.find(c => c.name === 'mainname')?.text || null,
                            record.columns.find(c => c.name === 'entity')?.text || null,
                            parseFloat(record.columns.find(c => c.name === 'formulacurrency')?.value) || 0,
                            parseFloat(record.columns.find(c => c.name === 'debitamount')?.value) || 0,
                            parseFloat(record.columns.find(c => c.name === 'creditamount')?.value) || 0,
                            parseFloat(record.columns.find(c => c.name === 'exchangerate')?.value) || 0,
                            record.columns.find(c => c.name === 'currency')?.text || null,
                            parseFloat(record.columns.find(c => c.name === 'formulanumeric')?.value) || 0,
                            parseFloat(record.columns.find(c => c.name === 'debitfxamount')?.value) || 0,
                            parseFloat(record.columns.find(c => c.name === 'creditfxamount')?.value) || 0,
                            record.columns.find(c => c.name === 'invoicenum')?.value || null,
                            record.columns.find(c => c.name === 'department')?.text || null,
                            record.columns.find(c => c.name === 'location')?.text || null,
                            record.columns.find(c => c.name === 'class')?.text || null,
                            record.columns.find(c => c.name === 'cseg_sorigin_state')?.text || null,
                            record.columns.find(c => c.name === 'cseg_exp_type')?.text || null,
                            record.columns.find(c => c.name === 'cseg1')?.text || null,
                            record.columns.find(c => c.name === 'custbody_proj_id')?.text || null,
                            record.columns.find(c => c.name === 'cseg4')?.value || null,
                            record.columns.find(c => c.name === 'createdby')?.text || null,
                            record.columns.find(c => c.name === 'statusref')?.text || null,
                            record.columns.find(c => c.name === 'custbody_bs_sg_po_ref_number')?.value || null,
                        ],
                    };
                });

                // Execute batch insert queries
                for (const query of insertQueries) {
                    await client.query(query.text, query.values);
                }
                console.log(`Inserted batch of ${batch.length} rows`);
            }

            await client.query('COMMIT'); // Commit transaction
            res.json({ message: 'Data saved successfully', rowsProcessed: results.length });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Transaction failed:', error.message);
            res.status(500).json({ error: 'Failed to save data' });
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error fetching data:', err.message);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
};

module.exports = { fetchAndSaveSavedSearch4705 };
