import { useState, useMemo } from "react";

const MEMBERS = ["Kevin", "Sagar", "Ranvir", "Harshit", "Amitabh", "Cousin M", "Cousin F", "Priya", "Anmol"];

const AVATARS = {
  Kevin: "KV", Sagar: "SG", Ranvir: "RV", Harshit: "HS",
  Amitabh: "AM", "Cousin M": "CM", "Cousin F": "CF", Priya: "PR", Anmol: "AN"
};

const COLORS = [
  "#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF922B",
  "#CC5DE8","#F06595","#20C997","#74C0FC"
];

function getMemberColor(name) {
  return COLORS[MEMBERS.indexOf(name) % COLORS.length];
}

export default function App() {
  const [tab, setTab] = useState("add");
  const [expenses, setExpenses] = useState([]);

  const [form, setForm] = useState({
    name: "",
    amount: "",
    paidBy: MEMBERS[0],
    splitAmong: [...MEMBERS],
  });

  const [error, setError] = useState("");

  const balances = useMemo(() => {
    const bal = {};
    MEMBERS.forEach(m => bal[m] = 0);
    expenses.forEach(exp => {
      const share = exp.amount / exp.splitAmong.length;
      exp.splitAmong.forEach(m => { bal[m] -= share; });
      bal[exp.paidBy] += exp.amount;
    });
    return bal;
  }, [expenses]);

  const settlements = useMemo(() => {
    const b = { ...balances };
    const result = [];
    const creditors = Object.entries(b).filter(([, v]) => v > 0.01).sort((a, b) => b[1] - a[1]);
    const debtors = Object.entries(b).filter(([, v]) => v < -0.01).sort((a, b) => a[1] - b[1]);
    const c = creditors.map(([n, v]) => ({ name: n, amt: v }));
    const d = debtors.map(([n, v]) => ({ name: n, amt: -v }));
    let ci = 0, di = 0;
    while (ci < c.length && di < d.length) {
      const pay = Math.min(c[ci].amt, d[di].amt);
      if (pay > 0.01) result.push({ from: d[di].name, to: c[ci].name, amount: pay });
      c[ci].amt -= pay;
      d[di].amt -= pay;
      if (c[ci].amt < 0.01) ci++;
      if (d[di].amt < 0.01) di++;
    }
    return result;
  }, [balances]);

  const toggleMember = (m) => {
    setForm(f => ({
      ...f,
      splitAmong: f.splitAmong.includes(m)
        ? f.splitAmong.filter(x => x !== m)
        : [...f.splitAmong, m]
    }));
  };

  const handleAdd = () => {
    if (!form.name.trim()) return setError("Expense name is required.");
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) return setError("Enter a valid amount.");
    if (form.splitAmong.length === 0) return setError("Select at least one person to split.");
    setError("");
    setExpenses(prev => [...prev, {
      id: Date.now(),
      name: form.name.trim(),
      amount: Number(form.amount),
      paidBy: form.paidBy,
      splitAmong: [...form.splitAmong],
    }]);
    setForm({ name: "", amount: "", paidBy: MEMBERS[0], splitAmong: [...MEMBERS] });
  };

  const removeExpense = (id) => setExpenses(prev => prev.filter(e => e.id !== id));
  const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f13", fontFamily: "'DM Sans', sans-serif", color: "#f0f0f0", padding: "0 0 60px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", padding: "32px 24px 24px", borderBottom: "1px solid #ffffff10" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ background: "linear-gradient(135deg, #FF6B6B, #FFD93D)", borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>✈️</div>
            <div>
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Trip Splitter</div>
              <div style={{ fontSize: 12, color: "#aaa" }}>9 people · Squad Trip</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 16 }}>
            {MEMBERS.map(m => (
              <div key={m} style={{ background: getMemberColor(m) + "22", border: `1px solid ${getMemberColor(m)}55`, borderRadius: 20, padding: "4px 10px", fontSize: 11, fontWeight: 600, color: getMemberColor(m) }}>{m}</div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            {[{ label: "Total Spent", value: `₹${totalSpend.toLocaleString()}` }, { label: "Expenses", value: expenses.length }, { label: "Settlements", value: settlements.length }].map(s => (
              <div key={s.label} style={{ flex: 1, background: "#ffffff08", borderRadius: 12, padding: "10px 12px", textAlign: "center", border: "1px solid #ffffff10" }}>
                <div style={{ fontFamily: "Syne,sans-serif", fontSize: 18, fontWeight: 800 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ display: "flex", gap: 4, margin: "16px 0", background: "#ffffff0a", borderRadius: 12, padding: 4 }}>
          {[["add","➕ Add"],["expenses","📋 Expenses"],["balances","⚖️ Balances"],["settle","💸 Settle"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: "9px 4px", borderRadius: 9, border: "none", background: tab === key ? "#4D96FF" : "transparent", color: tab === key ? "#fff" : "#888", fontFamily: "DM Sans,sans-serif", fontWeight: 600, fontSize: 11, cursor: "pointer", transition: "all .2s" }}>{label}</button>
          ))}
        </div>

        {tab === "add" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <InputField label="Expense Name" placeholder="e.g. Hotel, Petrol, Dinner…" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
            <InputField label="Amount (₹)" placeholder="0" type="number" value={form.amount} onChange={v => setForm(f => ({ ...f, amount: v }))} />
            <div>
              <Label>Paid By</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {MEMBERS.map(m => (<Chip key={m} active={form.paidBy === m} color={getMemberColor(m)} onClick={() => setForm(f => ({ ...f, paidBy: m }))}>{m}</Chip>))}
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Label>Split Among ({form.splitAmong.length})</Label>
                <div style={{ display: "flex", gap: 8 }}>
                  <SmallBtn onClick={() => setForm(f => ({ ...f, splitAmong: [...MEMBERS] }))}>All</SmallBtn>
                  <SmallBtn onClick={() => setForm(f => ({ ...f, splitAmong: [] }))}>None</SmallBtn>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {MEMBERS.map(m => (<Chip key={m} active={form.splitAmong.includes(m)} color={getMemberColor(m)} onClick={() => toggleMember(m)}>{m}</Chip>))}
              </div>
            </div>
            {form.splitAmong.length > 0 && form.amount && (
              <div style={{ background: "#4D96FF15", border: "1px solid #4D96FF30", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#74C0FC" }}>
                Each person pays <strong>₹{(Number(form.amount) / form.splitAmong.length).toFixed(2)}</strong>
              </div>
            )}
            {error && <div style={{ color: "#FF6B6B", fontSize: 13, padding: "8px 12px", background: "#FF6B6B15", borderRadius: 8 }}>{error}</div>}
            <button onClick={handleAdd} style={{ background: "linear-gradient(135deg, #4D96FF, #6BCB77)", border: "none", borderRadius: 12, padding: "14px", color: "#fff", fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Add Expense</button>
          </div>
        )}

        {tab === "expenses" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {expenses.length === 0 && <Empty text="No expenses yet. Add your first one!" />}
            {[...expenses].reverse().map(exp => (
              <div key={exp.id} style={{ background: "#ffffff08", border: "1px solid #ffffff12", borderRadius: 14, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{exp.name}</div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>Paid by <span style={{ color: getMemberColor(exp.paidBy), fontWeight: 600 }}>{exp.paidBy}</span> · Split {exp.splitAmong.length} ways</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 18, color: "#6BCB77" }}>₹{exp.amount.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: "#666" }}>₹{(exp.amount / exp.splitAmong.length).toFixed(2)}/person</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
                  {exp.splitAmong.map(m => (<div key={m} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: getMemberColor(m) + "22", color: getMemberColor(m), fontWeight: 600 }}>{m}</div>))}
                </div>
                <button onClick={() => removeExpense(exp.id)} style={{ marginTop: 10, background: "#FF6B6B15", border: "1px solid #FF6B6B30", color: "#FF6B6B", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans,sans-serif" }}>Remove</button>
              </div>
            ))}
          </div>
        )}

        {tab === "balances" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Green = gets back money · Red = owes money</div>
            {MEMBERS.map(m => {
              const b = balances[m];
              const isPos = b > 0.01;
              const isNeg = b < -0.01;
              const pct = Math.min(Math.abs(b) / Math.max(...Object.values(balances).map(Math.abs), 1) * 100, 100);
              return (
                <div key={m} style={{ background: "#ffffff08", border: `1px solid ${isPos ? "#6BCB7730" : isNeg ? "#FF6B6B30" : "#ffffff10"}`, borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: getMemberColor(m) + "33", border: `2px solid ${getMemberColor(m)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: getMemberColor(m) }}>{AVATARS[m]}</div>
                      <div style={{ fontWeight: 600 }}>{m}</div>
                    </div>
                    <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 16, color: isPos ? "#6BCB77" : isNeg ? "#FF6B6B" : "#888" }}>
                      {isPos ? "+" : ""}{b < 0 ? "-" : ""}₹{Math.abs(b).toFixed(0)}
                    </div>
                  </div>
                  <div style={{ background: "#ffffff10", borderRadius: 4, height: 4 }}>
                    <div style={{ width: `${pct}%`, height: "100%", borderRadius: 4, background: isPos ? "#6BCB77" : isNeg ? "#FF6B6B" : "#555" }} />
                  </div>
                  <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                    {isPos ? `Gets back ₹${b.toFixed(2)}` : isNeg ? `Owes ₹${Math.abs(b).toFixed(2)}` : "Settled up ✓"}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "settle" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Minimum transactions needed to settle all debts</div>
            {settlements.length === 0 && <Empty text="Everyone is settled up! 🎉" />}
            {settlements.map((s, i) => (
              <div key={i} style={{ background: "#ffffff08", border: "1px solid #FFD93D30", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <Avatar name={s.from} />
                  <div style={{ fontSize: 10, color: "#888" }}>{s.from}</div>
                </div>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#888" }}>pays</div>
                  <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 20, color: "#FFD93D", margin: "2px 0" }}>₹{s.amount.toFixed(0)}</div>
                  <div style={{ fontSize: 18 }}>→</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <Avatar name={s.to} />
                  <div style={{ fontSize: 10, color: "#888" }}>{s.to}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Avatar({ name }) {
  return (
    <div style={{ width: 42, height: 42, borderRadius: "50%", background: getMemberColor(name) + "33", border: `2px solid ${getMemberColor(name)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: getMemberColor(name) }}>{AVATARS[name]}</div>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: 12, fontWeight: 600, color: "#aaa", marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>{children}</div>;
}

function InputField({ label, placeholder, value, onChange, type = "text" }) {
  return (
    <div>
      <Label>{label}</Label>
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #ffffff18", background: "#ffffff0a", color: "#f0f0f0", fontFamily: "DM Sans,sans-serif", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
    </div>
  );
}

function Chip({ children, active, color, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: "6px 12px", borderRadius: 20, border: `1.5px solid ${active ? color : "#ffffff15"}`, background: active ? color + "25" : "transparent", color: active ? color : "#666", fontFamily: "DM Sans,sans-serif", fontWeight: 600, fontSize: 12, cursor: "pointer", transition: "all .15s" }}>{children}</button>
  );
}

function SmallBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #ffffff20", background: "#ffffff0a", color: "#aaa", fontFamily: "DM Sans,sans-serif", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{children}</button>
  );
}

function Empty({ text }) {
  return <div style={{ textAlign: "center", padding: "40px 20px", color: "#444", fontSize: 14 }}>{text}</div>;
}
