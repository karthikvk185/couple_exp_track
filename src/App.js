import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useLocation, useNavigate } from "react-router-dom";
import AddExpense from "./addexp";
import TransactionList from "./TransactionList";
import Budget from "./Budget";
import { Button } from "primereact/button";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./App.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  // Show back button except on dashboard
  const showBack = location.pathname !== "/";
  return (
    <div className="navbar-cet">
      {showBack ? (
        <Button icon="pi pi-arrow-left" className="p-button-text p-button-lg" onClick={() => navigate(-1)} style={{ color: '#fff', fontSize: 22, marginRight: 8 }} aria-label="Back" />
      ) : <span style={{ width: 44, display: 'inline-block' }} />} {/* placeholder for alignment */}
      <span className="navbar-title">Couple Expense Tracker</span>
      <span style={{ width: 44, display: 'inline-block' }} /> {/* right placeholder */}
    </div>
  );
}

function Dashboard() {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 24, textAlign: "center" }}>
      <h2 style={{ marginBottom: 32 }}>Expense Tracker Dashboard</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Link to="/add_expense">
          <Button label="Add Expense" icon="pi pi-plus-circle" className="p-button-lg p-button-info" style={{ width: "100%" }} />
        </Link>
        <Link to="/transactions">
          <Button label="View Transactions" icon="pi pi-list" className="p-button-lg p-button-success" style={{ width: "100%" }} />
        </Link>
        <Link to="/budget">
          <Button label="View Budgets" icon="pi pi-wallet" className="p-button-lg p-button-warning" style={{ width: "100%" }} />
        </Link>
      </div>
    </div>
  );
}

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/transactions")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch transactions");
        return res.json();
      })
      .then((data) => {
        setTransactions(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add_expense" element={<AddExpense />} />
          <Route path="/transactions" element={
            loading ? <div>Loading...</div> : error ? <div>Error: {error}</div> : <TransactionList transactions={transactions} />
          } />
          <Route path="/budget" element={<Budget />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;