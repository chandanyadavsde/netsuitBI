const {client, Client}= require("pg")

const client = new Client({
    user : "postgres",
    host :"datacoldb.cv6o0ks4o45p.ap-south-1.rds.amazonaws.com",
    database:"database_dc",
    password:"Chandan#95",
    port:5432

})
client.connect()
.then(()=>{
    console.log("connected to the db")
})
.catch(()=>{
    console.log("cannot connect to the pg")
})