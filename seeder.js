/* mySeedScript.js */

// require the necessary libraries
const faker = require("faker");
const MongoClient = require("mongodb").MongoClient;

function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

async function seedDB() {
    // Connection URL
    const uri = "mongodb+srv://DState-admin:3LwG9LWa2sUCEDZP@cluster0.cbsn2.mongodb.net/dstate?retryWrites=true&w=majority";

    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        // useUnifiedTopology: true,
    });

    try {
        await client.connect();
        console.log("Connected correctly to server");

        const collection = client.db("dstate").collection("users");

        // The drop() command destroys all data from a collection.
        // Make sure you run it against proper database and collection.
        await collection.drop();

        const user ={
            userName:"Admin",
            email: "admin@dstate.com",
            publicAddress: "0x465c43f2ac9fbae3295244a5f7503e65eec24fa0",
            role:"admin"
        }
        await collection.insertOne(user);

        console.log("Database seeded! :)");
        await client.close();
    } catch (err) {
        console.log(err.stack);
    }
}

seedDB();
