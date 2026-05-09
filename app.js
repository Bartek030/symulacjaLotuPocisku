const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const GRAVITY_ACCELERATION = 9.81;
const FORCE_ACTION_TIME = 0.01;

let animationId;

function startSimulation() {
    cancelAnimationFrame(animationId);

    const mass = parseFloat(document.getElementById("mass").value);
    const force = parseFloat(document.getElementById("force").value);
    const angleDegree = parseFloat(document.getElementById("angle").value);
    const angle = (angleDegree * Math.PI) / 180;

    // Prędkość początkowa
    /*
        a = F/m
        v = at

        v0 = (f/m)*t
    */
    const v0 = (force / mass) * FORCE_ACTION_TIME;

    const vx = v0 * Math.cos(angle);
    const vy = v0 * Math.sin(angle);

    // Parametry lotu
    /*
        z równania drogi od czasu - czas lotu dla y = 0
        y(t) = y0 + vy*t + (1/2)gt^2
        y0 = 0

        t = 2vy / g
    */
    const flightTime = (2 * vy) / GRAVITY_ACCELERATION;
    // x = vt
    const rangeX = vx * flightTime;
    /*
        z równania prędkości od czasu - dla maksymalnej wysokości v = 0
        v(t) = vy - gt = 0 => maksymalna wysokość dla t = vy/g

        z równania drogi (y0 = 0)
        y(t) = y0 + vy * t - (1/2)gt^2
        ymax = vy * vy/g - (1/2)g(vy/g)^2
        ymax = vy^2/g - (1/2) vy^2/g
        ymax = (1/2)vy^2/g
    */
    const maxHeight = (vy * vy) / (2 * GRAVITY_ACCELERATION);

    document.getElementById("velocity").innerText =
        `Prędkość początkowa: ${v0.toFixed(2)} m/s`;

    document.getElementById("time").innerText =
        `Czas lotu: ${flightTime.toFixed(2)} s`;

    document.getElementById("range").innerText =
        `Zasięg: ${rangeX.toFixed(2)} m`;

    document.getElementById("height").innerText =
        `Maksymalna wysokość: ${maxHeight.toFixed(2)} m`;

    // Marginesy wykresu
    const chartMarginLeft = 80;
    const chartMarginBottom = 50;
    const chartMarginTop = 30;
    const chartMarginRight = 30;

    // Dynamiczna skala
    const scaleX = (canvas.width - chartMarginLeft - chartMarginRight) / (rangeX * 1.1);
    const scaleY = (canvas.height - chartMarginBottom - chartMarginTop) / (maxHeight * 1.3);
    const scale = Math.min(scaleX, scaleY);

    let time = 0;
    const dtime = 0.02;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawGrid(scale, rangeX, maxHeight);
        drawAxes(scale, rangeX, maxHeight);

        // Trajektoria
        ctx.beginPath();
        ctx.strokeStyle = "#2563eb";
        ctx.lineWidth = 3;

        for (let currentTime = 0; currentTime <= time; currentTime += dtime) {
            const x = vx * currentTime;
            const y = vy * currentTime - 0.5 * GRAVITY_ACCELERATION * currentTime * currentTime;

            const canvasX = chartMarginLeft + x * scale;
            const canvasY = canvas.height - chartMarginBottom - y * scale;

            if (currentTime === 0) {
                ctx.moveTo(canvasX, canvasY);
            } else {
                ctx.lineTo(canvasX, canvasY);
            }
        }

        ctx.stroke();

        // Aktualna pozycja pocisku
        const x = vx * time;
        const y = vy * time - 0.5 * GRAVITY_ACCELERATION * time * time;

        const canvasX = chartMarginLeft + x * scale;
        const canvasY = canvas.height - chartMarginBottom - y * scale;

        // Pocisk
        ctx.beginPath();
        ctx.fillStyle = "#dc2626";
        ctx.arc(canvasX, canvasY, 8, 0, Math.PI * 2);
        ctx.fill();

        time += dtime;

        if (y >= 0) {
            animationId = requestAnimationFrame(animate);
        }
    }

    animate();
}

function drawAxes(scale, range, maxHeight) {
    const marginLeft = 80;
    const marginBottom = 50;

    // Oś X
    ctx.beginPath();
    ctx.moveTo(marginLeft, canvas.height - marginBottom);
    ctx.lineTo(canvas.width - 20, canvas.height - marginBottom);

    // Oś Y
    ctx.moveTo(marginLeft, canvas.height - marginBottom);
    ctx.lineTo(marginLeft, 20);

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";

    // Podziałka osi X
    const xStep = Math.max(1, Math.round(range / 10));

    for (let x = 0; x <= range; x += xStep) {
        const px = marginLeft + x * scale;

        ctx.beginPath();
        ctx.moveTo(px, canvas.height - marginBottom);
        ctx.lineTo(px, canvas.height - marginBottom + 6);
        ctx.stroke();

        ctx.fillText(
            `${x.toFixed(0)} m`,
            px - 10,
            canvas.height - marginBottom + 20,
        );
    }

    // Podziałka osi Y
    const yStep = Math.max(1, Math.round(maxHeight / 8));

    for (let y = 0; y <= maxHeight; y += yStep) {
        const py = canvas.height - marginBottom - y * scale;

        ctx.beginPath();
        ctx.moveTo(marginLeft - 6, py);
        ctx.lineTo(marginLeft, py);
        ctx.stroke();

        ctx.fillText(`${y.toFixed(0)} m`, 30, py + 4);
    }

    // Opisy osi
    ctx.font = "bold 14px Arial";

    ctx.fillText("Odległość [m]", canvas.width / 2, canvas.height - 10);

    ctx.save();

    ctx.translate(20, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);

    ctx.fillText("Wysokość [m]", 0, 0);

    ctx.restore();
}

function drawGrid(scale, range, maxHeight) {
    const marginLeft = 80;
    const marginBottom = 50;

    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 1;

    // Linie pionowe
    const xStep = Math.max(1, Math.round(range / 10));

    for (let x = 0; x <= range; x += xStep) {
        const px = marginLeft + x * scale;

        ctx.beginPath();
        ctx.moveTo(px, 20);
        ctx.lineTo(px, canvas.height - marginBottom);
        ctx.stroke();
    }

    // Linie poziome
    const yStep = Math.max(1, Math.round(maxHeight / 8));

    for (let y = 0; y <= maxHeight; y += yStep) {
        const py = canvas.height - marginBottom - y * scale;

        ctx.beginPath();
        ctx.moveTo(marginLeft, py);
        ctx.lineTo(canvas.width - 20, py);
        ctx.stroke();
    }
}
