/* =========================================================
   ILVEX — MAIN SCRIPT
========================================================= */

(() => {
    "use strict";

    /* =========================================================
       MOBILE MENU
    ========================================================= */

    function setupMobileMenu() {
        const menuButton = document.querySelector(
            "#menuBtn, .menu-btn, .hamburger, [data-menu-button]"
        );

        const menu = document.querySelector(
            "#mobileMenu, #navMenu, .nav-links, [data-menu]"
        );

        const overlay = document.querySelector(
            "#menuOverlay, .menu-overlay, [data-menu-overlay]"
        );

        if (!menuButton || !menu) {
            return;
        }

        const closeMenu = () => {
            menu.classList.remove("active");

            if (overlay) {
                overlay.classList.remove("active");
            }

            document.body.classList.remove("menu-open");

            menuButton.setAttribute("aria-expanded", "false");
        };

        const openMenu = () => {
            menu.classList.add("active");

            if (overlay) {
                overlay.classList.add("active");
            }

            document.body.classList.add("menu-open");

            menuButton.setAttribute("aria-expanded", "true");
        };

        const toggleMenu = () => {
            if (menu.classList.contains("active")) {
                closeMenu();
            } else {
                openMenu();
            }
        };

        menuButton.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleMenu();
        });

        if (overlay) {
            overlay.addEventListener("click", () => {
                closeMenu();
            });
        }

        menu.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                closeMenu();
            });
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeMenu();
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 768) {
                closeMenu();
            }
        });
    }


    /* =========================================================
       TOOLS PAGE
    ========================================================= */

    function loadToolsPageScript() {
        const isToolsPage =
            window.location.pathname.includes("tools.html") ||
            document.querySelector(".tools-container") ||
            document.querySelector("[data-tools-page]");

        if (!isToolsPage) {
            return;
        }

        if (document.querySelector('script[data-tools-script="loaded"]')) {
            return;
        }

        const script = document.createElement("script");

        script.src = "tools-page.js";
        script.defer = true;
        script.dataset.toolsScript = "loaded";

        document.head.appendChild(script);
    }


    /* =========================================================
       EVENT PAGE
    ========================================================= */

    function initEventPage() {
        const eventPage =
            document.querySelector("[data-event-page]") ||
            document.querySelector(".event-page");

        if (!eventPage) {
            return;
        }

        // Event page initialization
        // Logic can be added here without affecting the main site.
    }


    /* =========================================================
       ILVEX INITIALIZATION
    ========================================================= */

    function initILVEX() {
        setupMobileMenu();
        loadToolsPageScript();
        initEventPage();
    }


    /* =========================================================
       DOM READY
    ========================================================= */

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initILVEX);
    } else {
        initILVEX();
    }


    /* =========================================================
       LOADING SCREEN
    ========================================================= */

    document.addEventListener("DOMContentLoaded", () => {
        const loadingScreen = document.getElementById("loadingScreen");

        if (!loadingScreen) {
            return;
        }

        setTimeout(() => {
            loadingScreen.classList.add("hidden");

            setTimeout(() => {
                loadingScreen.style.display = "none";
            }, 700);

        }, 3000);
    });

})();