const buttons = document.querySelectorAll("nav button");
const tabs = document.querySelectorAll("section.tab");
buttons.forEach(btn => btn.addEventListener("click", () => {
    buttons.forEach(b => b.classList.remove("active"));
    tabs.forEach(t => t.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
}));

// Profile notification example
const img = document.getElementById("profileImg");
if (img) img.addEventListener("click", () => alert("GOAT"));

// Generate random fridge items
const foodNames = [
  "Milk", "Eggs", "Yogurt", "Cheese", "Butter", "Lettuce", "Spinach", 
  "Carrots", "Tomatoes", "Cucumbers", "Chicken", "Beef", "Fish", 
  "Tofu", "Apples", "Bananas", "Grapes", "Berries", "Juice", "Bread",
  "Peppers", "Mushrooms", "Onions", "Garlic", "Celery", "Broccoli",
  "Pasta Sauce", "Sour Cream", "Ham", "Sausage"
];

// Generate random dates between today and 2 weeks ahead
function randomDate() {
  const today = new Date();
  const future = new Date(today);
  future.setDate(today.getDate() + Math.floor(Math.random() * 14) + 1);
  return future.toISOString().split("T")[0];
}

// Create a random list of items (10–20)
const foods = Array.from({ length: Math.floor(Math.random() * 10) + 10 }, () => {
  const randomItem = foodNames[Math.floor(Math.random() * foodNames.length)];
  return { name: randomItem, expires: randomDate() };
});

const foodTable = document.querySelector("#foodTable tbody");
const expiringTable = document.querySelector("#expiringTable tbody");
const searchInput = document.getElementById("searchFridge");

function daysUntilExpire(date) {
  const today = new Date();
  const expiry = new Date(date);
  const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  return diff;
}

function renderTables(filter = "") {
  foodTable.innerHTML = "";
  expiringTable.innerHTML = "";

  foods
    .filter((f) => f.name.toLowerCase().includes(filter.toLowerCase()))
    .forEach((food) => {
      const daysLeft = daysUntilExpire(food.expires);
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${food.name}</td><td>${food.expires}</td>`;

      if (daysLeft <= 3) {
        tr.classList.add("expiring");
        expiringTable.appendChild(tr.cloneNode(true));
      }

      foodTable.appendChild(tr);
    });
}

searchInput.addEventListener("input", (e) => {
  renderTables(e.target.value);
});

renderTables();