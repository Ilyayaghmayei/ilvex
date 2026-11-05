"use strict";

/* =========================================================
   ILVEX — MAIN SCRIPT
   No Supabase
   LocalStorage based
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

        display.value = display.value.slice(0, -1);
    };


    window.calculate = function () {
        const display = $("display");

        if (!display) return;

        try {
            let expression = display.value;

            expression = expression
                .replace(/×/g, "*")
                .replace(/÷/g, "/")
                .replace(/−/g, "-")
                .replace(/,/g, "");

            if (!expression.trim()) {
                return;
            }

            const result = Function(
                '"use strict"; return (' +
                expression +
                ')'
            )();

            if (!Number.isFinite(result)) {
                throw new Error("Invalid result");
            }

            display.value = result;

        } catch (error) {

            display.value = fa(
                "خطا",
                "Error"
            );
        }
    };


    /* =====================================================
       LENGTH CONVERTER
    ===================================================== */

    window.convertLength = function () {

        const input = $("lengthInput");
        const from = $("lengthFrom");
        const to = $("lengthTo");
        const result = $("lengthResult");

        if (!input || !from || !to || !result) {
            return;
        }

        const value = getNumber(input.value);

        if (!Number.isFinite(value)) {

            result.textContent = fa(
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
            !Object.prototype.hasOwnProperty.call(units, from.value) ||
            !Object.prototype.hasOwnProperty.call(units, to.value)
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

        const text = input.value;

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
                ${fa("تعداد کاراکتر", "Characters")}:
                ${characters}
            </div>

            <div>
                ${fa("بدون فاصله", "Without spaces")}:
                ${charactersWithoutSpaces}
            </div>

            <div>
                ${fa("تعداد کلمات", "Words")}:
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

            result.textContent = fa(
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

        const input = $("fractionInput");
        const result = $("fractionResult");

        if (!input || !result) {
            return;
        }

        const value =
            toEnglishNumber(
                input.value.trim()
            );

        if (!value.includes("/")) {

            result.textContent = fa(
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

            result.textContent = fa(
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

        const input = $("decimalInput");
        const result = $("decimalResult");

        if (!input || !result) {
            return;
        }

        const decimal =
            getNumber(input.value);

        if (!Number.isFinite(decimal)) {

            result.textContent = fa(
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

        const base = $("powerBase");
        const exponent = $("powerExponent");
        const result = $("powerResult");

        if (!base || !exponent || !result) {
            return;
        }

        const a = getNumber(base.value);
        const b = getNumber(exponent.value);

        if (
            !Number.isFinite(a) ||
            !Number.isFinite(b)
        ) {

            result.textContent = fa(
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

        const number = $("rootNumber");
        const degree = $("rootDegree");
        const result = $("rootResult");

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

            result.textContent = fa(
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

            textarea.value = text;

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
            new Date(
                start.value
            );

        const endDate =
            new Date(
                end.value
            );

        if (
            Number.isNaN(
                startDate.getTime()
            ) ||
            Number.isNaN(
                endDate.getTime()
            )
        ) {

            result.textContent = fa(
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
       CURRENCY
    ===================================================== */

    window.convertCurrency = function () {

        const amount =
            $("currencyAmount");

        const rate =
            $("currencyRate");

        const result =
            $("currencyResult");

        if (!amount || !rate || !result) {
            return;
        }

        const a =
            getNumber(
                amount.value
            );

        const r =
            getNumber(
                rate.value
            );

        if (
            !Number.isFinite(a) ||
            !Number.isFinite(r)
        ) {

            result.textContent = fa(
                "ورودی نامعتبر است.",
                "Invalid input."
            );

            return;
        }

        result.textContent =
            formatNumber(
                a * r
            );
    };


    /* =====================================================
       GOLD
    ===================================================== */

    window.calculateGold = function () {

        const weight =
            $("goldWeight");

        const price =
            $("goldPrice");

        const result =
            $("goldResult");

        if (!weight || !price || !result) {
            return;
        }

        const w =
            getNumber(
                weight.value
            );

        const p =
            getNumber(
                price.value
            );

        if (
            !Number.isFinite(w) ||
            !Number.isFinite(p)
        ) {

            result.textContent = fa(
                "ورودی نامعتبر است.",
                "Invalid input."
            );

            return;
        }

        const total =
            w * p;

        result.textContent =
            formatNumber(
                total
            );
    };


    /* =====================================================
       LOCAL STORAGE — EVENTS
    ===================================================== */

    const EVENT_STORAGE_KEY =
        "ilvex-event-data";

    function getEventData() {

        try {

            const data =
                localStorage.getItem(
                    EVENT_STORAGE_KEY
                );

            if (!data) {
                return {
                    nickname: "",
                    score: 0,
                    answers: [],
                    completed: false
                };
            }

            const parsed =
                JSON.parse(data);

            return {
                nickname:
                    parsed.nickname || "",

                score:
                    Number(
                        parsed.score || 0
                    ),

                answers:
                    Array.isArray(
                        parsed.answers
                    )
                        ? parsed.answers
                        : [],

                completed:
                    Boolean(
                        parsed.completed
                    )
            };

        } catch (error) {

            return {
                nickname: "",
                score: 0,
                answers: [],
                completed: false
            };
        }
    }


    function saveEventData(data) {

        try {

            localStorage.setItem(
                EVENT_STORAGE_KEY,
                JSON.stringify(data)
            );

        } catch (error) {

            console.error(
                "ILVEX event save error:",
                error
            );
        }
    }


    /* =====================================================
       EVENT NICKNAME
    ===================================================== */

    function getNickname() {

        return (
            localStorage.getItem(
                "ilvex-nickname"
            ) ||
            getEventData().nickname ||
            ""
        );
    }


    function saveNickname(nickname) {

        localStorage.setItem(
            "ilvex-nickname",
            nickname
        );

        const data =
            getEventData();

        data.nickname =
            nickname;

        saveEventData(
            data
        );
    }


    /* =====================================================
       EVENT SCORE
    ===================================================== */

    function getEventScore() {

        return getEventData().score;
    }


    function setEventScore(score) {

        const data =
            getEventData();

        data.score =
            Number(score) || 0;

        saveEventData(
            data
        );
    }


    /* =====================================================
       EVENT ANSWERS
    ===================================================== */

    function saveEventAnswers(answers) {

        const data =
            getEventData();

        data.answers =
            answers;

        saveEventData(
            data
        );
    }


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    function setupMobileMenu() {

        const menuButton =
            document.querySelector(
                "#menuBtn, .menu-btn, .hamburger, [data-menu-button]"
            );

        const menu =
            document.querySelector(
                "#mobileMenu, #navMenu, .nav-links, [data-menu]"
            );

        const overlay =
            document.querySelector(
                "#menuOverlay, .menu-overlay, [data-menu-overlay]"
            );

        if (!menuButton || !menu) {
            return;
        }

        if (
            menuButton.dataset.ilvexReady === "true"
        ) {
            return;
        }

        menuButton.dataset.ilvexReady =
            "true";

        function openMenu() {

            menu.classList.add(
                "active"
            );

            menuButton.classList.add(
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

            menuButton.setAttribute(
                "aria-expanded",
                "true"
            );
        }


        function closeMenu() {

            menu.classList.remove(
                "active"
            );

            menuButton.classList.remove(
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

            menuButton.setAttribute(
                "aria-expanded",
                "false"
            );
        }


        function toggleMenu(event) {

            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }

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


        menuButton.addEventListener(
            "click",
            toggleMenu
        );


        if (overlay) {

            overlay.addEventListener(
                "click",
                closeMenu
            );
        }


        menu.querySelectorAll(
            "a"
        ).forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    closeMenu
                );
            }
        );


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
       INITIALIZATION
    ===================================================== */

    function initILVEX() {

        setupMobileMenu();

        if (
            location.pathname
                .toLowerCase()
                .includes("tools")
        ) {

            loadToolsPageScript();
        }

        if (
            document.querySelector(
                "#eventAnswer1"
            )
        ) {

            initEventPage();
        }

        console.log(
            "ILVEX loaded successfully 🚀"
        );
    }


    /* =====================================================
       EVENT PAGE
    ===================================================== */

    function initEventPage() {

        const data =
            getEventData();

        const score =
            $("eventScore");

        if (score) {

            score.textContent =
                data.score;
        }


        const nickname =
            getNickname();

        if (nickname) {

            const nicknameInput =
                $("eventNickname");

            if (nicknameInput) {
                nicknameInput.value =
                    nickname;
            }
        }


        for (
            let i = 0;
            i < 5;
            i++
        ) {

            const input =
                $("eventAnswer" + (i + 1));

            if (
                input &&
                data.answers[i]
            ) {

                input.value =
                    data.answers[i];
            }
        }


        const submitButton =
            $("eventSubmit");

        if (
            submitButton &&
            submitButton.dataset.ilvexEventReady !== "true"
        ) {

            submitButton.dataset.ilvexEventReady =
                "true";

            submitButton.addEventListener(
                "click",
                handleEventSubmit
            );
        }


        renderLocalLeaderboard();
    }


    /* =====================================================
       EVENT SUBMIT
    ===================================================== */

    function handleEventSubmit() {

        const answers = [];

        for (
            let i = 1;
            i <= 5;
            i++
        ) {

            const input =
                $("eventAnswer" + i);

            answers.push(
                input
                    ? input.value.trim()
                    : ""
            );
        }


        const nicknameInput =
            $("eventNickname");

        let nickname =
            nicknameInput
                ? nicknameInput.value.trim()
                : getNickname();


        if (!nickname) {

            nickname =
                "ILVEX User";
        }


        saveNickname(
            nickname
        );

        saveEventAnswers(
            answers
        );


        /*
         * فعلاً امتیاز بر اساس جواب‌های واردشده
         * ذخیره می‌شود.
         *
         * جواب‌های صحیح واقعی را می‌توانی
         * بعداً داخل همین بخش قرار بدهی.
         */

        let score = 0;

        answers.forEach(
            function (answer) {

                if (
                    answer.length > 0
                ) {

                    score++;
                }
            }
        );


        setEventScore(
            score
        );


        const scoreElement =
            $("eventScore");

        if (scoreElement) {

            scoreElement.textContent =
                score;
        }


        const message =
            $("eventMessage");

        if (message) {

            message.textContent =
                fa(
                    `امتیاز شما: ${score}`,
                    `Your score: ${score}`
                );
        }


        saveLocalLeaderboard(
            nickname,
            score
        );

        renderLocalLeaderboard();
    }


    /* =====================================================
       LOCAL LEADERBOARD
    ===================================================== */

    const LEADERBOARD_KEY =
        "ilvex-local-leaderboard";


    function getLocalLeaderboard() {

        try {

            const data =
                localStorage.getItem(
                    LEADERBOARD_KEY
                );

            if (!data) {
                return [];
            }

            const parsed =
                JSON.parse(
                    data
                );

            return Array.isArray(
                parsed
            )
                ? parsed
                : [];

        } catch (error) {

            return [];
        }
    }


    function saveLocalLeaderboard(
        nickname,
        score
    ) {

        let leaderboard =
            getLocalLeaderboard();

        leaderboard.push({
            nickname:
                nickname,

            score:
                Number(score) || 0,

            time:
                Date.now()
        });


        leaderboard.sort(
            function (a, b) {

                if (
                    b.score !==
                    a.score
                ) {

                    return (
                        b.score -
                        a.score
                    );
                }

                return (
                    a.time -
                    b.time
                );
            }
        );


        /*
         * فقط 100 رکورد آخر
         */
        leaderboard =
            leaderboard.slice(
                0,
                100
            );


        try {

            localStorage.setItem(
                LEADERBOARD_KEY,
                JSON.stringify(
                    leaderboard
                )
            );

        } catch (error) {

            console.error(
                "ILVEX leaderboard save error:",
                error
            );
        }
    }


    function renderLocalLeaderboard() {

        const element =
            $("eventLeaderboard");

        if (!element) {
            return;
        }

        const leaderboard =
            getLocalLeaderboard();


        if (
            leaderboard.length === 0
        ) {

            element.innerHTML = `
                <div class="leaderboard-empty">
                    ${fa(
                        "هنوز رتبه‌ای ثبت نشده است.",
                        "No scores yet."
                    )}
                </div>
            `;

            return;
        }


        element.innerHTML = "";


        leaderboard
            .slice(0, 5)
            .forEach(
                function (
                    player,
                    index
                ) {

                    const row =
                        document.createElement(
                            "div"
                        );

                    row.className =
                        "leaderboard-row";

                    row.innerHTML = `
                        <span class="rank">
                            ${index + 1}
                        </span>

                        <span class="nickname">
                            ${escapeHTML(
                                player.nickname
                            )}
                        </span>

                        <span class="score">
                            ${player.score}
                        </span>
                    `;

                    element.appendChild(
                        row
                    );
                }
            );
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

})();/* =========================================
   ILVEX GOD MODE LOADING EXIT
========================================= */

window.addEventListener("load", () => {

    const loadingScreen = document.getElementById("loadingScreen");

    if (!loadingScreen) return;

    // لودینگ دقیقاً 3 ثانیه روی صفحه بماند
    setTimeout(() => {

        // شروع انیمیشن خروج
        loadingScreen.classList.add("ilvex-loading-exit");

        // بعد از تمام شدن انیمیشن، کامل حذف شود
        setTimeout(() => {
            loadingScreen.remove();
        }, 1500);

    }, 3000);

});