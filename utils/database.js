const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');


const mongoURI = "mongodb://localhost:27017/drafting";


const mongoClient = new MongoClient(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));


let database

const connectToDatabase = async () => {
  try {
    await mongoClient.connect();
    console.log("Connected to MongoDB (Native Client)");
    database = mongoClient.db("drafting");
  } catch (error) {
    console.error("MongoDB connection error (Native Client):", error);
    throw new Error('Database connection failed');
  }
};


const getDatabase = () => {
  if (!database) {
    throw new Error('Database not initialized');
  }
  return database;
};

module.exports = {
  connectToDatabase,
  getDatabase

};
