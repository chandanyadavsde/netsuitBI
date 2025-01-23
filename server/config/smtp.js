require("dotenv").config();

const smtp_port=process.env.smtp_port
const smtp_user= process.env.smtp_user
const smtp_pass=process.env.smtp_pass
const smtp_from=process.env.smtp_from
const smtp_to = process.env.smtp_to

module.exports={smtp_port,smtp_user,smtp_pass,smtp_from,smtp_to}
