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