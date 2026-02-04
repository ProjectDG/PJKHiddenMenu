// =========================
// FORCE DARK MODE DEFAULT
// =========================
$("html").attr("data-theme", localStorage.getItem("theme") || "dark");

// =========================
// APP ROOT
// =========================
const app = d3.select("body")
    .append("div")
    .attr("class", "app");

// =========================
// CORNER MENU (LEFT ONLY)
// =========================
const leftMenu = d3.select("body")
    .append("div")
    .attr("class", "corner-menu-left");

leftMenu.append("button")
    .attr("id", "menuBtn")
    .text("Menu");

// =========================
// HEADER
// =========================
const header = app.append("div").attr("class", "header");
header.append("h1").text("HIDDEN GEMS");
header.append("div").attr("class", "header-divider");

// =========================
// MENU GRID
// =========================
const menu = app.append("div").attr("id", "menu");

// =========================
// MODALS
// =========================
const menuModal = d3.select("body")
    .append("div")
    .attr("class", "modal-overlay")
    .attr("id", "menuModal")
    .style("display", "none");

const menuBox = menuModal.append("div")
    .attr("class", "modal modal-menu");

const qrModal = d3.select("body")
    .append("div")
    .attr("class", "modal-overlay")
    .attr("id", "qrModal")
    .style("display", "none");

const qrBox = qrModal.append("div")
    .attr("class", "modal qr-card");

const searchModal = d3.select("body")
    .append("div")
    .attr("class", "modal-overlay")
    .attr("id", "searchModal")
    .style("display", "none");

const searchBox = searchModal.append("div")
    .attr("class", "modal search-card");

// =========================
// LOAD DATA
// =========================
d3.json("./data.json").then(data => {
    const visibleDrinks = data.drinks
        .filter(d => d.name !== "Hidden Gems")
        .sort((a, b) => a.name.localeCompare(b.name));

    window.hiddenGems = data.drinks.find(d => d.name === "Hidden Gems");
    window.allDrinks = data.drinks;

    renderDrinks(visibleDrinks);
    buildMenu();
});

// =========================
// RENDER DRINKS
// =========================
function renderDrinks(drinks, container = menu) {
    container.selectAll(".drink")
        .data(drinks, d => d.name)
        .join("div")
        .attr("class", "drink")
        .each(function(d) {
            const c = d3.select(this);
            c.html("");

            c.append("img")
                .attr("src", `./images/${d.photo}`)
                .attr("alt", d.name);

            c.append("h2").text(d.name);

            // CONTENTS
            c.append("div").attr("class", "section-title").text("Contents");
            c.append("div").attr("class", "section-divider");
            c.append("ul")
                .attr("class", "drink-section")
                .selectAll("li")
                .data(d.contents)
                .join("li")
                .text(c => c);

            // DESCRIPTION
            if (d.description?.length) {
                c.append("div").attr("class", "section-title").text("Description");
                c.append("div").attr("class", "section-divider");
                c.append("ul")
                    .attr("class", "drink-section")
                    .selectAll("li")
                    .data(d.description)
                    .join("li")
                    .text(c => c);
            }

            // ALLERGENS
            if (d.allergens?.length) {
                c.append("div").attr("class", "section-title").text("Allergens");
                c.append("div").attr("class", "section-divider");
                c.append("ul")
                    .attr("class", "drink-section")
                    .selectAll("li")
                    .data(d.allergens)
                    .join("li")
                    .attr("class", "allergen")
                    .text(a => `Contains ${a}`);
            }
        });
}

// =========================
// BUILD MENU MODAL
// =========================
function buildMenu() {
    menuBox.html("");

    menuBox.append("button")
        .text("Search Drinks")
        .on("click", openSearch);

    menuBox.append("button")
        .text("Toggle Theme")
        .on("click", toggleTheme);

    menuBox.append("button")
        .text("QR Code")
        .on("click", openQR);
}

// =========================
// THEME TOGGLE
// =========================
function toggleTheme() {
    const html = $("html");
    const newTheme = html.attr("data-theme") === "classic" ? "dark" : "classic";
    html.attr("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
}

// =========================
// MODAL CONTROLS
// =========================
function openMenu() { menuModal.style("display", "flex"); }
function closeModals() {
    menuModal.style("display", "none");
    qrModal.style("display", "none");
    searchModal.style("display", "none");
}

// =========================
// QR MODAL
// =========================
function openQR() {
    menuModal.style("display", "none");
    const d = window.hiddenGems;
    if (!d) return;

    qrBox.html(`
        <img src="./images/${d.photo}">
        <div class="section-title">Access</div>
        <div class="section-divider"></div>
        <ul class="drink-section">
            ${d.contents.map(c => `<li>${c}</li>`).join("")}
        </ul>
    `);

    qrModal.style("display", "flex");
}

// =========================
// SEARCH MODAL
// =========================
function openSearch() {
    menuModal.style("display", "none");

    searchBox.html(`
        <input type="text" id="searchInput" placeholder="Type to search...">
        <div id="searchResultsContainer"></div>
    `);

    const input = searchBox.select("#searchInput");
    const resultsContainer = searchBox.select("#searchResultsContainer");

    input.on("input", function() {
        const val = this.value.toLowerCase();

        const filtered = window.allDrinks.filter(d =>
            d.name !== "Hidden Gems" &&
            (d.contents.some(c => c.toLowerCase().includes(val)) ||
             d.keywords.some(k => k.toLowerCase().includes(val)) ||
             d.name.toLowerCase().includes(val))
        );

        resultsContainer.html("");

        if (filtered.length === 0) {
            resultsContainer.append("div").text("No matches found").style("color", "var(--muted)");
        } else {
            renderDrinks(filtered, resultsContainer);
        }
    });

    searchModal.style("display", "flex");
}

// =========================
// EVENT BINDINGS
// =========================
$("#menuBtn").on("click", openMenu);

$(document).on("click", ".modal-overlay", function(e) {
    if (e.target === this) closeModals();
});

$(document).on("keydown", function(e) {
    if (e.key === "Escape") closeModals();
});
