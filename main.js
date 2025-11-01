const buttons = document.querySelectorAll("nav button");
const tabs = document.querySelectorAll("section.tab");
buttons.forEach(btn => btn.addEventListener("click", () => {
    buttons.forEach(b => b.classList.remove("active"));
    tabs.forEach(t => t.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
}));

let fridgeItems = [
    { name: "Milk", date: "2025-11-02", category: "Fridge", quantity: 1 },
    { name: "Eggs", date: "2025-11-10", category: "Fridge", quantity: 12 },
    { name: "Yogurt", date: "2025-11-01", category: "Fridge", quantity: 2 },
    { name: "Cheese", date: "2025-10-20", category: "Fridge", quantity: 1 },
];

let freezerItems = [
    { name: "Frozen Pizza", date: "2026-01-15", category: "Freezer", quantity: 2 },
    { name: "Ice Cream", date: "2025-12-20", category: "Freezer", quantity: 1 },
];

let pantryItems = [
    { name: "Pasta", date: "2026-05-01", category: "Pantry", quantity: 3 },
    { name: "Rice", date: "2026-03-10", category: "Pantry", quantity: 5 },
];

/*let expiringSoonItems = [
    { name: "Yogurt", date: "2025-11-01", category: "Fridge", quantity: 2 },
];

let expiredItems = [
    { name: "Cheese", date: "2025-10-20", category: "Fridge", quantity: 1 },
];*/

let currentCategory = null;
let editingItem = null;

const mainScreen = document.getElementById('mainScreen');
const itemsView = document.getElementById('itemsView');
const cardsContainer = document.getElementById('cardsContainer');
const categoryTitle = document.getElementById('categoryTitle');
const addItemBtn = document.getElementById('addItemBtn');
const backBtn = document.getElementById('backBtn');
const modal = document.getElementById('itemModal');
const saveItemBtn = document.getElementById('saveItemBtn');

const nameInput = document.getElementById('itemName');
const dateInput = document.getElementById('itemDate');
const catInput = document.getElementById('itemCategory');
const qtyInput = document.getElementById('itemQty');
const modalTitle = document.getElementById('modalTitle');

function daysUntil(dateStr) {
    const today = new Date();
    const target = new Date(dateStr);
    const diffTime = target - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Category div click
document.querySelectorAll('.category').forEach(div => {
    div.addEventListener('click', () => {
        currentCategory = div.dataset.cat;
        showItemsScreen(currentCategory);
    });
});

backBtn.addEventListener('click', showMainScreen);
addItemBtn.addEventListener('click', () => openModal(null));

saveItemBtn.addEventListener('click', saveItem);

function showItemsScreen(category) {
    mainScreen.style.display = 'none';
    itemsView.style.display = 'flex';
    backBtn.style.display = 'block';
    if (category === 'Expiring Soon' || category === 'Expired') {
        addItemBtn.style.display = 'none';
    } else {
        addItemBtn.style.display = 'block';
    }
    categoryTitle.textContent = category;
    renderItems();
}

function showMainScreen() {
    itemsView.style.display = 'none';
    mainScreen.style.display = 'flex';
    backBtn.style.display = 'none';
    addItemBtn.style.display = 'block';
    currentCategory = null;
}

function getArrayByCategory(cat) {
    switch (cat) {
        case 'Fridge': return fridgeItems;
        case 'Freezer': return freezerItems;
        case 'Pantry': return pantryItems;
    }
}

function computeExpiringSoon() {
    const all = [...fridgeItems, ...freezerItems, ...pantryItems];
    return all.filter(item => {
        const d = daysUntil(item.date);
        return d >= 0 && d <= 7;
    });
}

function computeExpired() {
    const all = [...fridgeItems, ...freezerItems, ...pantryItems];
    return all.filter(item => daysUntil(item.date) < 0);
}

function renderItems() {
    let arr;

    if (currentCategory === "Expiring Soon") {
        arr = computeExpiringSoon();
    } else if (currentCategory === "Expired") {
        arr = computeExpired();
    } else {
        arr = getArrayByCategory(currentCategory);
    }

    cardsContainer.innerHTML = '';
    arr.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <h3>${item.name}</h3>
          <small>Expires: ${item.date}</small>
          <div class="card-actions">
            <div class="qty-control">
              <button onclick="updateQty('${item.category}', '${item.name}', -1)">−</button>
              <span>${item.quantity}</span>
              <button onclick="updateQty('${item.category}', '${item.name}', 1)">＋</button>
            </div>
            <div>
              <button class="icon-btn" onclick="editItem('${item.category}', '${item.name}')">✏️</button>
              <button class="icon-btn" onclick="deleteItem('${item.category}', '${item.name}')">🗑️</button>
            </div>
          </div>
        `;
        cardsContainer.appendChild(card);
    });
}

function showToast(message, color = "#323232") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.style.backgroundColor = color;
    toast.classList.add("show");

    // Hide after 2 seconds
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}

function openModal(item) {
    modal.style.display = 'flex';
    modalTitle.textContent = item ? 'Edit Item' : 'Add Item';
    editingItem = item;

    if (item) {
        nameInput.value = item.name;
        dateInput.value = item.date;
        qtyInput.value = item.quantity;
        catInput.value = item.category;
        catInput.disabled = true;
    } else {
        nameInput.value = '';
        dateInput.value = '';
        qtyInput.value = 1;
        catInput.disabled = currentCategory && !["Expiring Soon", "Expired"].includes(currentCategory);
        catInput.value = currentCategory && !["Expiring Soon", "Expired"].includes(currentCategory)
            ? currentCategory
            : "Fridge";
    }
}

function saveItem() {
    const item = {
        name: nameInput.value.trim(),
        date: dateInput.value,
        category: catInput.value,
        quantity: parseInt(qtyInput.value)
    };
    if (!item.name || !item.date) return alert('Please fill all fields');

    const arr = getArrayByCategory(item.category);
    const existing = arr?.find(i => i.name.toLowerCase() === item.name.toLowerCase());

    if (editingItem) {
        Object.assign(editingItem, item);
        showToast("Item successfully edited", "#4caf50");
    } else if (existing) {
        // If already exists, update quantity/date
        existing.quantity += item.quantity;
        existing.date = item.date;
        showToast("Item updated", "#4caf50");
    } else {
        arr.push(item);
        showToast("Item successfully added", "#4caf50");
    }

    modal.style.display = 'none';
    if (currentCategory !== null) {
        renderItems();
    }
}

function updateQty(category, name, delta) {
    const arr = getArrayByCategory(category);
    const item = arr.find(i => i.name === name);
    if (!item) return;
    item.quantity = Math.max(1, item.quantity + delta);
    renderItems();
}

function deleteItem(category, name) {
    const arr = getArrayByCategory(category);
    const idx = arr.findIndex(i => i.name === name);
    console.log(arr, idx, name);
    if (idx !== -1) {
        arr.splice(idx, 1);
        showToast("Item deleted", "#f44336");
    }
    renderItems();
}

function editItem(category, name) {
    const arr = getArrayByCategory(category);
    const item = arr.find(i => i.name === name);
    openModal(item);
}

// Close modal on background click
modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});

// expose helper functions to window for inline onclick
window.updateQty = updateQty;
window.deleteItem = deleteItem;
window.editItem = editItem;

/*
// Profile notification example
const img = document.getElementById("profileImg");

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

renderTables();*/