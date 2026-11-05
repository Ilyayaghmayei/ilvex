"use strict";

/* =========================================================
   ILVEX — MAIN SCRIPT
   Loading: 3 seconds
   Mobile Menu: Fixed
   File Info Tool: Included
========================================================= */

(function () {

    /* =====================================================
       LANGUAGE
    ===================================================== */

    function getLanguage() {
        if (typeof window.ilvexGetLanguage === "function") {
            return window.ilvexGetLanguage();
        }

        if (typeof window.zonivaGetLanguage === "function") {
            return window.zonivaGetLanguage();
        }

        return localStorage.getItem("ilvex-language") || "fa";
    }

    function isEnglish() {
        return getLanguage() === "en";
    }

    function fa(text, english) {
        return isEnglish() ? english : text;
    }


    /* =====================================================
       GENERAL HELPERS
    ===================================================== */

    function $(id) {
        return document.getElementById(id);
    }

    function toEnglishNumber(value) {
        if (value === undefined || value === null) {
            return "";
        }

        return String(value)
            .replace(/[۰-۹]/g, function (d) {
                return "۰۱۲۳۴۵۶۷۸۹".indexOf(d);
            })
            .replace(/[٠-٩]/g, function (d) {
                return "٠١٢٣٤٥٦٧٨٩".indexOf(d);
            });
    }

    function getNumber(value) {
        value = toEnglishNumber(value);

        if (typeof value === "string") {
            value = value.replace(/,/g, "");
        }

        return Number(value);
    }

    function formatNumber(value) {
        if (!Number.isFinite(value)) {
            return "";
        }

        return value.toLocaleString("en-US", {
            maximumFractionDigits: 10
        });
    }

    function escapeHTML(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       LOADING SCREEN — 3 SECONDS
    ===================================================== */

    function initLoadingScreen() {

        const loadingScreen =
            document.getElementById("loadingScreen");

        if (!loadingScreen) {
            return;
        }

        setTimeout(function () {

            loadingScreen.classList.add("hide");

            setTimeout(function () {
                loadingScreen.style.display = "none";
            }, 700);

        }, 3000);
    }


    /* =====================================================
       CALCULATOR
    ===================================================== */

    window.appendToDisplay = function (value) {

        const display = $("display");

        if (!display) return;

        display.value += value;
    };


    window.clearDisplay = function () {

        const display = $("display");

        if (!display) return;

        display.value = "";
    };


    window.deleteLast = function () {

        const display = $("display");

        if (!display) return;

        display.value =
            display.value.slice(0, -1);
    };


    window.calculate = function () {

        const display = $("display");

        if (!display) return;

        try {

            let expression =
                display.value;

            expression =
                expression
                    .replace(/×/g, "*")
                    .replace(/÷/g, "/")
                    .replace(/−/g, "-")
                    .replace(/,/g, "");

            if (!expression.trim()) {
                return;
            }

            const result =
                Function(
                    '"use strict"; return (' +
                    expression +
                    ')'
                )();

            if (!Number.isFinite(result)) {
                throw new Error("Invalid result");
            }

            display.value = result;

        } catch (error) {

            display.value =
                fa("خطا", "Error");
        }
    };


    /* =====================================================
       LENGTH CONVERTER
    ===================================================== */

    window.convertLength = function () {

        const input =
            $("lengthInput");

        const from =
            $("lengthFrom");

        const to =
            $("lengthTo");

        const result =
            $("lengthResult");

        if (!input || !from || !to || !result) {
            return;
        }

        const value =
            getNumber(input.value);

        if (!Number.isFinite(value)) {

            result.textContent =
                fa(
                    "یک عدد معتبر وارد کنید.",
                    "Enter a valid number."
                );

            return;
        }

        const units = {
            mm: 0.001,
            cm: 0.01,
            m: 1,
            km: 1000
        };

        if (
            !Object.prototype.hasOwnProperty.call(
                units,
                from.value
            ) ||
            !Object.prototype.hasOwnProperty.call(
                units,
                to.value
            )
        ) {
            return;
        }

        const meters =
            value * units[from.value];

        const converted =
            meters / units[to.value];

        result.textContent =
            formatNumber(converted);
    };


    /* =====================================================
       TEXT COUNTER
    ===================================================== */

    window.countText = function () {

        const input =
            $("textInput") ||
            $("counterInput");

        const result =
            $("textResult") ||
            $("counterResult");

        if (!input || !result) {
            return;
        }

        const text =
            input.value;

        const characters =
            text.length;

        const charactersWithoutSpaces =
            text.replace(/\s/g, "").length;

        const words =
            text.trim()
                ? text.trim().split(/\s+/).length
                : 0;

        result.innerHTML = `

            <div>
                ${fa(
                    "تعداد کاراکتر",
                    "Characters"
                )}:
                ${characters}
            </div>

            <div>
                ${fa(
                    "بدون فاصله",
                    "Without spaces"
                )}:
                ${charactersWithoutSpaces}
            </div>

            <div>
                ${fa(
                    "تعداد کلمات",
                    "Words"
                )}:
                ${words}
            </div>

        `;
    };


    /* =====================================================
       AVERAGE
    ===================================================== */

    window.calculateAverage = function () {

        const input =
            $("averageInput") ||
            $("gradesInput");

        const result =
            $("averageResult");

        if (!input || !result) {
            return;
        }

        const numbers =
            input.value
                .split(/[\s,،]+/)
                .map(getNumber)
                .filter(Number.isFinite);

        if (numbers.length === 0) {

            result.textContent =
                fa(
                    "نمرات خود را وارد کنید.",
                    "Enter your grades."
                );

            return;
        }

        const sum =
            numbers.reduce(
                function (total, number) {
                    return total + number;
                },
                0
            );

        const average =
            sum / numbers.length;

        result.textContent =
            fa("معدل: ", "Average: ") +
            formatNumber(average);
    };


    /* =====================================================
       FRACTION → DECIMAL
    ===================================================== */

    window.fractionToDecimal = function () {

        const input =
            $("fractionInput");

        const result =
            $("fractionResult");

        if (!input || !result) {
            return;
        }

        const value =
            toEnglishNumber(
                input.value.trim()
            );

        if (!value.includes("/")) {

            result.textContent =
                fa(
                    "کسر را به شکل 3/4 وارد کنید.",
                    "Use a format like 3/4."
                );

            return;
        }

        const parts =
            value.split("/");

        if (parts.length !== 2) {
            return;
        }

        const numerator =
            getNumber(parts[0]);

        const denominator =
            getNumber(parts[1]);

        if (
            !Number.isFinite(numerator) ||
            !Number.isFinite(denominator) ||
            denominator === 0
        ) {

            result.textContent =
                fa(
                    "کسر نامعتبر است.",
                    "Invalid fraction."
                );

            return;
        }

        result.textContent =
            formatNumber(
                numerator / denominator
            );
    };


    /* =====================================================
       DECIMAL → FRACTION
    ===================================================== */

    window.decimalToFraction = function () {

        const input =
            $("decimalInput");

        const result =
            $("decimalResult");

        if (!input || !result) {
            return;
        }

        const decimal =
            getNumber(input.value);

        if (!Number.isFinite(decimal)) {

            result.textContent =
                fa(
                    "عدد نامعتبر است.",
                    "Invalid number."
                );

            return;
        }

        let denominator = 1;

        while (
            Math.abs(
                decimal * denominator -
                Math.round(
                    decimal * denominator
                )
            ) > 1e-10 &&
            denominator < 1000000
        ) {

            denominator *= 10;
        }

        let numerator =
            Math.round(
                decimal * denominator
            );

        function gcd(a, b) {

            a = Math.abs(a);
            b = Math.abs(b);

            while (b !== 0) {

                const temp = b;

                b = a % b;

                a = temp;
            }

            return a;
        }

        const divisor =
            gcd(
                numerator,
                denominator
            );

        numerator /= divisor;
        denominator /= divisor;

        result.textContent =
            denominator === 1
                ? numerator
                : `${numerator}/${denominator}`;
    };


    /* =====================================================
       POWER
    ===================================================== */

    window.calculatePower = function () {

        const base =
            $("powerBase");

        const exponent =
            $("powerExponent");

        const result =
            $("powerResult");

        if (!base || !exponent || !result) {
            return;
        }

        const a =
            getNumber(base.value);

        const b =
            getNumber(exponent.value);

        if (
            !Number.isFinite(a) ||
            !Number.isFinite(b)
        ) {

            result.textContent =
                fa(
                    "ورودی نامعتبر است.",
                    "Invalid input."
                );

            return;
        }

        result.textContent =
            formatNumber(
                Math.pow(a, b)
            );
    };


    /* =====================================================
       ROOT
    ===================================================== */

    window.calculateRoot = function () {

        const number =
            $("rootNumber");

        const degree =
            $("rootDegree");

        const result =
            $("rootResult");

        if (!number || !degree || !result) {
            return;
        }

        const n =
            getNumber(number.value);

        const d =
            getNumber(degree.value);

        if (
            !Number.isFinite(n) ||
            !Number.isFinite(d) ||
            d === 0
        ) {

            result.textContent =
                fa(
                    "ورودی نامعتبر است.",
                    "Invalid input."
                );

            return;
        }

        result.textContent =
            formatNumber(
                Math.pow(n, 1 / d)
            );
    };


    /* =====================================================
       PASSWORD GENERATOR
    ===================================================== */

    window.generatePassword = function () {

        const lengthInput =
            $("passwordLength");

        const result =
            $("passwordResult");

        if (!result) {
            return;
        }

        let length =
            lengthInput
                ? parseInt(
                    lengthInput.value,
                    10
                )
                : 16;

        if (!Number.isFinite(length)) {
            length = 16;
        }

        length =
            Math.max(
                4,
                Math.min(
                    128,
                    length
                )
            );

        const characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
            "abcdefghijklmnopqrstuvwxyz" +
            "0123456789" +
            "!@#$%^&*()_+-=[]{}";

        let password = "";

        if (
            window.crypto &&
            window.crypto.getRandomValues
        ) {

            const values =
                new Uint32Array(length);

            window.crypto.getRandomValues(
                values
            );

            for (
                let i = 0;
                i < length;
                i++
            ) {

                password +=
                    characters[
                        values[i] %
                        characters.length
                    ];
            }

        } else {

            for (
                let i = 0;
                i < length;
                i++
            ) {

                password +=
                    characters[
                        Math.floor(
                            Math.random() *
                            characters.length
                        )
                    ];
            }
        }

        if ("value" in result) {
            result.value = password;
        }

        result.textContent =
            password;
    };


    window.copyPassword = async function () {

        const result =
            $("passwordResult");

        if (!result) {
            return;
        }

        const text =
            "value" in result
                ? result.value
                : result.textContent;

        try {

            await navigator.clipboard.writeText(
                text
            );

        } catch (error) {

            const textarea =
                document.createElement(
                    "textarea"
                );

            textarea.value =
                text;

            document.body.appendChild(
                textarea
            );

            textarea.select();

            document.execCommand(
                "copy"
            );

            textarea.remove();
        }
    };


    /* =====================================================
       DATE DIFFERENCE
    ===================================================== */

    window.calculateDateDifference = function () {

        const start =
            $("startDate");

        const end =
            $("endDate");

        const result =
            $("dateDifferenceResult");

        if (!start || !end || !result) {
            return;
        }

        const startDate =
            new Date(start.value);

        const endDate =
            new Date(end.value);

        if (
            Number.isNaN(
                startDate.getTime()
            ) ||
            Number.isNaN(
                endDate.getTime()
            )
        ) {

            result.textContent =
                fa(
                    "هر دو تاریخ را انتخاب کنید.",
                    "Select both dates."
                );

            return;
        }

        const difference =
            Math.abs(
                endDate -
                startDate
            );

        const days =
            Math.floor(
                difference /
                (1000 * 60 * 60 * 24)
            );

        const hours =
            Math.floor(
                difference /
                (1000 * 60 * 60)
            );

        result.innerHTML = `

            <div>
                ${fa(
                    `${days} روز`,
                    `${days} days`
                )}
            </div>

            <div>
                ${fa(
                    `${hours} ساعت`,
                    `${hours} hours`
                )}
            </div>

        `;
    };


    /* =====================================================
       FILE INFORMATION TOOL
    ===================================================== */

    function initFileInfoTool() {

        const input =
            document.querySelector(
                "#fileInput, #fileInfoInput, input[type='file']"
            );

        const result =
            document.querySelector(
                "#fileResult, #fileInfoResult, #fileInfo"
            );

        if (!input || !result) {
            return;
        }

        if (
            input.dataset.ilvexFileReady === "true"
        ) {
            return;
        }

        input.dataset.ilvexFileReady = "true";


        function formatFileSize(bytes) {

            if (bytes < 1024) {
                return `${bytes} B`;
            }

            if (bytes < 1024 * 1024) {
                return `${(
                    bytes / 1024
                ).toFixed(2)} KB`;
            }

            if (bytes < 1024 * 1024 * 1024) {
                return `${(
                    bytes /
                    (1024 * 1024)
                ).toFixed(2)} MB`;
            }

            return `${(
                bytes /
                (1024 * 1024 * 1024)
            ).toFixed(2)} GB`;
        }


        function getExtension(name) {

            const parts =
                name.split(".");

            if (parts.length < 2) {
                return fa(
                    "بدون فرمت",
                    "No extension"
                );
            }

            return "." +
                parts.pop().toLowerCase();
        }


        function getFileType(file) {

            if (file.type) {
                return file.type;
            }

            return fa(
                "نامشخص",
                "Unknown"
            );
        }


        function showFileInfo(file) {

            if (!file) {
                return;
            }

            const modified =
                new Date(
                    file.lastModified
                );

            result.innerHTML = `

                <div class="file-info-box">

                    <div class="file-info-row">
                        <span>
                            ${fa(
                                "نام فایل",
                                "File name"
                            )}
                        </span>

                        <strong>
                            ${escapeHTML(
                                file.name
                            )}
                        </strong>
                    </div>


                    <div class="file-info-row">
                        <span>
                            ${fa(
                                "فرمت",
                                "Extension"
                            )}
                        </span>

                        <strong>
                            ${escapeHTML(
                                getExtension(
                                    file.name
                                )
                            )}
                        </strong>
                    </div>


                    <div class="file-info-row">
                        <span>
                            ${fa(
                                "نوع فایل",
                                "File type"
                            )}
                        </span>

                        <strong>
                            ${escapeHTML(
                                getFileType(file)
                            )}
                        </strong>
                    </div>


                    <div class="file-info-row">
                        <span>
                            ${fa(
                                "حجم",
                                "Size"
                            )}
                        </span>

                        <strong>
                            ${formatFileSize(
                                file.size
                            )}
                        </strong>
                    </div>


                    <div class="file-info-row">
                        <span>
                            ${fa(
                                "آخرین تغییر",
                                "Last modified"
                            )}
                        </span>

                        <strong>
                            ${modified.toLocaleString(
                                isEnglish()
                                    ? "en-US"
                                    : "fa-IR"
                            )}
                        </strong>
                    </div>

                </div>

            `;
        }


        input.addEventListener(
            "change",
            function () {

                const file =
                    input.files &&
                    input.files[0];

                if (!file) {
                    result.innerHTML = "";
                    return;
                }

                showFileInfo(file);
            }
        );


        const dropZone =
            document.querySelector(
                "#fileDropZone, .file-drop-zone, .file-upload-area"
            );

        if (dropZone) {

            [
                "dragenter",
                "dragover"
            ].forEach(function (eventName) {

                dropZone.addEventListener(
                    eventName,
                    function (event) {

                        event.preventDefault();

                        dropZone.classList.add(
                            "dragover"
                        );
                    }
                );
            });


            [
                "dragleave",
                "drop"
            ].forEach(function (eventName) {

                dropZone.addEventListener(
                    eventName,
                    function (event) {

                        event.preventDefault();

                        dropZone.classList.remove(
                            "dragover"
                        );
                    }
                );
            });


            dropZone.addEventListener(
                "drop",
                function (event) {

                    const files =
                        event.dataTransfer &&
                        event.dataTransfer.files;

                    if (
                        !files ||
                        !files.length
                    ) {
                        return;
                    }

                    try {
                        input.files = files;
                    } catch (error) {
                        showFileInfo(
                            files[0]
                        );
                    }

                    showFileInfo(
                        files[0]
                    );
                }
            );
        }
    }


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    function setupMobileMenu() {

        const menuBtn =
            document.getElementById(
                "menuBtn"
            );

        const menu =
            document.getElementById(
                "menu"
            );

        const overlay =
            document.getElementById(
                "menuOverlay"
            );


        if (!menuBtn || !menu) {

            console.error(
                "ILVEX: Mobile menu elements not found."
            );

            return;
        }


        if (
            menuBtn.dataset.ilvexReady === "true"
        ) {
            return;
        }


        menuBtn.dataset.ilvexReady =
            "true";


        function openMenu() {

            menu.classList.add(
                "active"
            );

            menuBtn.classList.add(
                "active"
            );

            if (overlay) {

                overlay.classList.add(
                    "active"
                );
            }

            document.body.classList.add(
                "menu-open"
            );

            menuBtn.setAttribute(
                "aria-expanded",
                "true"
            );

            menuBtn.setAttribute(
                "aria-label",
                "بستن منو"
            );

            /*
             * Fallback:
             * اگر CSS قبلی باعث شد منو دیده نشود،
             * اینجا مستقیم نمایش داده می‌شود.
             */
            menu.style.visibility =
                "visible";

            menu.style.opacity =
                "1";

            menu.style.pointerEvents =
                "auto";
        }


        function closeMenu() {

            menu.classList.remove(
                "active"
            );

            menuBtn.classList.remove(
                "active"
            );

            if (overlay) {

                overlay.classList.remove(
                    "active"
                );
            }

            document.body.classList.remove(
                "menu-open"
            );

            menuBtn.setAttribute(
                "aria-expanded",
                "false"
            );

            menuBtn.setAttribute(
                "aria-label",
                "باز کردن منو"
            );

            menu.style.visibility = "";
            menu.style.opacity = "";
            menu.style.pointerEvents = "";
        }


        function toggleMenu(event) {

            event.preventDefault();
            event.stopPropagation();

            if (
                menu.classList.contains(
                    "active"
                )
            ) {

                closeMenu();

            } else {

                openMenu();
            }
        }


        menuBtn.addEventListener(
            "click",
            toggleMenu
        );


        if (overlay) {

            overlay.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    closeMenu();
                }
            );
        }


        menu.querySelectorAll("a")
            .forEach(function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        closeMenu();
                    }
                );
            });


        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape"
                ) {

                    closeMenu();
                }
            }
        );


        window.addEventListener(
            "resize",
            function () {

                if (
                    window.innerWidth > 768
                ) {

                    closeMenu();
                }
            }
        );


        window.ilvexOpenMenu =
            openMenu;

        window.ilvexCloseMenu =
            closeMenu;
    }


    /* =====================================================
       LOAD TOOLS PAGE
    ===================================================== */

    function loadToolsPageScript() {

        if (
            document.querySelector(
                'script[data-ilvex-tools-loaded="true"]'
            )
        ) {
            return;
        }

        const script =
            document.createElement(
                "script"
            );

        script.src =
            "tools-page.js";

        script.defer =
            true;

        script.dataset.ilvexToolsLoaded =
            "true";

        script.onerror =
            function () {

                console.error(
                    "ILVEX: tools-page.js could not be loaded."
                );
            };

        document.head.appendChild(
            script
        );
    }


    /* =====================================================
       ILVEX INITIALIZATION
    ===================================================== */

    function initILVEX() {

        initLoadingScreen();

        setupMobileMenu();

        initFileInfoTool();

        loadToolsPageScript();
    }


    /* =====================================================
       DOM READY
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initILVEX
        );

    } else {

        initILVEX();
    }

})();