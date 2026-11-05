"use strict";

/* =========================================================
   ILVEX TOOLS PAGE
   Compatible with current tools.html
   No Supabase
========================================================= */

(function () {

    /* =====================================================
       HELPERS
    ===================================================== */

    function $(id) {
        return document.getElementById(id);
    }

    function fa(persian, english) {
        const lang =
            typeof window.ilvexGetLanguage === "function"
                ? window.ilvexGetLanguage()
                : localStorage.getItem("ilvex-language") || "fa";

        return lang === "en" ? english : persian;
    }

    function toEnglishNumber(value) {
        return String(value || "")
            .replace(/[۰-۹]/g, function (d) {
                return "۰۱۲۳۴۵۶۷۸۹".indexOf(d);
            })
            .replace(/[٠-٩]/g, function (d) {
                return "٠١٢٣٤٥٦٧٨٩".indexOf(d);
            });
    }

    function number(value) {
        return Number(
            toEnglishNumber(value)
                .replace(/,/g, "")
                .trim()
        );
    }

    function format(value) {
        if (!Number.isFinite(value)) {
            return "";
        }

        return value.toLocaleString("en-US", {
            maximumFractionDigits: 10
        });
    }


    /* =====================================================
       MODAL SYSTEM
    ===================================================== */

    window.openTool = function (id) {

        const modal = $(id);

        if (!modal) {
            console.error(
                "ILVEX: Modal not found:",
                id
            );
            return;
        }

        modal.style.display = "flex";

        document.body.style.overflow = "hidden";

        const firstInput =
            modal.querySelector(
                "input, textarea, select"
            );

        if (firstInput) {
            setTimeout(function () {
                firstInput.focus();
            }, 50);
        }
    };


    window.closeTool = function (id) {

        const modal = $(id);

        if (!modal) {
            return;
        }

        modal.style.display = "none";

        /*
         * فقط وقتی هیچ مودالی باز نیست،
         * اسکرول بدن آزاد شود.
         */

        const openModal =
            document.querySelector(
                ".modal[style*='display: flex']"
            );

        if (!openModal) {
            document.body.style.overflow = "";
        }
    };


    /*
     * بستن با کلیک روی فضای بیرون مودال
     */

    document.addEventListener(
        "click",
        function (event) {

            if (
                event.target.classList.contains("modal")
            ) {

                event.target.style.display =
                    "none";

                document.body.style.overflow =
                    "";
            }
        }
    );


    /*
     * بستن با ESC
     */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key !== "Escape") {
                return;
            }

            const modals =
                document.querySelectorAll(
                    ".modal"
                );

            modals.forEach(function (modal) {

                if (
                    getComputedStyle(modal).display !==
                    "none"
                ) {

                    modal.style.display =
                        "none";
                }
            });

            document.body.style.overflow =
                "";
        }
    );


    /* =====================================================
       TEXT COUNTER
    ===================================================== */

    function updateTextCounter() {

        const input =
            $("textInput");

        if (!input) {
            return;
        }

        const text =
            input.value;

        const words =
            text.trim()
                ? text.trim().split(/\s+/).length
                : 0;

        const chars =
            text.length;

        const charsNoSpace =
            text.replace(/\s/g, "").length;

        const lines =
            text
                ? text.split(/\r\n|\r|\n/).length
                : 0;

        const wordCount =
            $("wordCount");

        const charCount =
            $("charCount");

        const charNoSpaceCount =
            $("charNoSpaceCount");

        const lineCount =
            $("lineCount");

        if (wordCount) {
            wordCount.textContent =
                format(words);
        }

        if (charCount) {
            charCount.textContent =
                format(chars);
        }

        if (charNoSpaceCount) {
            charNoSpaceCount.textContent =
                format(charsNoSpace);
        }

        if (lineCount) {
            lineCount.textContent =
                format(lines);
        }
    }


    const textInput =
        $("textInput");

    if (textInput) {

        textInput.addEventListener(
            "input",
            updateTextCounter
        );

        updateTextCounter();
    }


    /* =====================================================
       CALCULATOR
    ===================================================== */

    window.calculate = function () {

        const input =
            $("calcInput");

        const result =
            $("calcResult");

        if (!input || !result) {
            return;
        }

        let expression =
            toEnglishNumber(
                input.value
            );

        expression =
            expression
                .replace(/×/g, "*")
                .replace(/÷/g, "/")
                .replace(/−/g, "-")
                .replace(/,/g, "");

        if (!expression.trim()) {

            result.textContent =
                fa(
                    "لطفاً یک عبارت وارد کنید.",
                    "Please enter an expression."
                );

            return;
        }

        /*
         * فقط کاراکترهای موردنیاز
         * برای محاسبات ساده اجازه داده می‌شوند.
         */

        if (
            !/^[0-9+\-*/().%\s]+$/.test(
                expression
            )
        ) {

            result.textContent =
                fa(
                    "عبارت نامعتبر است.",
                    "Invalid expression."
                );

            return;
        }

        try {

            const value =
                Function(
                    '"use strict"; return (' +
                    expression +
                    ')'
                )();

            if (!Number.isFinite(value)) {
                throw new Error(
                    "Invalid result"
                );
            }

            result.textContent =
                format(value);

        } catch (error) {

            result.textContent =
                fa(
                    "محاسبه انجام نشد.",
                    "Calculation failed."
                );
        }
    };


    /* =====================================================
       UNIT CONVERTER
    ===================================================== */

    window.convertUnit = function () {

        const input =
            $("unitInput");

        const from =
            $("unitFrom");

        const to =
            $("unitTo");

        const result =
            $("unitResult");

        if (
            !input ||
            !from ||
            !to ||
            !result
        ) {
            return;
        }

        const value =
            number(input.value);

        if (!Number.isFinite(value)) {

            result.textContent =
                fa(
                    "یک مقدار معتبر وارد کنید.",
                    "Enter a valid value."
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
            units[from.value] === undefined ||
            units[to.value] === undefined
        ) {
            return;
        }

        const meters =
            value *
            units[from.value];

        const converted =
            meters /
            units[to.value];

        result.innerHTML = `
            <div>
                ${fa(
                    "نتیجه",
                    "Result"
                )}:
                <strong>
                    ${format(converted)}
                </strong>
            </div>
        `;
    };


    /* =====================================================
       GRADE CALCULATOR
    ===================================================== */

    window.calculateGrade = function () {

        const input =
            $("gradeInput");

        const result =
            $("gradeResult");

        if (!input || !result) {
            return;
        }

        const values =
            toEnglishNumber(
                input.value
            )
            .split(/[\s,،]+/)
            .map(function (value) {
                return number(value);
            })
            .filter(function (value) {
                return Number.isFinite(value);
            });

        if (values.length === 0) {

            result.textContent =
                fa(
                    "حداقل یک نمره وارد کنید.",
                    "Enter at least one grade."
                );

            return;
        }

        const invalid =
            values.some(function (value) {
                return value < 0 || value > 20;
            });

        if (invalid) {

            result.textContent =
                fa(
                    "نمره باید بین ۰ تا ۲۰ باشد.",
                    "Grades must be between 0 and 20."
                );

            return;
        }

        const sum =
            values.reduce(
                function (
                    total,
                    value
                ) {
                    return total + value;
                },
                0
            );

        const average =
            sum / values.length;

        result.innerHTML = `
            <div>
                ${fa(
                    "تعداد نمره‌ها",
                    "Number of grades"
                )}:
                <strong>
                    ${values.length}
                </strong>
            </div>

            <div>
                ${fa(
                    "معدل",
                    "Average"
                )}:
                <strong>
                    ${format(average)}
                </strong>
            </div>
        `;
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
                input.value
            ).trim();

        if (!value.includes("/")) {

            result.textContent =
                fa(
                    "کسر را مثل 3/4 وارد کنید.",
                    "Enter a fraction like 3/4."
                );

            return;
        }

        const parts =
            value.split("/");

        if (parts.length !== 2) {

            result.textContent =
                fa(
                    "کسر نامعتبر است.",
                    "Invalid fraction."
                );

            return;
        }

        const numerator =
            number(parts[0]);

        const denominator =
            number(parts[1]);

        if (
            !Number.isFinite(
                numerator
            ) ||
            !Number.isFinite(
                denominator
            ) ||
            denominator === 0
        ) {

            result.textContent =
                fa(
                    "کسر نامعتبر است.",
                    "Invalid fraction."
                );

            return;
        }

        const decimal =
            numerator /
            denominator;

        result.innerHTML = `
            <div>
                ${fa(
                    "نتیجه",
                    "Result"
                )}:
                <strong>
                    ${format(decimal)}
                </strong>
            </div>
        `;
    };


    /* =====================================================
       DECIMAL → FRACTION
    ===================================================== */

    window.decimalToFraction = function () {

        const input =
            $("fractionInput");

        const result =
            $("fractionResult");

        if (!input || !result) {
            return;
        }

        const value =
            number(
                input.value
            );

        if (!Number.isFinite(value)) {

            result.textContent =
                fa(
                    "یک عدد اعشاری معتبر وارد کنید.",
                    "Enter a valid decimal."
                );

            return;
        }

        if (Number.isInteger(value)) {

            result.innerHTML = `
                <div>
                    ${fa(
                        "کسر",
                        "Fraction"
                    )}:
                    <strong>
                        ${value}/1
                    </strong>
                </div>
            `;

            return;
        }

        let denominator = 1;

        while (
            Math.abs(
                value * denominator -
                Math.round(
                    value * denominator
                )
            ) > 1e-10 &&
            denominator < 1000000
        ) {
            denominator *= 10;
        }

        let numerator =
            Math.round(
                value *
                denominator
            );

        function gcd(a, b) {

            a = Math.abs(a);
            b = Math.abs(b);

            while (b) {

                const temp =
                    b;

                b =
                    a % b;

                a =
                    temp;
            }

            return a;
        }

        const divisor =
            gcd(
                numerator,
                denominator
            );

        numerator /=
            divisor;

        denominator /=
            divisor;

        result.innerHTML = `
            <div>
                ${fa(
                    "کسر",
                    "Fraction"
                )}:
                <strong>
                    ${numerator}/${denominator}
                </strong>
            </div>
        `;
    };


    /* =====================================================
       PASSWORD GENERATOR
    ===================================================== */

    window.generatePassword = function () {

        const result =
            $("passwordResult");

        const message =
            $("passwordMessage");

        if (!result) {
            return;
        }

        let length =
            parseInt(
                $("passwordLength")
                    ? $("passwordLength").value
                    : 16,
                10
            );

        if (!Number.isFinite(length)) {
            length = 16;
        }

        length =
            Math.max(
                1,
                Math.min(
                    256,
                    length
                )
            );

        const upper =
            $("passwordUpper")
                ? $("passwordUpper").checked
                : true;

        const lower =
            $("passwordLower")
                ? $("passwordLower").checked
                : true;

        const numbers =
            $("passwordNumbers")
                ? $("passwordNumbers").checked
                : true;

        const symbols =
            $("passwordSymbols")
                ? $("passwordSymbols").checked
                : true;

        let characters = "";

        if (upper) {
            characters +=
                "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        }

        if (lower) {
            characters +=
                "abcdefghijklmnopqrstuvwxyz";
        }

        if (numbers) {
            characters +=
                "0123456789";
        }

        if (symbols) {
            characters +=
                "!@#$%^&*()_+-=[]{}";
        }

        if (!characters) {

            if (message) {

                message.textContent =
                    fa(
                        "حداقل یک نوع کاراکتر را انتخاب کنید.",
                        "Select at least one character type."
                    );
            }

            return;
        }

        let password = "";

        if (
            window.crypto &&
            window.crypto.getRandomValues
        ) {

            const values =
                new Uint32Array(
                    length
                );

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

        result.value =
            password;

        if (message) {

            message.textContent =
                fa(
                    "رمز با موفقیت ساخته شد.",
                    "Password generated successfully."
                );
        }
    };


    window.copyPassword = async function () {

        const result =
            $("passwordResult");

        const message =
            $("passwordMessage");

        if (
            !result ||
            !result.value
        ) {
            return;
        }

        try {

            await navigator.clipboard.writeText(
                result.value
            );

            if (message) {

                message.textContent =
                    fa(
                        "رمز کپی شد.",
                        "Password copied."
                    );
            }

        } catch (error) {

            result.select();

            document.execCommand(
                "copy"
            );

            if (message) {

                message.textContent =
                    fa(
                        "رمز کپی شد.",
                        "Password copied."
                    );
            }
        }
    };


    /* =====================================================
       POWER
    ===================================================== */

    window.calculatePower = function () {

        const base =
            number(
                $("powerNumber")
                    ? $("powerNumber").value
                    : ""
            );

        const exponent =
            number(
                $("powerExponent")
                    ? $("powerExponent").value
                    : ""
            );

        const result =
            $("powerResult");

        if (!result) {
            return;
        }

        if (
            !Number.isFinite(base) ||
            !Number.isFinite(exponent)
        ) {

            result.textContent =
                fa(
                    "ورودی نامعتبر است.",
                    "Invalid input."
                );

            return;
        }

        const value =
            Math.pow(
                base,
                exponent
            );

        result.innerHTML = `
            <div>
                ${fa(
                    "نتیجه توان",
                    "Power result"
                )}:
                <strong>
                    ${format(value)}
                </strong>
            </div>
        `;
    };


    /* =====================================================
       ROOT
    ===================================================== */

    window.calculateRoot = function () {

        const input =
            $("powerNumber");

        const result =
            $("powerResult");

        if (!input || !result) {
            return;
        }

        const value =
            number(
                input.value
            );

        if (!Number.isFinite(value)) {

            result.textContent =
                fa(
                    "عدد نامعتبر است.",
                    "Invalid number."
                );

            return;
        }

        if (value < 0) {

            result.textContent =
                fa(
                    "ریشه دوم عدد منفی در اعداد حقیقی تعریف نمی‌شود.",
                    "Square root of a negative number is not real."
                );

            return;
        }

        result.innerHTML = `
            <div>
                ${fa(
                    "ریشه دوم",
                    "Square root"
                )}:
                <strong>
                    ${format(Math.sqrt(value))}
                </strong>
            </div>
        `;
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
            $("dateResult");

        if (
            !start ||
            !end ||
            !result
        ) {
            return;
        }

        if (
            !start.value ||
            !end.value
        ) {

            result.textContent =
                fa(
                    "هر دو تاریخ را انتخاب کنید.",
                    "Select both dates."
                );

            return;
        }

        const startDate =
            new Date(
                start.value +
                "T00:00:00"
            );

        const endDate =
            new Date(
                end.value +
                "T00:00:00"
            );

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
                    "تاریخ نامعتبر است.",
                    "Invalid date."
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
                86400000
            );

        result.innerHTML = `
            <div>
                ${fa(
                    "اختلاف",
                    "Difference"
                )}:
                <strong>
                    ${format(days)}
                    ${fa(
                        "روز",
                        "days"
                    )}
                </strong>
            </div>

            <div>
                ${fa(
                    "ساعت",
                    "Hours"
                )}:
                <strong>
                    ${format(days * 24)}
                </strong>
            </div>
        `;
    };




    /* =====================================================
       SEARCH
    ===================================================== */

    function setupSearch() {

        const search =
            $("toolSearch");

        const cards =
            document.querySelectorAll(
                ".tool-card"
            );

        const empty =
            $("toolEmpty");

        if (!search) {
            return;
        }

        function filter() {

            const query =
                search.value
                    .trim()
                    .toLowerCase();

            let visible =
                0;

            cards.forEach(
                function (card) {

                    const text =
                        (
                            card.innerText +
                            " " +
                            (
                                card.dataset.search ||
                                ""
                            )
                        )
                            .toLowerCase();

                    const match =
                        text.includes(
                            query
                        );

                    card.style.display =
                        match
                            ? ""
                            : "none";

                    if (match) {
                        visible++;
                    }
                }
            );

            if (empty) {

                empty.style.display =
                    visible === 0
                        ? "block"
                        : "none";
            }
        }

        search.addEventListener(
            "input",
            filter
        );
    }


    /* =====================================================
       INIT
    ===================================================== */

    function initToolsPage() {

        setupSearch();

        updateTextCounter();

        console.log(
            "ILVEX Tools loaded successfully 🚀"
        );
    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initToolsPage
        );

    } else {

        initToolsPage();
    }

})();