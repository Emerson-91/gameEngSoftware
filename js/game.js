// --- Configurações do Canvas ---
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");
canvas.width = 1200;
canvas.height = 500;

// --- Estado do Jogo ---
let keys = {};
let groundY = 450;

let player = {
    x: 80,
    y: groundY - 90,
    width: 74,
    height: 90,
    velY: 0,
    speed: 6,
    gravity: 0.6,
    jumpStrength: -14,
    onGround: false
};

let isMoving = false;
let playerDirection = "right";

// Elementos da fase
let obstacles = [];
let platforms = [];
let enemies = [];

// Portal
let portal = { x: 1100, y: 380, width: 80, height: 90, color: "red" };

// --- Fundos ---
const backgrounds = {
    fase1: new Image(),
    fase2: new Image(),
    fase3: new Image(),
    fase4: new Image()
};
backgrounds.fase1.src = "img/fase1_bg.png";
backgrounds.fase2.src = "img/fase2_bg.png";
backgrounds.fase3.src = "img/fase3_bg.png";
backgrounds.fase4.src = "img/fase4_bg.png";

let currentBackground = null;

// --- Assets ---
const assets = {
    player_parado: new Image(),
    player_correndo1: new Image(),
    player_correndo2: new Image(),
    player_correndo_atras1: new Image(),
    player_correndo_atras2: new Image(),
    platform: new Image(),
    obstacle: new Image(),
    obstacle1: new Image(),
    portal: new Image(),
    bird1: new Image(),
    bird2: new Image(),
    bird3: new Image(),
    bird4: new Image(),
    collision: new Image()
};

// Caminhos dos assets
assets.player_parado.src = "img/parado.png";
assets.player_correndo1.src = "img/correndo1.png";
assets.player_correndo2.src = "img/correndo2.png";
assets.player_correndo_atras1.src = "img/correndoatras1.png";
assets.player_correndo_atras2.src = "img/correndoatras2.png";
assets.platform.src = "img/platform.png";
assets.obstacle.src = "img/cat-obstacle.png";
assets.obstacle1.src = "img/cat-obstacle1.png";
assets.portal.src = "img/porta.png";
assets.bird1.src = "img/bird1.png";
assets.bird2.src = "img/bird2.png";
assets.bird3.src = "img/bird3.png";
assets.bird4.src = "img/bird4.png";
assets.collision.src = "img/collision.png";

// --- Contagem de Assets ---
let assetsLoaded = 0;
const totalAssets = Object.keys(assets).length + Object.keys(backgrounds).length;

function assetLoaded() {
    assetsLoaded++;
    if (assetsLoaded === totalAssets) {
        loadLevel(currentLevel);
        requestAnimationFrame(gameLoop);
    }
}

for (let key in assets) {
    assets[key].onload = assetLoaded;
    assets[key].onerror = assetLoaded;
}
for (let key in backgrounds) {
    backgrounds[key].onload = assetLoaded;
    backgrounds[key].onerror = assetLoaded;
}

// --- Colisão com Animação ---
let isColliding = false;
let collisionPoint = { x: 0, y: 0, width: 100, height: 100 };

function handleCollision(x, y) {
    if (isColliding) return;
    isColliding = true;
    collisionPoint.x = x - 20;
    collisionPoint.y = y - 20;
    if (typeof audioManager !== "undefined") {
        audioManager.playCollisionSound();
    }
    setTimeout(() => {
        window.location.reload();
    }, 450);
}

