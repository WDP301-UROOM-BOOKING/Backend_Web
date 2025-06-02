
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const dbConnecion = async () =>{
    console.log(process.env.ENVIRONMENT == "development" ? process.env.MONGODB_URI_DEVELOPMENT : process.env.MONGODB_URI_PRODUCTION)
    try{
        const db = await mongoose.connect(process.env.ENVIRONMENT == "development" ? process.env.MONGODB_URI_DEVELOPMENT : process.env.MONGODB_URI_PRODUCTION, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`Connected to MongoDB: ${db.connection.host}`);
    } catch(error){
        console.error(`Error connecting to MongoDB: ${error.message}`);
    }
}

module.exports = dbConnecion;
