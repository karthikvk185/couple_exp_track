import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { ProgressBar } from "primereact/progressbar";
import { Toast } from "primereact/toast";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const CATEGORY_OPTIONS = [
  "Food",
  "Tour",
  "Parking",
  "Shopping",
  "Online",
  "Other",
  "Travel"
];

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newBudget, setNewBudget] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categorySpend, setCategorySpend] = useState({});
  const [editIdx, setEditIdx] = useState(null);
  const toast = useRef(null);

  useEffect(() => {
    // Fetch budgets
    fetch("https://us-central1-exp-t-7a56d.cloudfunctions.net/api/budgets")
      .then((response) => response.json())
      .then((budgetsData) => {
        // Only keep streamlined categories, fill missing with default
        const defaultBudgets = CATEGORY_OPTIONS.map(cat => {
          const found = budgetsData.find(b => b.name && b.name.toLowerCase() === cat.toLowerCase());
          return found || { name: cat, budget: 0 };
        });
        setBudgets(defaultBudgets);
        setLoading(false);
        // Fetch transactions for the current month
        fetch("https://us-central1-exp-t-7a56d.cloudfunctions.net/api/transactions")
          .then((response) => response.json())
          .then((transactions) => {
            // Calculate spend per category for the current month (case-insensitive)
            const now = new Date();
            const month = now.getMonth();
            const year = now.getFullYear();
            const spend = {};
            transactions.forEach((t) => {
              const d = new Date(t.date);
              if (d.getMonth() === month && d.getFullYear() === year) {
                const cat = t.category && typeof t.category === 'string' ? t.category.toLowerCase() : '';
                spend[cat] = (spend[cat] || 0) + t.amount;
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

  const handleSave = () => {
    saveBudgetsToBackend(budgets);
  };

  const saveBudgetsToBackend = (updatedBudgets) => {
    fetch("https://us-central1-exp-t-7a56d.cloudfunctions.net/api/save_budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedBudgets),
    })
      .then((res) => {
        if (res.ok) {
          toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Budgets updated', life: 2000 });
        } else {
          toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to update budgets', life: 3000 });
        }
      })
      .catch(() => {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to update budgets', life: 3000 });
      });
  };

  // Add delete handler
  const handleDelete = (index) => {
    const updatedBudgets = budgets.filter((_, i) => i !== index);
    setBudgets(updatedBudgets);
    setEditIdx(null);
    saveBudgetsToBackend(updatedBudgets);
    toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Budget deleted', life: 2000 });
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 8 }}>
      <Toast ref={toast} position="top-center" />
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
          flexDirection: "column",
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
            const isEditing = editIdx === idx;
            return (
              <Card
                key={budget.name}
                style={{ borderRadius: 10, boxShadow: "0 1px 4px #e0e0e0", padding: '5px 0', margin: 0, maxWidth: 440 }}
              >
                {/* First row: category name (left), progress bar + percent (right) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>
                    {typeof budget.name === 'string' ? budget.name.charAt(0).toUpperCase() + budget.name.slice(1) : ''}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
                    <ProgressBar value={percent} showValue={false} style={{ height: 8, borderRadius: 6, width: 70 }} color={percent >= 100 ? '#d32f2f' : '#43a047'} />
                    <span style={{ fontSize: 12, color: percent >= 100 ? '#d32f2f' : '#888', minWidth: 32, textAlign: 'right' }}>{percent}%</span>
                  </div>
                </div>
                {/* Second row: spent (left), budget (right) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isEditing ? 0 : 2 }}>
                  <div style={{ fontSize: 13 }}>
                    Spent: <span style={{ fontWeight: 600, color: percent >= 100 ? '#d32f2f' : '#43a047' }}>₹{spent}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {!isEditing ? (
                      <>
                        <span style={{ fontWeight: 600 }}>₹{budget.budget}</span>
                        <Button icon="pi pi-pencil" className="p-button-text p-button-sm" onClick={() => setEditIdx(idx)} style={{ marginLeft: 4 }} aria-label="Edit" />
                      </>
                    ) : null}
                  </div>
                </div>
                {/* Edit row: only if editing */}
                {isEditing && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, justifyContent: 'flex-end' }}>
                    <InputNumber value={budget.budget} onValueChange={(e) => handleBudgetChange(idx, e.value)} mode="decimal" min={0} style={{ width: 80 }} autoFocus />
                    <Button icon="pi pi-check" className="p-button-success p-button-sm" onClick={() => { handleSave(); setEditIdx(null); }} style={{ minWidth: 32, padding: '4px 8px' }} aria-label="Save" />
                    <Button icon="pi pi-times" className="p-button-text p-button-sm" onClick={() => setEditIdx(null)} style={{ minWidth: 32, padding: '4px 8px' }} aria-label="Cancel" />
                    <Button icon="pi pi-trash" className="p-button-danger p-button-sm" onClick={() => handleDelete(idx)} style={{ minWidth: 32, padding: '4px 8px' }} aria-label="Delete" />
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
      
    </div>
  );
};

export default Budget;