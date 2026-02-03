// =========================
// FORCE DARK MODE DEFAULT
// =========================
$("html").attr("data-theme", "dark");

// =========================
// APP ROOT
// =========================
const app = d3.select("body").append("div").attr("class", "app");

// =========================
// CORNER MENU
// =========================
const cornerMenu = d3.select("body").append("div").attr("class", "corner-menu");
cornerMenu.append("button").attr("id", "themeToggle").text("Theme");

// =========================
// HEADER
// =========================
const header = app.append("div").attr("class", "header");
header.append("h1").text("SECRET MENU");
header.append("div").attr("class", "header-divider");

// =========================
// MENU CONTAINER
// =========================
const menu = app.append("div").attr("id", "menu");

// =========================
// LOAD DATA AND SORT ALPHABETICALLY
// =========================
d3.json("./data.json").then(data => {
    const sortedDrinks = data.drinks.sort((a, b) => a.name.localeCompare(b.name));
    renderDrinks(sortedDrinks);
});

// =========================
// RENDER DRINKS
// =========================
function renderDrinks(drinks) {
    const drink = menu.selectAll(".drink")
        .data(drinks, d => d.name)
        .enter()
        .append("div")
        .attr("class", "drink");

    // IMAGE OR FALLBACK DIV AT TOP
    drink.each(function(d) {
        const container = d3.select(this);
        const imgSrc = `./images/${d.photo || "placeholder.jpg"}`;

        const img = container.append("img")
            .attr("src", imgSrc)
            .attr("alt", d.name);

        img.on("error", function() {
            img.remove(); // remove broken img
            container.insert("div", ":first-child") // insert at top
                .attr("class", "drink-no-photo")
                .html(`<h1>No Image Available</h1>`);
        });
    });

    // Drink name
    drink.append("h2")
        .attr("class", "drink-name")
        .text(d => d.name);

    // CONTENTS
    drink.filter(d => d.contents?.length).each(function(d) {
        d3.select(this).append("div").attr("class", "section-title").text("Contents");
        d3.select(this).append("ul").attr("class", "drink-section")
            .selectAll("li").data(d.contents).enter().append("li").text(d => d);
    });

    // DESCRIPTION
    drink.filter(d => d.description?.length).each(function(d) {
        d3.select(this).append("div").attr("class", "section-title").text("Description");
        d3.select(this).append("ul").attr("class", "drink-section")
            .selectAll("li").data(d.description).enter().append("li").text(d => d);
    });

    // ALLERGENS
    drink.filter(d => d.allergens?.length).each(function(d) {
        d3.select(this).append("div").attr("class", "section-title").text("Allergens");
        d3.select(this).append("ul").attr("class", "drink-section")
            .selectAll("li").data(d.allergens).enter()
            .append("li").attr("class", "allergen")
            .text(d => `Contains ${d}`);
    });
}

// =========================
// THEME TOGGLE BUTTON
// =========================
$("#themeToggle").on("click", () => {
    const html = $("html");
    html.attr(
        "data-theme",
        html.attr("data-theme") === "classic" ? "dark" : "classic"
    );
});