// --- Fases ---
function loadLevel(level) {
    isColliding = false;
    obstacles = [];
    platforms = [];
    enemies = [];
    if (typeof audioManager !== "undefined") {
        audioManager.startLevelMusic(level);
    }
    player.x = 50;
    player.y = groundY - player.height;
    player.velY = 0;
    player.onGround = false;

    function addObstacle(x, y, width, height) {
        obstacles.push({
            x, y, width, height,
            frameIndex: Math.floor(Math.random() * 2),
            frameTimer: Math.floor(Math.random() * 30)
        });
    }

    function addBird(x, y) {
        enemies.push({
            x,
            y,
            width: 40,
            height: 40,
            frames: [assets.bird1, assets.bird2, assets.bird3, assets.bird4],
            frameIndex: 0,
            frameTimer: 0,
            directionY: 1
        });
    }

    switch (level) {
        case 1:
            currentBackground = backgrounds.fase1;
            addObstacle(300, groundY - 60, 60, 60);
            addObstacle(600, groundY - 60, 60, 60);
            addObstacle(900, groundY - 70, 60, 70);
            portal.y = 370;
            break;
        case 2:
            currentBackground = backgrounds.fase2;
            platforms.push({ x: 200, y: 350, width: 120, height: 20 });
            platforms.push({ x: 400, y: 300, width: 120, height: 20 });
            platforms.push({ x: 600, y: 250, width: 120, height: 20 });
            platforms.push({ x: 800, y: 200, width: 120, height: 20 });
            portal.y = 70;
            break;
        case 3:
            currentBackground = backgrounds.fase3;
            platforms.push({ x: 150, y: 350, width: 120, height: 20 });
            addBird(400, 200);
            platforms.push({ x: 500, y: 300, width: 120, height: 20 });
            addBird(600, 260);
            platforms.push({ x: 750, y: 250, width: 120, height: 20 });
            portal.y = 70;
            break;
        case 4:
            currentBackground = backgrounds.fase4;
            addObstacle(150, groundY - 60, 60, 60);
            platforms.push({ x: 300, y: 350, width: 120, height: 20 });
            platforms.push({ x: 480, y: 260, width: 100, height: 20 });
            addBird(500, 200);
            addObstacle(650, groundY - 80, 60, 80);
            platforms.push({ x: 800, y: 300, width: 120, height: 20 });
            addBird(950, 260);
            portal.y = 200;
            break;
        default:
            window.location.href = "resultado.html";
            break;
    }

    if (level !== 1) {
        platforms.push({
            x: portal.x - 10,
            y: portal.y + portal.height,
            width: portal.width + 20,
            height: 20
        });
    }
}

// --- Teclado ---
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// --- Colisão ---
function checkCollision(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
    );
}

// --- Partículas dos Passos do Personagem ---
let stepParticles = [];

function createStepParticles(x, y, count = 2) {
    for (let i = 0; i < count; i++) {
        stepParticles.push({
            x: x + (Math.random() * 20 - 10),
            y: y,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 1.5 - 0.5,
            radius: Math.random() * 3 + 2,
            alpha: 0.7,
            color: "#cbd5e1"
        });
    }
}

function updateStepParticles(dt) {
    for (let i = stepParticles.length - 1; i >= 0; i--) {
        let p = stepParticles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.alpha -= 0.04 * dt;
        if (p.alpha <= 0) {
            stepParticles.splice(i, 1);
        }
    }
}

function drawStepParticles() {
    stepParticles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

// --- Update ---
const obstacleFrameDelay = 30;
let wasOnGround = false;
let frameIndex = 0;
let frameTimer = 0;
const frameDelay = 8;

function update(dt) {
    if (isColliding) return;

    wasOnGround = player.onGround;
    isMoving = false;
    player.onGround = false;

    // Movimentação do jogador com dt
    let moveDist = player.speed * dt;
    if (keys["ArrowRight"]) { player.x += moveDist; isMoving = true; playerDirection = "right"; }
    if (keys["ArrowLeft"]) { player.x -= moveDist; isMoving = true; playerDirection = "left"; }
    player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));

    // Gravidade e pulo com dt
    player.y += player.velY * dt;
    player.velY += player.gravity * dt;
    if (player.y + player.height >= groundY) {
        player.y = groundY - player.height;
        player.velY = 0;
        player.onGround = true;
    }

    // Plataformas
    platforms.forEach(p => {
        if (player.velY >= 0 && player.x + player.width > p.x && player.x < p.x + p.width &&
            player.y + player.height <= p.y + 6 &&
            player.y + player.height + player.velY * dt >= p.y) {
            player.y = p.y - player.height;
            player.velY = 0;
            player.onGround = true;
        }
    });

    // Detectar aterrissagem (som de passo/pouso + poeira)
    if (!wasOnGround && player.onGround) {
        if (typeof audioManager !== "undefined") {
            audioManager.playStepSound();
        }
        createStepParticles(player.x + player.width / 2, player.y + player.height, 5);
    }

    // Animação e som dos passos ao caminhar/correr
    if (isMoving && player.onGround) {
        frameTimer += dt;
        if (frameTimer >= frameDelay) {
            frameIndex = (frameIndex + 1) % 2;
            frameTimer = 0;
            if (typeof audioManager !== "undefined") {
                audioManager.playStepSound();
            }
            createStepParticles(player.x + player.width / 2, player.y + player.height, 2);
        }
    } else if (!isMoving) {
        frameIndex = 0;
        frameTimer = 0;
    }

    // Atualiza poeira dos passos
    updateStepParticles(dt);

    if (keys["ArrowUp"] && player.onGround) {
        player.velY = player.jumpStrength;
        if (typeof audioManager !== "undefined") {
            audioManager.playJumpSound();
        }
    }

    // Obstáculos
    obstacles.forEach(obs => {
        let hitbox = { x: obs.x + obs.width * 0.15, y: obs.y, width: obs.width * 0.7, height: obs.height };
        if (checkCollision(player, hitbox)) {
            handleCollision(obs.x, obs.y);
        }

        obs.frameTimer += dt;
        if (obs.frameTimer >= obstacleFrameDelay) {
            obs.frameIndex = (obs.frameIndex + 1) % 2;
            obs.frameTimer = 0;
        }
    });

    // Enemies (birds)
    enemies.forEach(enemy => {
        if (checkCollision(player, enemy)) {
            handleCollision(enemy.x, enemy.y);
        }

        // Animação
        enemy.frameTimer += dt;
        if (enemy.frameTimer >= 10) {
            enemy.frameIndex = (enemy.frameIndex + 1) % enemy.frames.length;
            enemy.frameTimer = 0;
        }

        // Movimento vertical com dt
        enemy.y += enemy.directionY * 1.5 * dt;
        if (enemy.y <= 150) enemy.directionY = 1;
        if (enemy.y >= groundY - enemy.height - 50) enemy.directionY = -1;
    });

    // Portal
    if (checkCollision(player, portal)) {
        if (typeof audioManager !== "undefined") {
            audioManager.playPortalSound();
            audioManager.stopMusic();
        }
        window.location.href = `quiz.html?fase=${currentLevel}`;
    }
}

