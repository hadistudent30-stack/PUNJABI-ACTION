import './style.css';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const game = {
    width: 960,
    height: 540,
    running: true
};

function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = game.width * dpr;
    canvas.height = game.height * dpr;

    canvas.style.width = '100%';
    canvas.style.height = '100%';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, game.height);

    sky.addColorStop(0, '#171b2c');
    sky.addColorStop(1, '#474052');

    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, game.width, game.height);

    // Background skyline
    ctx.fillStyle = '#242637';

    for (let i = 0; i < 12; i++) {
        const x = i * 90;
        const buildingHeight = 150 + ((i * 37) % 170);

        ctx.fillRect(
            x,
            game.height - 150 - buildingHeight,
            80,
            buildingHeight
        );

        // Building windows
        ctx.fillStyle = '#b58c5c';

        for (let wy = game.height - 150 - buildingHeight + 20;
             wy < game.height - 160;
             wy += 35) {

            for (let wx = x + 12; wx < x + 70; wx += 25) {
                ctx.fillRect(wx, wy, 8, 12);
            }
        }

        ctx.fillStyle = '#242637';
    }
}

function drawGround() {
    ctx.fillStyle = '#343238';
    ctx.fillRect(0, 390, game.width, 150);

    ctx.fillStyle = '#4a464a';
    ctx.fillRect(0, 390, game.width, 8);

    // Road markings
    ctx.fillStyle = '#c4a56a';

    for (let x = 30; x < game.width; x += 180) {
        ctx.fillRect(x, 475, 80, 5);
    }
}

function drawPlayerPlaceholder() {
    const x = 200;
    const y = 390;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(x, y, 28, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.fillStyle = '#20232b';
    ctx.fillRect(x - 17, y - 55, 13, 55);
    ctx.fillRect(x + 4, y - 55, 13, 55);

    // Body
    ctx.fillStyle = '#b53c35';
    ctx.fillRect(x - 23, y - 115, 46, 60);

    // Arms
    ctx.fillStyle = '#c68b62';
    ctx.fillRect(x - 34, y - 105, 12, 45);
    ctx.fillRect(x + 22, y - 105, 12, 45);

    // Head
    ctx.fillStyle = '#c68b62';
    ctx.beginPath();
    ctx.arc(x, y - 130, 20, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#29201b';
    ctx.fillRect(x - 18, y - 150, 36, 10);

    // Placeholder label
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PLAYER', x, y + 25);
}

function drawHUD() {
    ctx.textAlign = 'left';

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('PUNJABI ACTION', 30, 40);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#d1d1d1';
    ctx.fillText('GAME ENGINE INITIALIZATION', 30, 65);

    // Placeholder health bar
    ctx.fillStyle = '#222222';
    ctx.fillRect(30, 85, 220, 24);

    ctx.fillStyle = '#d43b36';
    ctx.fillRect(32, 87, 216, 20);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('PLAYER HEALTH', 35, 125);

    // Engine status
    ctx.textAlign = 'right';
    ctx.fillStyle = '#a5e0a5';
    ctx.fillText('ENGINE ONLINE', game.width - 30, 40);

    ctx.textAlign = 'left';
}

function render() {
    if (!game.running) return;

    ctx.clearRect(0, 0, game.width, game.height);

    drawBackground();
    drawGround();
    drawPlayerPlaceholder();
    drawHUD();

    requestAnimationFrame(render);
}

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
render();
