// Run this script with: node src/seed_budgets.js
const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://karthikrama:ramakarthik2025@cluster0.vy3r3ce.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

const budgets = [
  { name: "food", budget: 1000 },
  { name: "parking", budget: 500 },
  { name: "shopping", budget: 1500 },
  { name: "trip", budget: 2000 },
  { name: "other", budget: 300 }
];

async function seed() {
  try {
    await client.connect();
    const db = client.db("mydb");
    const collection = db.collection("budgets");
    await collection.deleteMany({}); // Optional: clear existing data
    await collection.insertMany(budgets);
    console.log("Budgets inserted successfully!");
  } catch (err) {
    console.error("Error inserting budgets:", err);
  } finally {
    await client.close();
  }
}

seed();
