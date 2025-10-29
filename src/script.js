// Initialize the storage
const state = {
  transactions: JSON.parse(localStorage.getItem("pf_transactions_v1")) || [],
};

// Save the data in localstorage
const saveData = () => {
  localStorage.setItem(
    "pf_transactions_v1",
    JSON.stringify(state.transactions)
  );
};

// add transaction
document.getElementById("transaction-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const desc = document.querySelector("#desc").value;
  const amount = Number(document.querySelector("#amount").value.trim());
  const type = document.querySelector("#type").value.trim();
  const category = document.querySelector("#category").value.trim();

  // Validate amount
  if (amount <= 0) {
    return alert("Please enter a valid amount");
  }

  // update the storage
  state.transactions.push({ desc, amount, type, category, date: new Date() });
  saveData();
  e.target.reset();
  //update the UI
  updateUI();
});

// get income , balance and expense
const getTotals = () => {
  const income = state.transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expense = state.transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return { income, expense, balance: income - expense };
};

// Render Dashboard Summary Section
function renderSummary() {
  const { income, expense, balance } = getTotals();
  document.querySelector("#total-balance").textContent = `₹${balance}`;
  document.querySelector("#monthly-income").textContent = `₹${income}`;
  document.querySelector("#monthly-expense").textContent = `₹${expense}`;
}

// Render Transactions
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

// Delete Transaction
function deleteTx(index) {
  state.transactions.splice(index, 1);
  saveData();
  updateUI();
}

// Charts
let pieChart, lineChart, barChart;
function renderCharts() {
  const ctx1 = document.getElementById("chart-pie");
  const ctx2 = document.getElementById("chart-line");
  const ctx3 = document.getElementById("chart-bar");

  // extract the expenses category and amount
  const expensesByCat = {};
  state.transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      expensesByCat[t.category] =
        (expensesByCat[t.category] || 0) + Number(t.amount);
    });

  const categories = Object.keys(expensesByCat);
  const values = Object.values(expensesByCat);

  //Pie Chart
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(ctx1, {
    type: "pie",
    data: {
      labels: categories,
      datasets: [{ data: values }],
    },

  });

  //Line Chart (Monthly Expense Trend)
  const monthly = Array(12).fill(0);
  const now = new Date();
  state.transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const d = new Date(t.date);
      const diff =
        now.getMonth() -
        d.getMonth() +
        12 * (now.getFullYear() - d.getFullYear());
      if (diff < 12 && diff >= 0) monthly[11 - diff] += Number(t.amount);
    });

  if (lineChart) lineChart.destroy();
  lineChart = new Chart(ctx2, {
    type: "line",
    data: {
      labels: Array.from({ length: 12 }, (_, i) => `${i + 1}`),
      
      datasets: [
        {
          label: "Expenses",
          data: monthly,
          borderColor: "#ef4444",
          fill: false,
        },
      ],
    },
  });

  //Bar Chart (Income vs Expense)
  const monthlyIncome = Array(12).fill(0);
  const monthlyExpense = Array(12).fill(0);
  state.transactions.forEach((t) => {
    const d = new Date(t.date);
    const diff =
      now.getMonth() -
      d.getMonth() +
      12 * (now.getFullYear() - d.getFullYear());
    if (diff < 12 && diff >= 0) {
      if (t.type === "income") monthlyIncome[11 - diff] += Number(t.amount);
      else monthlyExpense[11 - diff] += Number(t.amount);
    }
  });

  if (barChart) barChart.destroy();
  barChart = new Chart(ctx3, {
    type: "bar",
    data: {
      labels: Array.from({ length: 12 }, (_, i) => `${i + 1}`),
      datasets: [
        { label: "Income", data: monthlyIncome, backgroundColor: "#3b82f6" },
        { label: "Expenses", data: monthlyExpense, backgroundColor: "#ef4444" },
      ],
    },
  });
}

// Update UI
function updateUI() {
  renderSummary();
  renderTransactions();
  renderCharts();
  updateFilterOptions();
}
//Update category filter
function updateFilterOptions() {
  const filter = document.getElementById("filter-category");
  const cats = [...new Set(state.transactions.map((t) => t.category))];
  filter.innerHTML =
    '<option value="all">All</option>' +
    cats.map((c) => `<option value="${c}">${c}</option>`).join("");
}
// filter by category
document
  .getElementById("filter-category")
  .addEventListener("change", renderTransactions);

// initialize UI
updateUI();
