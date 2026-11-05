/* =========================================================
   ILVEX AURORA SKY
   Black Starry Sky + Green / Blue Aurora
   ========================================================= */

(() => {
    "use strict";

    const oldCanvas = document.getElementById("ilvex-aurora");
    if (oldCanvas) oldCanvas.remove();

    const canvas = document.createElement("canvas");
    canvas.id = "ilvex-aurora";

    Object.assign(canvas.style, {
        position: "fixed",
        inset: "0",
        width: "100vw",
        height: "100vh",
        zIndex: "-1",
        pointerEvents: "none",
        background: "#010308"
    });

    document.body.prepend(canvas);

    const ctx = canvas.getContext("2d");

    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars = [];
    let auroras = [];

    const STAR_COUNT =
        window.innerWidth < 700 ? 120 : 240;

    /* =========================
       RESIZE
    ========================= */

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;

        dpr = Math.min(
            window.devicePixelRatio || 1,
            2
        );

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );

        createStars();
        createAuroras();
    }

    /* =========================
       STARS
    ========================= */

    function createStars() {
        stars = [];

        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,

                radius:
                    Math.random() < 0.8
                        ? Math.random() * 0.8 + 0.25
                        : Math.random() * 1.1 + 0.5,

                alpha:
                    Math.random() * 0.65 + 0.2,

                twinkle:
                    Math.random() * 0.0025 + 0.0005,

                phase:
                    Math.random() * Math.PI * 2
            });
        }
    }

    function drawStars(time) {
        ctx.save();

        /*
         * ستاره‌ها خیلی ظریف
         * ولی واضح و زیاد
         */

        for (const star of stars) {

            const twinkle =
                Math.sin(
                    time * star.twinkle +
                    star.phase
                );

            const alpha =
                star.alpha +
                twinkle * 0.12;

            ctx.beginPath();

            ctx.arc(
                star.x,
                star.y,
                star.radius,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                `rgba(220,245,255,${alpha})`;

            ctx.fill();

            /*
             * بعضی ستاره‌ها هاله خیلی ریز دارن
             */
            if (star.radius > 1) {

                ctx.beginPath();

                ctx.arc(
                    star.x,
                    star.y,
                    star.radius * 3,
                    0,
                    Math.PI * 2
                );

                const glow =
                    ctx.createRadialGradient(
                        star.x,
                        star.y,
                        0,
                        star.x,
                        star.y,
                        star.radius * 3
                    );

                glow.addColorStop(
                    0,
                    `rgba(180,230,255,${alpha * 0.16})`
                );

                glow.addColorStop(
                    1,
                    "rgba(180,230,255,0)"
                );

                ctx.fillStyle = glow;
                ctx.fill();
            }
        }

        ctx.restore();
    }

    /* =========================
       AURORA
    ========================= */

    class Aurora {
        constructor(type, index) {

            this.type = type;

            this.index = index;

            this.x =
                width *
                (0.05 + Math.random() * 0.9);

            this.baseY =
                height *
                (0.18 + Math.random() * 0.38);

            /*
             * خیلی بزرگ‌تر از نسخه قبلی
             */
            this.width =
                width *
                (0.38 + Math.random() * 0.35);

            this.height =
                height *
                (0.25 + Math.random() * 0.25);

            this.speed =
                0.00012 +
                Math.random() * 0.00012;

            this.phase =
                Math.random() *
                Math.PI *
                2;

            this.wave =
                0.8 +
                Math.random() * 1.2;

            this.opacity =
                type === "green"
                    ? 0.16 + Math.random() * 0.08
                    : 0.12 + Math.random() * 0.07;
        }

        draw(time) {

            const moveX =
                Math.sin(
                    time * this.speed +
                    this.phase
                ) *
                width *
                0.16;

            const x =
                this.x + moveX;

            const wave =
                Math.sin(
                    time * 0.00045 +
                    this.phase
                );

            const y =
                this.baseY +
                wave * height * 0.08;

            /*
             * هاله اصلی
             */
            const gradient =
                ctx.createRadialGradient(
                    x,
                    y,
                    0,

                    x,
                    y,
                    this.width
                );

            if (this.type === "green") {

                gradient.addColorStop(
                    0,
                    `rgba(0,255,145,${this.opacity})`
                );

                gradient.addColorStop(
                    0.28,
                    `rgba(20,245,150,${this.opacity * 0.72})`
                );

                gradient.addColorStop(
                    0.55,
                    `rgba(0,190,120,${this.opacity * 0.28})`
                );

                gradient.addColorStop(
                    1,
                    "rgba(0,100,70,0)"
                );

            } else {

                gradient.addColorStop(
                    0,
                    `rgba(20,150,255,${this.opacity})`
                );

                gradient.addColorStop(
                    0.3,
                    `rgba(0,180,255,${this.opacity * 0.65})`
                );

                gradient.addColorStop(
                    0.58,
                    `rgba(0,110,255,${this.opacity * 0.25})`
                );

                gradient.addColorStop(
                    1,
                    "rgba(0,70,180,0)"
                );
            }

            ctx.save();

            /*
             * کشیده کردن هاله
             */
            ctx.translate(
                x,
                y
            );

            ctx.rotate(
                this.type === "green"
                    ? -0.13
                    : 0.08
            );

            ctx.scale(
                1,
                0.35
            );

            ctx.beginPath();

            ctx.arc(
                0,
                0,
                this.width,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                gradient;

            ctx.fill();

            ctx.restore();
        }
    }

    function createAuroras() {

        auroras = [];

        /*
         * چند هاله سبز
         */
        for (let i = 0; i < 4; i++) {
            auroras.push(
                new Aurora(
                    "green",
                    i
                )
            );
        }

        /*
         * چند هاله آبی
         */
        for (let i = 0; i < 3; i++) {
            auroras.push(
                new Aurora(
                    "blue",
                    i
                )
            );
        }
    }

    /* =========================
       MAIN DRAW
    ========================= */

    function draw(time) {

        /*
         * آسمون کاملاً مشکی
         */
        ctx.globalCompositeOperation =
            "source-over";

        ctx.fillStyle =
            "#010308";

        ctx.fillRect(
            0,
            0,
            width,
            height
        );

        /*
         * هاله‌ها پشت ستاره‌ها
         */
        ctx.globalCompositeOperation =
            "screen";

        for (const aurora of auroras) {
            aurora.draw(time);
        }

        /*
         * ستاره‌ها روی هاله
         */
        ctx.globalCompositeOperation =
            "source-over";

        drawStars(time);

        /*
         * گوشه‌ها کمی تاریک‌تر
         * برای عمق بیشتر
         */
        const vignette =
            ctx.createRadialGradient(
                width / 2,
                height / 2,
                height * 0.2,
                width / 2,
                height / 2,
                height * 0.9
            );

        vignette.addColorStop(
            0,
            "rgba(0,0,0,0)"
        );

        vignette.addColorStop(
            1,
            "rgba(0,0,0,0.38)"
        );

        ctx.fillStyle =
            vignette;

        ctx.fillRect(
            0,
            0,
            width,
            height
        );

        requestAnimationFrame(draw);
    }

    window.addEventListener(
        "resize",
        resize,
        {
            passive: true
        }
    );

    resize();

    requestAnimationFrame(draw);

})();