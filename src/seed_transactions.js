// Run this script with: node src/seed_transactions.js
const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://karthikrama:ramakarthik2025@cluster0.vy3r3ce.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

const transactions = [
  { date: "2025-06-01", amount: 50, category: "Food" , remarks: "Lunch with friends", tags: ["friends", "lunch"] },
  { date: "2025-06-02", amount: 30, category: "Food", remarks: "Grocery shopping", tags: ["grocery"] },
  { date: "2025-06-03", amount: 100, category: "Shopping", remarks: "New shoes", tags: ["shoes", "shopping"] },
  { date: "2025-06-04", amount: 200, category: "Trip", remarks: "Weekend getaway", tags: ["trip", "weekend"] },
  { date: "2025-06-05", amount: 20, category: "Parking", remarks: "Parking fee", tags: ["parking"] },
  { date: "2025-06-06", amount: 150, category: "Food", remarks: "Dinner at restaurant", tags: ["dinner", "restaurant"] },
  { date: "2025-06-07", amount: 80, category: "Shopping", remarks: "Clothes shopping", tags: ["clothes", "shopping"] },
  { date: "2025-06-08", amount: 300, category: "Trip", remarks: "Flight tickets", tags: ["flight", "trip"] },
  { date: "2025-06-09", amount: 60, category: "Parking", remarks: "Parking at airport", tags: ["parking", "airport"] },
  { date: "2025-06-10", amount: 90, category: "Food", remarks: "Brunch with family", tags: ["brunch", "family"] },
  { date: "2025-06-01", amount: 20, category: "Parking" },
  { date: "2025-06-02", amount: 100, category: "Shopping" },
  { date: "2025-06-03", amount: 200, category: "Trip" },
  { date: "2025-04-01", amount: 50, category: "Food"  },
  { date: "2025-05-01", amount: 20, category: "Parking" },
  { date: "2025-05-02", amount: 100, category: "Shopping" },
  { date: "2025-05-03", amount: 200, category: "Trip" }
];

async function seed() {
  try {
    await client.connect();
    const db = client.db("mydb");
    const collection = db.collection("transactions");
    await collection.deleteMany({}); // Optional: clear existing data
    await collection.insertMany(transactions);
    console.log("Transactions inserted successfully!");
  } catch (err) {
    console.error("Error inserting transactions:", err);
  } finally {
    await client.close();
  }
}

seed();
