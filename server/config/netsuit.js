require('dotenv').config(); // Keep this at the top

const consumer_key= process.env.NETSUITE_CONSUMER_KEY
const consumer_secret_key=process.env.NETSUITE_CONSUMER_SECRET
const token_id= process.env.NETSUITE_TOKEN_ID
const token_secret= process.env.NETSUITE_TOKEN_SECRET
const realm= process.env.REALM
const netsuit_uri=process.env.NETSUIT_URI


const NsApiWrapper = require('netsuite-rest');
const NsApi = new NsApiWrapper({
    consumer_key:consumer_key,
    consumer_secret_key:consumer_secret_key,
    token:token_id,
    token_secret:token_secret,
    realm:realm,
});

module.exports=NsApi