/* =====================================================
   ilvex 2.0
   Main JavaScript
   Tools + Market Prices + Security
===================================================== */

"use strict";


/* =====================================================
   1. ابزارهای عمومی
===================================================== */

function toEnglishDigits(value) {
    const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
    const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

    return String(value ?? "")
        .replace(/[۰-۹]/g, d => persianDigits.indexOf(d))
        .replace(/[٠-٩]/g, d => arabicDigits.indexOf(d))
        .replace(/٫/g, ".")
        .replace(/٬/g, "")
        .replace(/،/g, ",");
}

function getNumber(id) {
    const element = document.getElementById(id);

    if (!element) return NaN;

    const value = toEnglishDigits(element.value)
        .replace(/[\s,]/g, "")
        .trim();

    return value === "" ? NaN : Number(value);
}

function formatNumber(value, digits = 2) {
    if (!Number.isFinite(value)) return "—";

    const language =
        typeof window.ilvexGetLanguage === "function"
            ? window.ilvexGetLanguage()
            : "fa";

    return new Intl.NumberFormat(
        language === "en" ? "en-US" : "fa-IR",
        {
            maximumFractionDigits: digits
        }
    ).format(value);
}

function showResult(id, message) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = String(message);
    }
}

function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);

    while (b) {
        [a, b] = [b, a % b];
    }

    return a || 1;
}


/* =====================================================
   2. ماشین‌حساب امن
===================================================== */

function safeCalculateExpression(source) {
    const expression = toEnglishDigits(source)
        .replace(/[×]/g, "*")
        .replace(/[÷]/g, "/")
        .replace(/[−–]/g, "-")
        .trim();

    if (!expression) {
        throw new Error("empty");
    }

    if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
        throw new Error("invalid-characters");
    }

    const tokenPattern = /\d+(?:\.\d*)?|\.\d+|[()+*/-]/g;
    const tokens = expression.match(tokenPattern) || [];

    if (tokens.join("") !== expression.replace(/\s/g, "")) {
        throw new Error("invalid-expression");
    }

    let position = 0;

    function peek() {
        return tokens[position];
    }

    function consume() {
        return tokens[position++];
    }

    function parsePrimary() {
        const token = peek();

        if (token === undefined) {
            throw new Error("unexpected-end");
        }

        if (token === "(") {
            consume();

            const value = parseExpression();

            if (peek() !== ")") {
                throw new Error("missing-parenthesis");
            }

            consume();

            return value;
        }

        if (
            token === ")" ||
            token === "*" ||
            token === "/"
        ) {
            throw new Error("invalid-number");
        }

        if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(token)) {
            throw new Error("invalid-number");
        }

        consume();

        const number = Number(token);

        if (!Number.isFinite(number)) {
            throw new Error("invalid-number");
        }

        return number;
    }

    function parseUnary() {
        if (peek() === "+") {
            consume();
            return parseUnary();
        }

        if (peek() === "-") {
            consume();
            return -parseUnary();
        }

        return parsePrimary();
    }

    function parseTerm() {
        let value = parseUnary();

        while (peek() === "*" || peek() === "/") {
            const operator = consume();
            const right = parseUnary();

            if (operator === "*") {
                value *= right;
            } else {
                if (right === 0) {
                    throw new Error("division-by-zero");
                }

                value /= right;
            }

            if (!Number.isFinite(value)) {
                throw new Error("overflow");
            }
        }

        return value;
    }

    function parseExpression() {
        let value = parseTerm();

        while (peek() === "+" || peek() === "-") {
            const operator = consume();
            const right = parseTerm();

            if (operator === "+") {
                value += right;
            } else {
                value -= right;
            }

            if (!Number.isFinite(value)) {
                throw new Error("overflow");
            }
        }

        return value;
    }

    const result = parseExpression();

    if (position !== tokens.length) {
        throw new Error("unexpected-token");
    }

    if (!Number.isFinite(result)) {
        throw new Error("invalid-result");
    }

    return result;
}