// --- Draw ---
function drawPlayer() {
    let img;
    if (isMoving) {
        img = (playerDirection === "right")
            ? (frameIndex === 0 ? assets.player_correndo1 : assets.player_correndo2)
            : (frameIndex === 0 ? assets.player_correndo_atras1 : assets.player_correndo_atras2);
    } else { img = assets.player_parado; }

    if (img.complete) ctx.drawImage(img, player.x, player.y, player.width, player.height);
    else { ctx.fillStyle = isMoving ? "green" : "blue"; ctx.fillRect(player.x, player.y, player.width, player.height); }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (currentBackground && currentBackground.complete && currentBackground.naturalWidth !== 0) {
        ctx.drawImage(currentBackground, 0, 0, canvas.width, canvas.height);
    } else {
        let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, "#0f172a");
        grad.addColorStop(1, "#1e293b");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.fillStyle = "#444";
    ctx.fillRect(0, groundY, canvas.width, 5);

    drawPlayer();
    drawStepParticles();

    platforms.forEach(p => {
        if (assets.platform.complete) ctx.drawImage(assets.platform, p.x, p.y, p.width, p.height);
        else ctx.fillStyle = "gray", ctx.fillRect(p.x, p.y, p.width, p.height);
    });

    obstacles.forEach(obs => {
        let img = (obs.frameIndex === 0) ? assets.obstacle : assets.obstacle1;
        if (img.complete) ctx.drawImage(img, obs.x, obs.y, obs.width, obs.height);
        else ctx.fillStyle = "brown", ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });

    enemies.forEach(enemy => {
        if (enemy.frames && enemy.frames.length > 0) {
            let img = enemy.frames[enemy.frameIndex];
            if (img.complete) ctx.drawImage(img, enemy.x, enemy.y, enemy.width, enemy.height);
            else ctx.fillStyle = "orange", ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
    });

    if (assets.portal.complete) ctx.drawImage(assets.portal, portal.x, portal.y, portal.width, portal.height);
    else ctx.fillStyle = portal.color, ctx.fillRect(portal.x, portal.y, portal.width, portal.height);

    // Efeito de Colisão POW!
    if (isColliding) {
        if (assets.collision.complete && assets.collision.naturalWidth !== 0) {
            ctx.drawImage(assets.collision, collisionPoint.x, collisionPoint.y, collisionPoint.width, collisionPoint.height);
        } else {
            ctx.fillStyle = "#ff0000";
            ctx.font = "bold 32px Kanit, sans-serif";
            ctx.fillText("POW!", collisionPoint.x, collisionPoint.y);
        }
    }
}

// --- Loop com Delta Time (Normalizado para 60 FPS) ---
let lastTimestamp = 0;

function gameLoop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    let deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    let dt = deltaTime / 16.666;
    if (isNaN(dt) || dt <= 0 || dt > 3.0) dt = 1.0;

    update(dt);
    draw();
    requestAnimationFrame(gameLoop);
}


// --- Início do Jogo ---
//let currentLevel = 3;
