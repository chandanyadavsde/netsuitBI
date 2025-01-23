const axios = require('axios');
const pool = require('../config/db');
const createNetsuiteAuthHeaders = require('../config/customAuth');

const consumer_key = process.env.NETSUITE_CONSUMER_KEY;
const consumer_secret_key = process.env.NETSUITE_CONSUMER_SECRET;
const token_id = process.env.NETSUITE_TOKEN_ID;
const token_secret = process.env.NETSUITE_TOKEN_SECRET;
const realm = process.env.REALM;
const netsuit_uri = process.env.NETSUIT_URI;
const uri4541 = process.env.URI_4541;

// Constants
const BATCH_SIZE = 999;

// Controller for /savedsearch route
const fetchAndSaveSavedSearch4541 = async (req, res) => {
    try {
        // Generate headers
        const headers = createNetsuiteAuthHeaders(
            consumer_key,
            consumer_secret_key,
            token_id,
            token_secret,
            uri4541,
            realm
        );

        // Fetch data from Netsuite
        const response = await axios.get(uri4541, { headers });
        const results = response.data;

        const client = await pool.connect();
        try {
            await client.query('BEGIN'); // Start transaction

            // Clear the database table
            await client.query('DELETE FROM db4541');
            console.log('Cleared existing data from db4541');

            // Process data in batches
            for (let i = 0; i < results.length; i += BATCH_SIZE) {
                const batch = results.slice(i, i + BATCH_SIZE);

                const insertQueries = batch.map((record) => {
                    let row = {
                        vendor_number: null,
                        vendor_name: null,
                        subsidiary: null,
                        formula_currency: [null, null, null, null],
                    };

                    record.columns.forEach((column) => {
                        const key = column.label.replace(/\s+/g, '_').toLowerCase();

                        if (key === 'vendor_number') row.vendor_number = column.value;
                        else if (key === 'vendor_name') row.vendor_name = column.value;
                        else if (key === 'subsidiary') row.subsidiary = column.value;
                        else if (key === 'formula_(currency)') {
                            // Map formula_currency values to respective indices
                            const index = row.formula_currency.findIndex((val) => val === null);
                            if (index !== -1) {
                                row.formula_currency[index] = parseFloat(column.value) || 0;
                            }
                        }
                    });

                    return {
                        text: `
                            INSERT INTO db4541 (
                                vendor_number, vendor_name, subsidiary,
                                formula_currency_1, formula_currency_2, formula_currency_3, formula_currency_4
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                        `,
                        values: [
                            row.vendor_number || null,
                            row.vendor_name || null,
                            row.subsidiary || null,
                            row.formula_currency[0],
                            row.formula_currency[1],
                            row.formula_currency[2],
                            row.formula_currency[3],
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

module.exports = { fetchAndSaveSavedSearch4541 };