function calculate() {
    const input = document.getElementById("calcInput");

    if (!input) return;

    try {
        const result = safeCalculateExpression(input.value);

        showResult("calcResult", formatNumber(result, 10));
    } catch (error) {
        const language = window.ilvexGetLanguage?.() || "fa";

        const messages = {
            empty: {
                fa: "لطفاً عبارت ریاضی را وارد کنید.",
                en: "Please enter a mathematical expression."
            },

            "invalid-characters": {
                fa: "عبارت شامل نویسه‌های غیرمجاز است.",
                en: "The expression contains invalid characters."
            },

            "division-by-zero": {
                fa: "تقسیم بر صفر تعریف نشده است.",
                en: "Division by zero is undefined."
            },

            overflow: {
                fa: "نتیجه خارج از محدوده قابل محاسبه است.",
                en: "The result is outside the supported range."
            }
        };

        const message =
            messages[error.message]?.[language] ||
            (
                language === "en"
                    ? "The mathematical expression is invalid."
                    : "عبارت ریاضی صحیح نیست."
            );

        showResult("calcResult", message);
    }
}


/* =====================================================
   3. مدیریت پنجره‌های ابزار
===================================================== */

function openTool(id) {
    const modal = document.getElementById(id);

    if (!modal) return;

    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

    const focusable = modal.querySelector(
        "input:not([type=hidden]), textarea, select, button"
    );

    if (focusable) {
        setTimeout(() => focusable.focus(), 0);
    }
}

function closeTool(id) {
    const modal = document.getElementById(id);

    if (!modal) return;

    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");

    const openModals = Array.from(
        document.querySelectorAll(".modal, .tool-modal")
    ).some(item => getComputedStyle(item).display !== "none");

    if (!openModals) {
        document.body.style.overflow = "";
    }
}


/* =====================================================
   4. شمارش متن
===================================================== */

function updateTextCounts() {
    const input = document.getElementById("textInput");

    if (!input) return;

    const text = input.value;

    const words = text.trim()
        ? text.trim().split(/\s+/u).length
        : 0;

    showResult("wordCount", formatNumber(words, 0));

    showResult(
        "charCount",
        formatNumber(text.length, 0)
    );

    showResult(
        "charNoSpaceCount",
        formatNumber(text.replace(/\s/g, "").length, 0)
    );

    showResult(
        "lineCount",
        formatNumber(
            text.length ? text.split(/\r\n|\r|\n/).length : 0,
            0
        )
    );
}


/* =====================================================
   5. تبدیل واحد طول
===================================================== */

function convertUnit() {
    const value = getNumber("unitInput");

    const from = document.getElementById("unitFrom");
    const to = document.getElementById("unitTo");

    if (!from || !to) return;

    const language = window.ilvexGetLanguage?.() || "fa";

    if (!Number.isFinite(value)) {
        return showResult(
            "unitResult",
            language === "en"
                ? "Please enter a valid number."
                : "لطفاً یک عدد معتبر وارد کنید."
        );
    }

    const factors = {
        mm: 0.001,
        cm: 0.01,
        m: 1,
        km: 1000
    };

    if (
        !Object.hasOwn(factors, from.value) ||
        !Object.hasOwn(factors, to.value)
    ) {
        return showResult(
            "unitResult",
            language === "en"
                ? "Please select valid units."
                : "واحدهای انتخاب‌شده معتبر نیستند."
        );
    }

    const result =
        value * factors[from.value] / factors[to.value];

    showResult("unitResult", formatNumber(result, 8));
}


/* =====================================================
   6. محاسبه معدل
===================================================== */

function calculateGrade() {
    const input = document.getElementById("gradeInput");

    if (!input) return;

    const language = window.ilvexGetLanguage?.() || "fa";

    const raw = toEnglishDigits(input.value).trim();

    if (!raw) {
        return showResult(
            "gradeResult",
            language === "en"
                ? "Please enter your grades."
                : "لطفاً نمره‌ها را وارد کنید."
        );
    }

    const grades = raw
        .split(/[\s,،;]+/)
        .filter(Boolean)
        .map(Number);

    if (
        grades.length === 0 ||
        grades.some(
            grade => !Number.isFinite(grade) ||
            grade < 0 ||
            grade > 20
        )
    ) {
        return showResult(
            "gradeResult",
            language === "en"
                ? "Enter valid grades between 0 and 20."
                : "نمره‌های معتبر بین ۰ تا ۲۰ وارد کنید."
        );
    }

    const average =
        grades.reduce((sum, grade) => sum + grade, 0) /
        grades.length;

    showResult(
        "gradeResult",
        language === "en"
            ? `Your average: ${formatNumber(average, 2)}`
            : `معدل شما: ${formatNumber(average, 2)}`
    );
}/* =====================================================
   7. تبدیل کسر به اعشار و برعکس
===================================================== */

