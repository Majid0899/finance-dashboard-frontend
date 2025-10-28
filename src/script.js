const state = {
  transactions: JSON.parse(localStorage.getItem("pf_transactions_v1")) || [],
};

const saveData = () => {
  localStorage.setItem(
    "pf_transactions_v1",
    JSON.stringify(state.transactions)
  );
};

document.getElementById("transaction-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const desc = document.querySelector("#desc").value;
  const amount = Number(document.querySelector("#amount").value.trim());
  const type = document.querySelector("#type").value.trim();
  const category = document.querySelector("#category").value.trim();

  if (amount <= 0) {
    return alert("Please enter a valid amount");
  }

  state.transactions.push({ desc, amount, type, category, date: new Date() });
  saveData();
  updateUI();
  e.target.reset();
});

const getTotals = () => {
  const income = state.transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expense = state.transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return { income, expense, balance: income - expense };
};

function renderSummary() {
  const { income, expense, balance } = getTotals();
  document.querySelector("#total-balance").textContent = `₹${balance}`;
  document.querySelector("#monthly-income").textContent = `₹${income}`;
  document.querySelector("#monthly-expense").textContent = `₹${expense}`;
}

function renderTransactions() {
  const list = document.getElementById("transaction-list");
  const filter = document.getElementById("filter-category").value;
  list.innerHTML = "";
  const filtered =
    filter === "all"
      ? state.transactions
      : state.transactions.filter((t) => t.category === filter);
  filtered.forEach((t, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
          <td class="p-2">${t.desc}</td>
          <td class="p-2 ${
            t.type === "income" ? "text-green-600" : "text-red-500"
          }">₹${t.amount}</td>
          <td class="p-2">${t.category}</td>
          <td class="p-2 text-center"><button class="text-red-600 hover:underline" onclick="deleteTx(${i})">Delete</button></td>
        `;
    list.appendChild(row);
  });
}

function updateUI() {
  renderSummary();
  renderTransactions();
}

// initialize UI
updateUI();

console.log(state.transactions);
getTotals();
