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

const ALLERGEN_SYNONYMS = {
  dairy: ["dairy", "milk", "butter", "cheese", "yogurt", "cream", "parmesan", "sour cream"],
  egg: ["egg", "eggs", "albumen"],
  gluten: ["gluten", "wheat", "barley", "rye", "bread", "pasta"],
  wheat: ["wheat", "bread", "pasta", "flour"],
  peanut: ["peanut", "peanuts"],
  "tree nuts": ["almond", "walnut", "pecan", "cashew", "hazelnut", "pistachio", "macadamia", "nut"],
  soy: ["soy", "soybean", "tofu", "edamame", "soya"],
  shellfish: ["shrimp", "prawn", "crab", "lobster", "shellfish"],
  fish: ["fish", "salmon", "tuna", "cod", "trout", "anchovy"],
  sesame: ["sesame", "tahini"]
};


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


// Profile tab
(function ProfileTab() {
  const profileState = {
    email: "bob@gmail.com",
    favoriteRecipes: ["Garlic Butter Pasta", "Lemon Herb Baked Salmon", "Beef Bourguignon"],
    dislikes: ["Cheese", "Anchovies"],
    dietaryRestrictions: ["None"],
    allergies: ["None"]
  };

  window.getUserAllergies = () =>
  Array.isArray(profileState.allergies) ? profileState.allergies : [];

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const commaJoin = (arr) => (Array.isArray(arr) && arr.length ? arr.join(", ") : "—");

  document.addEventListener("DOMContentLoaded", () => {
    const profileSection = document.getElementById("profile");
    if (!profileSection) return;

    const avatar = $("#profileImg", profileSection);
    const header = $("h2", profileSection);

    const container = document.createElement("div");
    container.className = "p-profile-container";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.id = "pEditBtn";
    editBtn.className = "p-btn-primary";
    editBtn.textContent = "Edit";
    container.appendChild(editBtn);

    const grid = document.createElement("div");
    grid.className = "p-profile-grid";

    const mkField = (labelText, valueId) => {
      const wrap = document.createElement("div");
      wrap.className = "p-field";
      const label = document.createElement("div");
      label.className = "p-label";
      label.textContent = labelText;
      const value = document.createElement("div");
      value.className = "p-value";
      value.id = valueId;
      wrap.appendChild(label);
      wrap.appendChild(value);
      return wrap;
    };

    grid.appendChild(mkField("Email", "pEmailValue"));
    grid.appendChild(mkField("Favorite Recipes", "pFavsValue"));
    grid.appendChild(mkField("Dislikes", "pDislikesValue"));
    grid.appendChild(mkField("Dietary Restrictions", "pDietValue"));
    grid.appendChild(mkField("Allergies", "pAllergiesValue"));
    container.appendChild(grid);

    [...profileSection.children].forEach((child) => {
      if (child !== avatar && child !== header) child.remove();
    });
    profileSection.appendChild(container);

    const renderProfile = () => {
      $("#pEmailValue").textContent = profileState.email || "—";
      $("#pFavsValue").textContent = commaJoin(profileState.favoriteRecipes);
      $("#pDislikesValue").textContent = commaJoin(profileState.dislikes);
      $("#pDietValue").textContent = commaJoin(profileState.dietaryRestrictions);
      $("#pAllergiesValue").textContent = commaJoin(profileState.allergies);
    };
    renderProfile();

    const modal = document.createElement("div");
    modal.id = "pProfileModal";
    modal.className = "p-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "pModalTitle");
    modal.hidden = true;

    modal.innerHTML = `
      <div class="p-modal-card">
        <div class="p-modal-header">
          <h3 id="pModalTitle">Edit Profile</h3>
          <button class="p-icon-btn" id="pCloseModal" aria-label="Close">✕</button>
        </div>
        <div class="p-modal-body">
          <div class="p-modal-field">
            <label class="p-modal-label" for="pEmailInput">Email</label>
            <input id="pEmailInput" type="email" class="p-input" placeholder="name@example.com" />
          </div>

          ${[
            { key: "favoriteRecipes", label: "Favorite Recipes" },
            { key: "dislikes", label: "Dislikes" },
            { key: "dietaryRestrictions", label: "Dietary Restrictions" },
            { key: "allergies", label: "Allergies" }
          ]
            .map(
              ({ key, label }) => `
            <div class="p-modal-field" data-section="${key}">
              <div class="p-modal-label-row">
                <label class="p-modal-label">${label}</label>
                <button class="p-btn-secondary" data-p-add="${key}">+ Add</button>
              </div>
              <div class="p-list" id="p-${key}-list"></div>
            </div>`
            )
            .join("")}
        </div>
        <div class="p-modal-footer">
          <button id="pSaveProfile" class="p-btn-primary">Save</button>
          <button id="pCancelProfile" class="p-btn-ghost">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const makeRow = (value = "") => {
      const row = document.createElement("div");
      row.className = "p-row";
      row.innerHTML = `
        <input type="text" class="p-input" value="${value.replace(/"/g, "&quot;")}" />
        <button type="button" class="p-del-btn" aria-label="Delete">🗑</button>
      `;
      row.querySelector(".p-del-btn").addEventListener("click", () => row.remove());
      return row;
    };

    const fillModal = () => {
      $("#pEmailInput").value = profileState.email || "";
      const map = [
        ["favoriteRecipes", "#p-favoriteRecipes-list"],
        ["dislikes", "#p-dislikes-list"],
        ["dietaryRestrictions", "#p-dietaryRestrictions-list"],
        ["allergies", "#p-allergies-list"]
      ];
      map.forEach(([key, sel]) => {
        const list = $(sel);
        list.innerHTML = "";
        const values = Array.isArray(profileState[key]) ? profileState[key] : [];
        if (!values.length) list.appendChild(makeRow(""));
        else values.forEach((v) => list.appendChild(makeRow(v)));
      });
    };

    const openModal = () => {
      fillModal();
      modal.hidden = false;
      setTimeout(() => $("#pEmailInput").focus(), 0);
    };
    const closeModal = () => (modal.hidden = true);

    editBtn.addEventListener("click", openModal);

    $$("[data-p-add]", modal).forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-p-add");
        const list = $(`#p-${key}-list`);
        list.appendChild(makeRow(""));
        list.lastElementChild.querySelector("input").focus();
      });
    });

    $("#pSaveProfile", modal).addEventListener("click", () => {
      profileState.email = $("#pEmailInput").value.trim();

      const collect = (sel) =>
        $$(sel + " .p-input", modal)
          .map((i) => i.value.trim())
          .filter(Boolean);

      profileState.favoriteRecipes = collect("#p-favoriteRecipes-list");
      profileState.dislikes = collect("#p-dislikes-list");
      profileState.dietaryRestrictions = collect("#p-dietaryRestrictions-list");
      profileState.allergies = collect("#p-allergies-list");
      renderProfile();
      window.dispatchEvent(new Event("recipes:refresh-allergens"));
      closeModal();
    });

    $("#pCancelProfile", modal).addEventListener("click", closeModal);
    $("#pCloseModal", modal).addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) closeModal();
    });
  });
})();

