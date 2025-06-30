import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Panel } from "primereact/panel";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
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

const TransactionList = ({ transactions, user }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCategoryBudget, setShowCategoryBudget] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, transaction: null, idx: null });
  const [editAmount, setEditAmount] = useState(0);
  const [editCategory, setEditCategory] = useState("");
  const [editRemarks, setEditRemarks] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const toast = useRef(null);

  const currentMonthName = currentMonth.toLocaleString("default", { month: "long" });
  const currentYear = currentMonth.getFullYear();

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === currentMonth.getMonth() &&
      transactionDate.getFullYear() === currentMonth.getFullYear()
    );
  });

  const groupedTransactions = filteredTransactions.reduce((acc, transaction) => {
    const { date } = transaction;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {});

  const totalSpend = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const categorySpend = filteredTransactions.reduce((acc, transaction) => {
    const { category, amount } = transaction;
    acc[category] = (acc[category] || 0) + amount;
    return acc;
  }, {});

  // Calculate total spent by user (if user info exists)
  const userTotal = user
    ? filteredTransactions.filter(t => t.user === user).reduce((sum, t) => sum + t.amount, 0)
    : null;
  // Calculate total spent by the other user
  const otherUser = user === "kpalan551" ? "ramas2025" : user === "ramas2025" ? "kpalan551" : null;
  const otherUserTotal = otherUser
    ? filteredTransactions.filter(t => t.user === otherUser).reduce((sum, t) => sum + t.amount, 0)
    : null;

  const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  const hasPreviousMonthData = transactions.some((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === previousMonth.getMonth() &&
      transactionDate.getFullYear() === previousMonth.getFullYear()
    );
  });

  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  const hasNextMonthData = transactions.some((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === nextMonth.getMonth() &&
      transactionDate.getFullYear() === nextMonth.getFullYear()
    );
  });

  const handlePreviousMonth = () => {
    setCurrentMonth(previousMonth);
  };

  const handleNextMonth = () => {
    setCurrentMonth(nextMonth);
  };

  const toggleCategoryBudget = () => {
    setShowCategoryBudget((prev) => !prev);
  };

  useEffect(() => {
    setCategories(CATEGORY_OPTIONS);
  }, []);

  const openEdit = (transaction, idx) => {
    setEditModal({ open: true, transaction, idx });
    setEditAmount(transaction.amount);
    setEditCategory(transaction.category);
    setEditRemarks(transaction.remarks || "");
    setEditTags(transaction.tags ? transaction.tags.join(", ") : "");
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    const updated = {
      ...editModal.transaction,
      amount: editAmount,
      category: editCategory,
      remarks: editRemarks,
      tags: editTags.split(",").map(t => t.trim()).filter(Boolean),
    };
    try {
      const res = await fetch(`https://us-central1-exp-t-7a56d.cloudfunctions.net/api/transactions/${editModal.transaction._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      setEditLoading(false);
      setEditModal({ open: false, transaction: null, idx: null });
      if (res.ok) {
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Transaction updated', life: 2000 });
        window.location.reload();
      } else {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to update transaction', life: 3000 });
      }
    } catch {
      setEditLoading(false);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to update transaction', life: 3000 });
    }
  };

  // Add delete handler
  const handleDeleteTransaction = async (transaction) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      const res = await fetch(`https://us-central1-exp-t-7a56d.cloudfunctions.net/api/transactions/${transaction._id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Transaction deleted', life: 2000 });
        window.location.reload();
      } else {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete transaction', life: 3000 });
      }
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete transaction', life: 3000 });
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 8 }}>
      <Toast ref={toast} position="top-center" />
      {/* Month Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
        <Button icon="pi pi-angle-left" className="p-button-text" onClick={handlePreviousMonth} disabled={!hasPreviousMonthData} style={{ fontSize: 18 }} />
        <span style={{ fontWeight: 600, fontSize: 18, margin: "0 16px" }}>{currentMonthName} {currentYear}</span>
        <Button icon="pi pi-angle-right" className="p-button-text" onClick={handleNextMonth} disabled={!hasNextMonthData} style={{ fontSize: 18 }} />
      </div>
      {/* Spend Summary */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: 14, color: '#888' }}>Total Spend</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#2196F3' }}>₹{totalSpend}</div>
          {user && (
            <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
              Your Total: <span style={{ color: '#43a047', fontWeight: 600 }}>₹{userTotal}</span>
              {otherUser && (
                <span style={{ marginLeft: 12 }}>
                  {otherUser === "kpalan551" ? "Karthik" : "Rama"} Total: <span style={{ color: '#f06292', fontWeight: 600 }}>₹{otherUserTotal}</span>
                </span>
              )}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <Button icon={showCategoryBudget ? "pi pi-chevron-up" : "pi pi-chevron-down"} className="p-button-text" onClick={toggleCategoryBudget} style={{ fontSize: 14, padding: 0, marginRight: 4 }} />
          <span style={{ fontSize: 14, color: '#888' }}>Category Spend</span>
        </div>
      </div>
      {showCategoryBudget && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          {Object.keys(categorySpend).map((category) => (
            <div key={category} style={{ background: '#f1f3f6', borderRadius: 8, padding: '4px 10px', fontSize: 13, minWidth: 80, textAlign: 'center' }}>
              <span style={{ fontWeight: 600 }}>{category}</span><br />
              <span style={{ color: '#2196F3', fontWeight: 700 }}>₹{categorySpend[category]}</span>
            </div>
          ))}
        </div>
      )}
      {/* Transactions */}
      {Object.keys(groupedTransactions).length === 0 && (
        <div style={{ textAlign: "center", color: '#888', marginTop: 32 }}>No transactions for this month</div>
      )}
      {Object.keys(groupedTransactions).map((date) => (
        <div key={date} style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: '#555', margin: '12px 0 6px 0' }}>{date}</div>
          {groupedTransactions[date].map((transaction, idx) => (
            <Card key={idx} style={{ marginBottom: 8, borderRadius: 10, boxShadow: '0 1px 4px #e0e0e0', padding: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 16, fontWeight: 600 }}>
                <span style={{ color: '#43a047', display: 'flex', alignItems: 'center' }}>₹{transaction.amount}
                  <Button icon="pi pi-pencil" className="p-button-text p-button-sm" style={{ marginLeft: 6 }} onClick={() => openEdit(transaction, idx)} />
                </span>
                <Tag value={transaction.category} severity="success" style={{ fontSize: 13, borderRadius: 6, padding: '2px 8px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, marginTop: 2 }}>
                <span style={{ color: '#888', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{transaction.remarks || "No remarks"}</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {transaction.tags && transaction.tags.length > 0 ? (
                    transaction.tags.map((tag, i) => (
                      <Tag key={i} value={tag} severity="info" style={{ fontSize: 12, borderRadius: 6, padding: '1px 6px' }} />
                    ))
                  ) : (
                    <Tag value="No tags" severity="warning" style={{ fontSize: 12, borderRadius: 6, padding: '1px 6px' }} />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ))}
      <Dialog header="Edit Transaction" visible={editModal.open} style={{ width: '90vw', maxWidth: 340 }} onHide={() => setEditModal({ open: false, transaction: null, idx: null })}>
        <div className="p-fluid">
          <div className="p-field">
            <label>Amount</label>
            <InputNumber value={editAmount} onValueChange={e => setEditAmount(e.value)} mode="decimal" min={0} style={{ width: '100%' }} />
          </div>
          <div className="p-field">
            <label>Category</label>
            <Dropdown value={editCategory} options={categories} onChange={e => setEditCategory(e.value)} placeholder="Select category" style={{ width: '100%' }} />
          </div>
          <div className="p-field">
            <label>Remarks</label>
            <InputText value={editRemarks} onChange={e => setEditRemarks(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div className="p-field">
            <label>Tags (comma separated)</label>
            <InputText value={editTags} onChange={e => setEditTags(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Button label="Save" icon="pi pi-check" onClick={handleEditSave} loading={editLoading} className="p-button-success" style={{ flex: 1 }} />
            <Button icon="pi pi-trash" className="p-button-danger" style={{ minWidth: 40 }} onClick={() => handleDeleteTransaction(editModal.transaction)} aria-label="Delete" />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default TransactionList;