import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import AddExpense from "./addexp";
import TransactionList from "./TransactionList";
import Budget from "./Budget";
import { Button } from "primereact/button";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./App.css";

const USERS = [
  { username: "kpalan551", password: "10429123" },
  { username: "ramas2025", password: "2025rama" },
];

function Navbar({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const showBack = location.pathname !== "/" && location.pathname !== "/login";
  return (
    <div className="navbar-cet">
      {showBack ? (
        <Button icon="pi pi-arrow-left" className="p-button-text p-button-lg" onClick={() => navigate(-1)} style={{ color: '#fff', fontSize: 22, marginRight: 8 }} aria-label="Back" />
      ) : <span style={{ width: 44, display: 'inline-block' }} />} {/* placeholder for alignment */}
      <span className="navbar-title">Couple Expense Tracker</span>
      {user ? (
        <Button icon="pi pi-sign-out" className="p-button-text" style={{ color: '#fff', fontSize: 22, marginLeft: 8 }} onClick={onLogout} aria-label="Logout" />
      ) : <span style={{ width: 44, display: 'inline-block' }} />} {/* right placeholder */}
    </div>
  );
}

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = USERS.find(u => u.username === username && u.password === password);
    if (user) {
      onLogin(user.username);
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div style={{ maxWidth: 340, margin: "40px auto", padding: 24 }}>
      <h3 style={{ textAlign: "center", marginBottom: 24 }}>Login</h3>
      <form onSubmit={handleSubmit}>
        <div className="p-field" style={{ marginBottom: 16 }}>
          <input className="p-inputtext" style={{ width: '100%' }} placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div className="p-field" style={{ marginBottom: 16 }}>
          <input className="p-inputtext" style={{ width: '100%' }} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        {error && <div style={{ color: '#d32f2f', marginBottom: 12 }}>{error}</div>}
        <Button label="Login" icon="pi pi-sign-in" type="submit" style={{ width: '100%' }} />
      </form>
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

function PrivateRoute({ user, children }) {
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(() => localStorage.getItem("cet_user") || "");

  useEffect(() => {
    if (!user) return;
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
  }, [user]);

  const handleLogin = (username) => {
    setUser(username);
    localStorage.setItem("cet_user", username);
    window.location.href = "/"; // Always navigate to dashboard after login
  };
  const handleLogout = () => {
    setUser("");
    localStorage.removeItem("cet_user");
  };

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/" element={<PrivateRoute user={user}><Dashboard /></PrivateRoute>} />
          <Route path="/add_expense" element={<PrivateRoute user={user}><AddExpense user={user} /></PrivateRoute>} />
          <Route path="/transactions" element={
            <PrivateRoute user={user}>
              {loading ? <div>Loading...</div> : error ? <div>Error: {error}</div> : <TransactionList transactions={transactions} user={user} />}
            </PrivateRoute>
          } />
          <Route path="/budget" element={<PrivateRoute user={user}><Budget /></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;