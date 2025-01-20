const pool = require('../config/db');

async function clearSavedSearchData() {
    await pool.query('DELETE FROM dbA');
}

async function insertSavedSearchData(batch) {
    const insertQueries = batch.map(record => ({
        text: `
            INSERT INTO dbA (
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
            // Add the rest of the fields similarly
        ],
    }));

    for (const query of insertQueries) {
        await pool.query(query.text, query.values);
    }
}

module.exports = { clearSavedSearchData, insertSavedSearchData };
