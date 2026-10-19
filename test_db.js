const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}
require('dotenv').config();
const mongoose = require('mongoose');
const uri = process.env.MONGO_URI || "mongodb+srv://siddheshtelecomdigital_db_user:67ZvqB5wrmGLMd0S@siddhesh.k7kbxem.mongodb.net/shree_ganesha?retryWrites=true&w=majority";

mongoose.connect(uri)
    .then(() => {
        console.log("Connected to MongoDB Atlas!");
        process.exit(0);
    })
    .catch(err => {
        console.error("Connection error:", err);
        process.exit(1);
    });
