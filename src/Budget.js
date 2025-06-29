import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { ProgressBar } from "primereact/progressbar";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newBudget, setNewBudget] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categorySpend, setCategorySpend] = useState({});
  const [editIdx, setEditIdx] = useState(null);

  useEffect(() => {
    // Fetch budgets
    fetch("https://us-central1-exp-t-7a56d.cloudfunctions.net/api/budgets")
      .then((response) => response.json())
      .then((budgetsData) => {
        setBudgets(budgetsData);
        setLoading(false);
        // Fetch transactions for the current month
        fetch("https://us-central1-exp-t-7a56d.cloudfunctions.net/api/transactions")
          .then((response) => response.json())
          .then((transactions) => {
            // Calculate spend per category for the current month
            const now = new Date();
            const month = now.getMonth();
            const year = now.getFullYear();
            const spend = {};
            transactions.forEach((t) => {
              const d = new Date(t.date);
              if (d.getMonth() === month && d.getFullYear() === year) {
                spend[t.category] = (spend[t.category] || 0) + t.amount;
              }
            });
            setCategorySpend(spend);
          });
      })
      .catch((error) => setLoading(false));
  }, []);

  const handleBudgetChange = (index, value) => {
    const updatedBudgets = [...budgets];
    updatedBudgets[index].budget = value;
    setBudgets(updatedBudgets);
  };

  const handleAddCategory = () => {
    if (newCategory && newBudget) {
      const updatedBudgets = [
        ...budgets,
        { name: newCategory.toLowerCase(), budget: parseInt(newBudget, 10) },
      ];
      setBudgets(updatedBudgets);
      setNewCategory("");
      setNewBudget(0);
      setShowModal(false);
      saveBudgetsToBackend(updatedBudgets);
    }
  };

  const handleSave = () => {
    saveBudgetsToBackend(budgets);
  };

  const saveBudgetsToBackend = (updatedBudgets) => {
    fetch("https://us-central1-exp-t-7a56d.cloudfunctions.net/api/save_budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedBudgets),
    });
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 8 }}>
      <div
        style={{
          fontWeight: 600,
          fontSize: 18,
          textAlign: "center",
          marginBottom: 12,
        }}
      >
        Manage Budgets
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {loading ? (
          <span>Loading...</span>
        ) : (
          budgets.map((budget, idx) => {
            if (!budget || !budget.name) return null;
            const spent = categorySpend[budget.name] || 0;
            const percent = budget.budget > 0 ? Math.min(100, Math.round((spent / budget.budget) * 100)) : 0;
            return (
              <Card
                key={budget.name}
                style={{ minWidth: 120, flex: 1, borderRadius: 10, boxShadow: "0 1px 4px #e0e0e0", padding: 0 }}
              >
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                  {typeof budget.name === 'string' ? budget.name.charAt(0).toUpperCase() + budget.name.slice(1) : ''}
                </div>
                <div style={{ fontSize: 13, marginBottom: 4 }}>
                  Budget: <span style={{ fontWeight: 600 }}>₹{budget.budget}</span>
                </div>
                <div style={{ fontSize: 13, marginBottom: 4 }}>
                  Spent: <span style={{ fontWeight: 600, color: percent >= 100 ? '#d32f2f' : '#43a047' }}>₹{spent}</span>
                </div>
                <ProgressBar value={percent} showValue={false} style={{ height: 8, borderRadius: 6, marginBottom: 4 }} color={percent >= 100 ? '#d32f2f' : '#43a047'} />
                <div style={{ fontSize: 12, color: percent >= 100 ? '#d32f2f' : '#888' }}>{percent}% used</div>
                <Button icon="pi pi-pencil" className="p-button-text p-button-sm" style={{ marginTop: 8 }} onClick={() => setEditIdx(idx)} />
                {editIdx === idx && (
                  <div style={{ marginTop: 8 }}>
                    <InputNumber
                      value={budget.budget}
                      onValueChange={(e) => handleBudgetChange(idx, e.value)}
                      mode="decimal"
                      showButtons
                      min={0}
                      style={{ width: "100%" }}
                    />
                    <Button label="Save" icon="pi pi-save" className="p-button-success p-button-sm" style={{ marginTop: 4, width: '100%' }} onClick={handleSave} />
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Button
          label="Save"
          icon="pi pi-save"
          onClick={handleSave}
          className="p-button-success"
          style={{ flex: 1 }}
        />
        <Button
          label="Add Category"
          icon="pi pi-plus"
          onClick={() => setShowModal(true)}
          className="p-button-info"
          style={{ flex: 1 }}
        />
      </div>
      <Dialog
        header="Add New Category"
        visible={showModal}
        style={{ width: "90vw", maxWidth: 320 }}
        onHide={() => setShowModal(false)}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label>Category Name</label>
            <InputText
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          </div>
          <div className="p-field">
            <label>Budget</label>
            <InputNumber
              value={newBudget}
              onValueChange={(e) => setNewBudget(e.value)}
              mode="decimal"
              min={0}
            />
          </div>
          <Button
            label="Add"
            icon="pi pi-check"
            onClick={handleAddCategory}
            className="p-button-success"
            style={{ marginTop: 8 }}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default Budget;