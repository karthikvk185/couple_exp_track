import React, { useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Panel } from "primereact/panel";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const TransactionList = ({ transactions }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCategoryBudget, setShowCategoryBudget] = useState(false);

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

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 8 }}>
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
                <span style={{ color: '#43a047' }}>₹{transaction.amount}</span>
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
    </div>
  );
};

export default TransactionList;