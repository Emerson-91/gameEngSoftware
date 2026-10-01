const canvas = document.getElementById("fireworksCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.velX = (Math.random() - 0.5) * 6;
        this.velY = (Math.random() - 0.5) * 6;
        this.alpha = 1;
        this.color = color;
        this.size = Math.random() * 3 + 2;
    }

    update() {
        this.x += this.velX;
        this.y += this.velY;
        this.alpha -= 0.02;
    }

    draw() {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

let particles = [];

function spawnFirework() {
    const x = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
    const y = Math.random() * canvas.height * 0.5;
    const colors = ["#ff0040", "#00ff99", "#ffff00", "#00cfff", "#ff7f00"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    for (let i = 0; i < 30; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function animate() {
    ctx.fillStyle = "rgba(37, 0, 122, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, index) => {
        p.update();
        p.draw();
        if (p.alpha <= 0) particles.splice(index, 1);
    });

    requestAnimationFrame(animate);
}

// Spawn contínuo de fogos
setInterval(spawnFirework, 1000);
animate();