function fractionToDecimal() {
    const numerator = getNumber("fractionNumerator");
    const denominator = getNumber("fractionDenominator");

    const language = window.ilvexGetLanguage?.() || "fa";

    if (
        !Number.isFinite(numerator) ||
        !Number.isFinite(denominator)
    ) {
        return showResult(
            "fractionResult",
            language === "en"
                ? "Please enter valid numbers."
                : "لطفاً اعداد معتبر وارد کنید."
        );
    }

    if (denominator === 0) {
        return showResult(
            "fractionResult",
            language === "en"
                ? "The denominator cannot be zero."
                : "مخرج کسر نمی‌تواند صفر باشد."
        );
    }

    const result = numerator / denominator;

    showResult(
        "fractionResult",
        formatNumber(result, 10)
    );
}


function decimalToFraction() {
    const input = document.getElementById("decimalInput");

    if (!input) return;

    const value = Number(
        toEnglishDigits(input.value).replace(/,/g, "")
    );

    const language = window.ilvexGetLanguage?.() || "fa";

    if (!Number.isFinite(value)) {
        return showResult(
            "decimalResult",
            language === "en"
                ? "Please enter a valid decimal number."
                : "لطفاً یک عدد اعشاری معتبر وارد کنید."
        );
    }

    const precision = 1000000;

    let numerator = Math.round(value * precision);
    let denominator = precision;

    const divisor = gcd(numerator, denominator);

    numerator /= divisor;
    denominator /= divisor;

    showResult(
        "decimalResult",
        `${numerator} / ${denominator}`
    );
}


/* =====================================================
   8. تولید رمز عبور
===================================================== */

function generatePassword() {
    const lengthInput = document.getElementById("passwordLength");

    const length = lengthInput
        ? Number(toEnglishDigits(lengthInput.value))
        : 12;

    const language = window.ilvexGetLanguage?.() || "fa";

    if (
        !Number.isInteger(length) ||
        length < 4 ||
        length > 128
    ) {
        return showResult(
            "passwordResult",
            language === "en"
                ? "Password length must be between 4 and 128."
                : "طول رمز عبور باید بین ۴ تا ۱۲۸ باشد."
        );
    }

    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()-_=+[]{}";

    const characters =
        lowercase + uppercase + numbers + symbols;

    const randomValues = new Uint32Array(length);

    crypto.getRandomValues(randomValues);

    let password = "";

    for (let i = 0; i < length; i++) {
        password += characters[
            randomValues[i] % characters.length
        ];
    }

    const output = document.getElementById("passwordResult");

    if (output) {
        output.textContent = password;
    }
}


async function copyPassword() {
    const output = document.getElementById("passwordResult");

    if (!output || !output.textContent.trim()) return;

    const language = window.ilvexGetLanguage?.() || "fa";

    try {
        await navigator.clipboard.writeText(
            output.textContent.trim()
        );

        showResult(
            "passwordCopyStatus",
            language === "en"
                ? "Password copied!"
                : "رمز عبور کپی شد!"
        );
    } catch (error) {
        showResult(
            "passwordCopyStatus",
            language === "en"
                ? "Copy failed."
                : "کپی کردن ناموفق بود."
        );
    }
}


/* =====================================================
   9. توان و ریشه
===================================================== */

function calculatePower() {
    const base = getNumber("powerBase");
    const exponent = getNumber("powerExponent");

    const language = window.ilvexGetLanguage?.() || "fa";

    if (
        !Number.isFinite(base) ||
        !Number.isFinite(exponent)
    ) {
        return showResult(
            "powerResult",
            language === "en"
                ? "Please enter valid numbers."
                : "لطفاً اعداد معتبر وارد کنید."
        );
    }

    const result = Math.pow(base, exponent);

    if (!Number.isFinite(result)) {
        return showResult(
            "powerResult",
            language === "en"
                ? "The result is invalid."
                : "نتیجه قابل محاسبه نیست."
        );
    }

    showResult(
        "powerResult",
        formatNumber(result, 10)
    );
}


