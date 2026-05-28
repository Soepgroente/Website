const pages = {
    home: document.getElementById("homepage"),
    fractals: document.getElementById("fractals-page"),
    empty1: document.getElementById("empty1-page"),
    empty2: document.getElementById("empty2-page"),
    empty3: document.getElementById("empty3-page"),
};
let currentPage = "home";
function showPage(page) {
    for (const key in pages) {
        pages[key].classList.remove("active");
        pages[key].style.display = "none";
    }
    pages[page].classList.add("active");
    pages[page].style.display = "block";
    currentPage = page;
    if (page == "fractals") {
        document.body.style.overflow = "hidden";
    }
    else {
        document.body.style.overflow = "";
    }
}
// Hook up project buttons
document.getElementById("project-buttons").addEventListener("click", e => {
    if (e.target instanceof HTMLButtonElement) {
        showPage(e.target.dataset.project);
    }
});
// Back buttons
document.querySelectorAll(".spa-back").forEach(btn => {
    btn.addEventListener("click", () => showPage("home"));
});
// On load
showPage("home");
export {};
//# sourceMappingURL=nav.js.map