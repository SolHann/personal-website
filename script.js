const btn = document.querySelector("[data-toggle='dark']")

function applyDarkMode(isDark) {
    document.body.classList.toggle("dark-theme", isDark);
    if (btn) btn.textContent = isDark ? "Light-Mode" : "Dark-Mode";
}

// Restore saved preference on load
applyDarkMode(localStorage.getItem("darkMode") === "true");

if (btn) {
    btn.addEventListener("click", function () {
        const isDark = document.body.classList.toggle("dark-theme");
        localStorage.setItem("darkMode", isDark);
        btn.textContent = isDark ? "Light-Mode" : "Dark-Mode";
    });
}