// Profile picture upload
(function ProfileAvatarUpload() {
  document.addEventListener("DOMContentLoaded", () => {
    const avatar = document.getElementById("profileImg");
    if (!avatar) return;

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/png, image/jpeg, image/webp, image/gif";
    fileInput.id = "pAvatarInput";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    avatar.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;

      const maxBytes = 6 * 1024 * 1024;
      if (!file.type.startsWith("image/")) {
        alert("Please choose an image file (PNG, JPEG, WEBP, GIF).");
        fileInput.value = "";
        return;
      }
      if (file.size > maxBytes) {
        alert("That image is a bit large. Please pick one under 6MB.");
        fileInput.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        avatar.src = reader.result;
      };
      reader.onerror = () => {
        alert("Sorry, we couldn't read that file.");
      };
      reader.readAsDataURL(file);
    });
  });
})();

//shopping tab
const input = document.getElementById('newItem');
const addButton = document.getElementById('addItem');
const list = document.getElementById('shoppingList');

addButton.addEventListener('click', addItem);
input.addEventListener('keypress', e => {
    if (e.key === 'Enter') addItem();
});

function addItem() {
    const value = input.value.trim();
    if (!value) return;

    const li = document.createElement('li');
    li.textContent = value;

    // click to cross off
    li.addEventListener('click', e => {
        if (e.target.tagName !== 'BUTTON') li.classList.toggle('completed');
    });

    // delete button
    const del = document.createElement('button');
    del.textContent = '×';
    del.className = 'delete-btn';
    del.addEventListener('click', () => li.remove());

    li.appendChild(del);
    list.appendChild(li);

    input.value = '';
    input.focus();
}

