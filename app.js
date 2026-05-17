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

    let isInputCorrect = validateInput(mass, force, angleDegree);

    if (isInputCorrect) {

        // Prędkość początkowa - v0 = (F/m)*t
        const initialVelocity = (force / mass) * FORCE_ACTION_TIME;

        const initialVelocityX = initialVelocity * Math.cos(angle);
        const initialVelocityY = initialVelocity * Math.sin(angle);

        // Czas lotu - t = 2vy / g
        const flightTime = (2 * initialVelocityY) / GRAVITY_ACCELERATION;
        
        // maksymalna wysokosc - ymax = vy^2 / 2g
        const maxHeight = (initialVelocityY * initialVelocityY) / (2 * GRAVITY_ACCELERATION);

        // zasieg lotu - xmax = vx * t
        const rangeX = initialVelocityX * flightTime;

        document.getElementById("velocity").innerText = `Prędkość początkowa: ${initialVelocity.toFixed(2)} m/s`;
        document.getElementById("time").innerText = `Czas lotu: ${flightTime.toFixed(2)} s`;
        document.getElementById("range").innerText = `Zasięg: ${rangeX.toFixed(2)} m`;
        document.getElementById("height").innerText = `Maksymalna wysokość: ${maxHeight.toFixed(2)} m`;

        // Marginesy wykresu
        const chartMarginLeft = 80;
        const chartMarginBottom = 50;
        const chartMarginTop = 30;
        const chartMarginRight = 30;

        // Dynamiczna skala wyresu
        const scaleX = (canvas.width - chartMarginLeft - chartMarginRight) / (rangeX);
        const scaleY = (canvas.height - chartMarginBottom - chartMarginTop) / (maxHeight);
        const scale = Math.min(scaleX, scaleY);

        let flyTime = 0;
        const flyTimeChange = 0.02;

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            drawGrid(scale, rangeX, maxHeight);
            drawAxes(scale, rangeX, maxHeight);

            // Trajektoria
            ctx.beginPath();
            ctx.strokeStyle = "#2563eb";
            ctx.lineWidth = 3;

            for (let currentTime = 0; currentTime <= flyTime; currentTime += flyTimeChange) {
                const x = initialVelocityX * currentTime;
                const y = initialVelocityY * currentTime - 0.5 * GRAVITY_ACCELERATION * currentTime * currentTime;

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
            const currentX = initialVelocityX * flyTime;
            const currentY = initialVelocityY * flyTime - 0.5 * GRAVITY_ACCELERATION * flyTime * flyTime;

            const canvasX = chartMarginLeft + currentX * scale;
            const canvasY = canvas.height - chartMarginBottom - currentY * scale;

            // Pocisk
            ctx.beginPath();
            ctx.fillStyle = "#dc2626";
            ctx.arc(canvasX, canvasY, 8, 0, Math.PI * 2);
            ctx.fill();

            flyTime += flyTimeChange;

            if (currentY >= 0) {
                animationId = requestAnimationFrame(animate);
            }
        }

        animate();
    } else {
        alert(
            `Wprowadź poprawne dane wejściowe:
            - masa musi być większa od 0
            - siła musi być większa od 0
            - kąt musi być w zakresie od 0 do 90 stopni`
        );
    }
}

function validateInput(mass, force, angleDegree) {
    if (mass <= 0) {
        return false;
    }

    if (force <= 0) {
        return false;
    }

    if (angleDegree <= 0 || angleDegree >= 90) {
        return false;
    }
    return true;
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
