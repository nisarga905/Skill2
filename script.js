const menu = [
  { id: 1, name: "Paneer Tikka", category: "veg", price: 280, description: "Charred cottage cheese, peppers & spices", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=700&q=80" },
  { id: 2, name: "Hyderabadi Biryani", category: "nonveg", price: 340, description: "Fragrant basmati rice with tender chicken", image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=700&q=80" },
  { id: 3, name: "Masala Dosa", category: "veg", price: 180, description: "Crisp dosa, spiced potato & chutneys", image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=700&q=80" },
  { id: 4, name: "Butter Chicken", category: "nonveg", price: 360, description: "Creamy tomato curry with tandoori chicken", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=700&q=80" },
  { id: 5, name: "Palak Paneer", category: "veg", price: 260, description: "Cottage cheese in rich spinach gravy", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=700&q=80" },
  { id: 6, name: "Fish Curry", category: "nonveg", price: 390, description: "Fresh fish in coastal coconut curry", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=700&q=80" }
];

const tables = [
  1, 1, 1, 0, 1, 0,
  1, 0, 1, 1, 0, 1,
  1, 1, 0, 1, 1, 1
]; // 0 = occupied, 1 = available
let activeCategory = "all";
let selectedTable = 1;
let cart = {};

const menuGrid = document.getElementById("menuGrid");
const tablesGrid = document.getElementById("tablesGrid");
const cartItems = document.getElementById("cartItems");

function renderMenu() {
  const query = document.getElementById("search").value.toLowerCase().trim();
  const filtered = menu.filter(item =>
    (activeCategory === "all" || item.category === activeCategory) &&
    item.name.toLowerCase().includes(query)
  );
  menuGrid.innerHTML = filtered.map(item => `
    <article class="food-card">
      <div class="food-image" style="background-image: url('${item.image}')">
        <span class="food-badge ${item.category}" title="${item.category === "veg" ? "Vegetarian" : "Non-vegetarian"}">${item.category === "veg" ? "●" : "▲"}</span>
      </div>
      <div class="food-info">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="food-bottom"><span class="price">₹${item.price}</span><button class="add-btn" onclick="addItem(${item.id})" aria-label="Add ${item.name}">+</button></div>
      </div>
    </article>
  `).join("");
}

function renderTables() {
  tablesGrid.innerHTML = tables.map((available, index) => {
    const number = index + 1;
    return `<button class="table-card ${available ? "available" : "occupied"} ${number === selectedTable ? "selected" : ""}" ${available ? `onclick="selectTable(${number})"` : "disabled"} aria-label="Table ${number}, ${available ? "available" : "occupied"}">
      <div class="table-icon">▦</div><strong>Table ${number}</strong><small>${available ? "Available" : "Occupied"}</small>
    </button>`;
  }).join("");
  document.getElementById("availableCount").textContent = tables.filter(Boolean).length;
}

function selectTable(number) {
  selectedTable = number;
  document.getElementById("selectedTablePill").textContent = `Table ${number}`;
  renderTables();
}

function addItem(id) {
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
}

function changeQty(id, delta) {
  cart[id] += delta;
  if (cart[id] <= 0) delete cart[id];
  renderCart();
}

function renderCart() {
  const entries = Object.entries(cart);
  if (!entries.length) {
    cartItems.innerHTML = '<div class="empty-cart"><span>🍽️</span><p>Your table is ready.<br>Add dishes to begin.</p></div>';
    document.getElementById("subtotal").textContent = "₹0";
    document.getElementById("tax").textContent = "₹0";
    document.getElementById("total").textContent = "₹0";
    return;
  }
  let subtotal = 0;
  cartItems.innerHTML = entries.map(([id, quantity]) => {
    const item = menu.find(food => food.id === Number(id));
    subtotal += item.price * quantity;
    return `<div class="cart-row"><div><strong>${item.name}</strong><br><small>₹${item.price} × ${quantity}</small></div><div class="qty-control"><button onclick="changeQty(${id}, -1)">−</button><strong>${quantity}</strong><button onclick="changeQty(${id}, 1)">+</button></div></div>`;
  }).join("");
  const tax = Math.round(subtotal * 0.05);
  document.getElementById("subtotal").textContent = `₹${subtotal}`;
  document.getElementById("tax").textContent = `₹${tax}`;
  document.getElementById("total").textContent = `₹${subtotal + tax}`;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
}

document.querySelectorAll(".category-tab").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".category-tab").forEach(tab => tab.classList.remove("active"));
    button.classList.add("active");
    activeCategory = button.dataset.category;
    renderMenu();
  });
});
document.getElementById("search").addEventListener("input", renderMenu);
document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (!Object.keys(cart).length) return showToast("Add at least one dish to place an order");
  showToast(`Order placed for Table ${selectedTable}!`);
  document.getElementById("todayOrders").textContent = Number(document.getElementById("todayOrders").textContent) + 1;
  cart = {};
  renderCart();
});

renderMenu();
renderTables();

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  menuGrid.addEventListener("pointermove", event => {
    const card = event.target.closest(".food-card");
    if (!card) return;
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    card.style.setProperty("--ry", `${x * 10}deg`);
    card.style.setProperty("--rx", `${y * -10}deg`);
  });
  menuGrid.addEventListener("pointerleave", event => {
    const card = event.target.closest(".food-card");
    if (!card) return;
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  }, true);
}