document.querySelectorAll('.recipes-grid input[type="button"]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    document.querySelectorAll('section.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(target).classList.add('active');
  });
});

document.querySelectorAll('.recipe-back').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('section.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById("recipes").classList.add("active");
  });
});

document.querySelectorAll('.recipes-grid input[type="button"]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    document.querySelectorAll('section.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(target).classList.add('active');
  });
});

document.querySelectorAll('.recipe-back').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('section.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById("recipes").classList.add("active");
  });
});

(function oneOpenAccordion(){
  const container = document.getElementById('recipes-easy');
  if (!container) return;
  container.querySelectorAll('details.r-item').forEach(d => {
    d.addEventListener('toggle', () => {
      if (d.open) {
        container.querySelectorAll('details.r-item').forEach(other => {
          if (other !== d) other.open = false;
        });
      }
    });
  });
})();

function norm(s) { return (s || "").toLowerCase().trim(); }

function expandAllergyTerms(allergy) {
  const a = norm(allergy);
  const set = new Set([a]);
  const list = ALLERGEN_SYNONYMS[a] || [];
  list.forEach(t => set.add(norm(t)));
  return set;
}

function parseIngredients(str) {
  return new Set(
    (str || "")
      .split(",")
      .map(norm)
      .filter(Boolean)
  );
}

function checkRecipeForAllergens(ingredientsSet, userAllergies) {
  const hits = new Set();

  userAllergies
    .map(norm)
    .filter(a => a && a !== "none")
    .forEach(a => {
      const terms = expandAllergyTerms(a);
      ingredientsSet.forEach(ing => {
        for (const term of terms) {
          if (ing.includes(term)) {
            hits.add(a);
            break;
          }
        }
      });
    });

  return Array.from(hits);
}

function markRecipeAllergens(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const allergies = (typeof window.getUserAllergies === "function")
    ? window.getUserAllergies()
    : [];

  section.querySelectorAll(".allergen-badge").forEach(b => b.remove());

  section.querySelectorAll("details.r-item").forEach(item => {
    item.classList.remove("allergen");
    const ingredientsAttr = item.getAttribute("data-ingredients") || "";
    const ingredientsSet = parseIngredients(ingredientsAttr);
    const hits = checkRecipeForAllergens(ingredientsSet, allergies);

    if (hits.length) {
      item.classList.add("allergen");
      const summary = item.querySelector(".r-btn");
      if (summary) {
        const badge = document.createElement("span");
        badge.className = "allergen-badge";
        badge.textContent = `Contains: ${hits.join(", ")}`;
        summary.appendChild(badge);
      }
    }
  });
}

document.querySelectorAll('.recipes-grid input[type="button"]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    document.querySelectorAll('section.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(target).classList.add('active');
    markRecipeAllergens(target);
  });
});

window.addEventListener("recipes:refresh-allergens", () => {
  ["recipes-easy", "recipes-medium", "recipes-hard"].forEach(markRecipeAllergens);
});