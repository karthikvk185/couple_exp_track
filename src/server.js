const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const functions = require("firebase-functions");
const app = express();

app.use(express.json());
app.use(cors());

// MongoDB connection string
// IMPORTANT: Replace with your actual password and ensure proper security for production.
const uri = "mongodb+srv://karthikrama:ramakarthik2025@cluster0.vy3r3ce.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

let budgetsCollection; // For budgets
let transactionsCollection; // For transactions

async function connectDB() {
  try {
    await client.connect();
    const db = client.db("mydb");
    budgetsCollection = db.collection("budgets"); // Store budgets in 'budgets' collection
    transactionsCollection = db.collection("transactions"); // Store transactions in 'transactions' collection
    console.log("Connected to MongoDB successfully!");
    app.listen(5000, () => {
      console.log("Server running on https://us-central1-exp-t-7a56d.cloudfunctions.net/api");
    });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
}

// Call the function to connect to the database and start the server
connectDB();


// --- Budgets Endpoints ---
// Get budgets
app.get("/budgets", async (req, res) => {
  try {
    const budgets = await budgetsCollection.find({}).toArray();
    res.status(200).json(budgets);
  } catch (err) {
    console.error("Error fetching budgets:", err);
    res.status(500).send("Error fetching budgets.");
  }
});

// Save budgets
app.post("/save_budgets", async (req, res) => {
  const budgets = req.body;
  try {
    await budgetsCollection.deleteMany({});
    await budgetsCollection.insertMany(budgets);
    res.status(200).send("Budgets saved successfully.");
  } catch (err) {
    console.error("Error saving budgets:", err);
    res.status(500).send("Error saving budgets.");
  }
});

// --- Transactions Endpoints ---
// Get all transactions
app.get("/transactions", async (req, res) => {
  try {
    const transactions = await transactionsCollection.find({}).toArray();
    res.status(200).json(transactions);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).send("Error fetching transactions.");
  }
});

// Add a new transaction
app.post("/transactions", async (req, res) => {
  try {
    const transaction = req.body;
    await transactionsCollection.insertOne(transaction);
    res.status(201).json({ message: "Transaction added successfully." });
  } catch (err) {
    console.error("Error adding transaction:", err);
    res.status(500).send("Error adding transaction.");
  }
});

// Update a transaction by ID
app.put("/transactions/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const update = req.body;
    delete update._id; // Prevent _id overwrite
    let result = { matchedCount: 0 };
    // Try ObjectId if possible
    if (/^[a-fA-F0-9]{24}$/.test(id)) {
      result = await transactionsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: update }
      );
    }
    // If not matched, try as string
    if (result.matchedCount === 0) {
      result = await transactionsCollection.updateOne(
        { _id: id },
        { $set: update }
      );
    }
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Transaction not found." });
    }
    res.status(200).json({ message: "Transaction updated successfully." });
  } catch (err) {
    console.error("Error updating transaction:", err);
    res.status(500).send("Error updating transaction.");
  }
});

exports.api = functions.https.onRequest(app);