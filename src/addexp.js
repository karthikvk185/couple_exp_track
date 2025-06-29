import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
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

const AddExpense = ({ user }) => {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());
  const [category, setCategory] = useState("");
  const [remarks, setRemarks] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setCategories(CATEGORY_OPTIONS);
    setLoading(false);
  }, []);

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !category) return;
    fetch("https://us-central1-exp-t-7a56d.cloudfunctions.net/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(amount),
        date: date.toISOString().split("T")[0],
        category,
        remarks,
        tags,
        user: user || undefined,
      }),
    }).then(() => {
      setSuccess(true);
      setAmount("");
      setDate(new Date());
      setCategory("");
      setRemarks("");
      setTags([]);
      setTimeout(() => setSuccess(false), 2000);
    });
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 8 }}>
      <Card title="Add Expense" style={{ borderRadius: 10, boxShadow: '0 1px 4px #e0e0e0', marginBottom: 16 }}>
        <form onSubmit={handleSubmit}>
          <div className="p-field" style={{ marginBottom: 12 }}>
            <label>Amount</label>
            <InputNumber value={amount} onValueChange={(e) => setAmount(e.value)} mode="decimal" min={0} style={{ width: '100%' }} required />
          </div>
          <div className="p-field" style={{ marginBottom: 12 }}>
            <label>Date</label>
            <Calendar value={date} onChange={(e) => setDate(e.value)} dateFormat="yy-mm-dd" showIcon style={{ width: '100%' }} required />
          </div>
          <div className="p-field" style={{ marginBottom: 12 }}>
            <label>Category</label>
            <Dropdown value={category} options={categories} onChange={(e) => setCategory(e.value)} placeholder="Select category" style={{ width: '100%' }} required />
          </div>
          <div className="p-field" style={{ marginBottom: 12 }}>
            <label>Remarks</label>
            <InputText value={remarks} onChange={(e) => setRemarks(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div className="p-field" style={{ marginBottom: 12 }}>
            <label>Tags</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              {tags.map((tag, idx) => (
                <Tag key={idx} value={tag} severity="info" />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <InputText value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' ? (e.preventDefault(), handleAddTag()) : null} placeholder="Add a tag" style={{ flex: 1 }} />
              <Button icon="pi pi-plus" type="button" onClick={handleAddTag} className="p-button-info" />
            </div>
          </div>
          <Button label="Submit" icon="pi pi-check" type="submit" className="p-button-success" style={{ width: '100%' }} />
          {success && <div style={{ color: '#43a047', marginTop: 10, textAlign: 'center' }}>Expense added!</div>}
        </form>
      </Card>
    </div>
  );
};

export default AddExpense;