function calculateRoot() {
    const number = getNumber("rootNumber");
    const degree = getNumber("rootDegree");

    const language = window.ilvexGetLanguage?.() || "fa";

    if (
        !Number.isFinite(number) ||
        !Number.isInteger(degree) ||
        degree === 0
    ) {
        return showResult(
            "rootResult",
            language === "en"
                ? "Enter a valid number and non-zero integer degree."
                : "عدد و درجه ریشه معتبر وارد کنید."
        );
    }

    if (number < 0 && degree % 2 === 0) {
        return showResult(
            "rootResult",
            language === "en"
                ? "Even roots of negative numbers are not real."
                : "ریشه زوج عدد منفی در اعداد حقیقی تعریف نشده است."
        );
    }

    let result;

    if (number < 0) {
        result = -Math.pow(
            Math.abs(number),
            1 / degree
        );
    } else {
        result = Math.pow(number, 1 / degree);
    }

    if (!Number.isFinite(result)) {
        return showResult(
            "rootResult",
            language === "en"
                ? "The result is invalid."
                : "نتیجه معتبر نیست."
        );
    }

    showResult(
        "rootResult",
        formatNumber(result, 10)
    );
}


/* =====================================================
   10. اختلاف تاریخ
===================================================== */

function calculateDateDifference() {
    const startInput = document.getElementById("startDate");
    const endInput = document.getElementById("endDate");

    const language = window.ilvexGetLanguage?.() || "fa";

    if (!startInput || !endInput) return;

    if (!startInput.value || !endInput.value) {
        return showResult(
            "dateResult",
            language === "en"
                ? "Please select both dates."
                : "لطفاً هر دو تاریخ را انتخاب کنید."
        );
    }

    const startDate = new Date(
        `${startInput.value}T00:00:00`
    );

    const endDate = new Date(
        `${endInput.value}T00:00:00`
    );

    if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime())
    ) {
        return showResult(
            "dateResult",
            language === "en"
                ? "Invalid date."
                : "تاریخ واردشده معتبر نیست."
        );
    }

    const difference = Math.abs(
        endDate.getTime() - startDate.getTime()
    );

    const days = Math.floor(
        difference / (1000 * 60 * 60 * 24)
    );

    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;

    const result = language === "en"
        ? `${days} days (${weeks} weeks and ${remainingDays} days)`
        : `${formatNumber(days, 0)} روز ( ${formatNumber(weeks, 0)} هفته و ${formatNumber(remainingDays, 0)} روز )`;

    showResult("dateResult", result);
}


/* =====================================================
   11. راه‌اندازی رویدادهای ابزارها
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const textInput = document.getElementById("textInput");

    if (textInput) {
        textInput.addEventListener(
            "input",
            updateTextCounts
        );

        updateTextCounts();
    }

    const calcInput = document.getElementById("calcInput");

    if (calcInput) {
        calcInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                calculate();
            }
        });
    }

    document.querySelectorAll("[data-close-modal]").forEach(button => {
        button.addEventListener("click", function () {
            const modal = button.closest(".modal, .tool-modal");

            if (modal && modal.id) {
                closeTool(modal.id);
            }
        });
    });

    document.querySelectorAll(".modal, .tool-modal").forEach(modal => {
        modal.addEventListener("click", function (event) {
            if (event.target === modal) {
                closeTool(modal.id);
            }
        });
    });

});/* =====================================================
   12. دریافت قیمت ارز و طلا
===================================================== */

const ILVEX_MARKET_API = {
    currency: "https://api.exchangerate-api.com/v4/latest/USD",
    gold: "https://api.gold-api.com/price/XAU"
};

async function fetchCurrencyPrices() {
    const language = window.ilvexGetLanguage?.() || "fa";

    try {
        const response = await fetch(ILVEX_MARKET_API.currency);

        if (!response.ok) {
            throw new Error("Currency API error");
        }

        const data = await response.json();

        const rates = data.rates;

        if (!rates) {
            throw new Error("Invalid currency data");
        }

        const usdToEur = rates.EUR;
        const usdToTry = rates.TRY;
        const usdToGbp = rates.GBP;

        showResult(
            "eurRate",
            usdToEur
                ? formatNumber(usdToEur, 4)
                : "—"
        );

        showResult(
            "tryRate",
            usdToTry
                ? formatNumber(usdToTry, 2)
                : "—"
        );

        showResult(
            "gbpRate",
            usdToGbp
                ? formatNumber(usdToGbp, 4)
                : "—"
        );

        showResult(
            "currencyUpdate",
            language === "en"
                ? "Prices updated successfully."
                : "قیمت‌ها با موفقیت به‌روزرسانی شدند."
        );

    } catch (error) {
        showResult(
            "currencyUpdate",
            language === "en"
                ? "Unable to retrieve currency prices."
                : "دریافت قیمت ارز امکان‌پذیر نیست."
        );

        console.error("ILVEX Currency Error:", error);
    }
}


/* =====================================================
   13. دریافت قیمت جهانی طلا
===================================================== */

async function fetchGoldPrice() {
    const language = window.ilvexGetLanguage?.() || "fa";

    try {
        const response = await fetch(ILVEX_MARKET_API.gold);

        if (!response.ok) {
            throw new Error("Gold API error");
        }

        const data = await response.json();

        const price = Number(
            data.price || data.ask || data.bid
        );

        if (!Number.isFinite(price)) {
            throw new Error("Invalid gold price");
        }

        showResult(
            "goldPrice",
            formatNumber(price, 2)
        );

        showResult(
            "goldUpdate",
            language === "en"
                ? "Gold price updated."
                : "قیمت طلا به‌روزرسانی شد."
        );

    } catch (error) {
        showResult(
            "goldUpdate",
            language === "en"
                ? "Unable to retrieve gold price."
                : "دریافت قیمت طلا امکان‌پذیر نیست."
        );

        console.error("ILVEX Gold Error:", error);
    }
}


/* =====================================================
   14. به‌روزرسانی اطلاعات بازار
===================================================== */

async function updateMarketPrices() {
    await Promise.allSettled([
        fetchCurrencyPrices(),
        fetchGoldPrice()
    ]);
}


/* =====================================================
   15. زمان آخرین به‌روزرسانی
===================================================== */

function updateMarketTime() {
    const language = window.ilvexGetLanguage?.() || "fa";

    const now = new Date();

    const formatted = new Intl.DateTimeFormat(
        language === "en" ? "en-US" : "fa-IR",
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    ).format(now);

    showResult(
        "marketLastUpdate",
        language === "en"
            ? `Last update: ${formatted}`
            : `آخرین به‌روزرسانی: ${formatted}`
    );
}


/* =====================================================
   16. مدیریت منوی موبایل
===================================================== */

function setupMobileMenu() {
    const menuButton = document.getElementById("menuToggle");

    const mobileMenu = document.getElementById("mobileMenu");

    if (!menuButton || !mobileMenu) return;

    function closeMenu() {
        mobileMenu.classList.remove("active");

        menuButton.classList.remove("active");

        menuButton.setAttribute("aria-expanded", "false");
    }

    function toggleMenu() {
        const isOpen = mobileMenu.classList.toggle("active");

        menuButton.classList.toggle("active", isOpen);

        menuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    }

    menuButton.addEventListener("click", function (event) {
        event.stopPropagation();

        toggleMenu();
    });

    mobileMenu.addEventListener("click", function (event) {
        const link = event.target.closest("a");

        if (link) {
            closeMenu();
        }

        event.stopPropagation();
    });

    document.addEventListener("click", function (event) {
        if (
            !mobileMenu.contains(event.target) &&
            !menuButton.contains(event.target)
        ) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeMenu();
        }
    });
}


/* =====================================================
   17. راه‌اندازی ابزارها و منو
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    setupMobileMenu();

    updateMarketPrices();

    updateMarketTime();

    setInterval(updateMarketPrices, 5 * 60 * 1000);

    setInterval(updateMarketTime, 1000);

});