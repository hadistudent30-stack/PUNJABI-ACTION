import './style.css'

const app = document.querySelector('#app')

app.innerHTML = `
  <div class="game-shell">
    <header class="game-header">
      <div class="brand">
        <span class="brand-icon">⚔</span>
        <div>
          <h1>PUNJABI <span>ACTION</span></h1>
          <small>THE BATTLE BEGINS</small>
        </div>
      </div>
      <div class="header-status">
        <span class="status-dot"></span> GAME ENGINE ONLINE
      </div>
    </header>

    <main class="game-main">
      <section class="game-panel">
        <div class="arena-top">
          <div>
            <span class="eyebrow">MISSION 01</span>
            <h2>THE FIRST FIGHT</h2>
          </div>
          <div class="level-tag">LEVEL 1</div>
        </div>

        <div class="canvas-wrap">
          <canvas id="gameCanvas" width="960" height="540"></canvas>

          <div id="menuOverlay" class="overlay">
            <div class="menu-content">
              <div class="menu-emblem">⚔</div>
              <span class="eyebrow">WELCOME TO</span>
              <h2>PUNJABI<br/><span>ACTION</span></h2>
              <p>Enter the arena. Survive the battle.</p>
              <button id="playBtn" class="primary-btn">START GAME <span>▶</span></button>
              <div class="menu-note">WARRIOR • FIGHTER • SURVIVOR</div>
            </div>
          </div>

          <div id="gameOverOverlay" class="overlay hidden">
            <div class="menu-content">
              <span class="eyebrow">MISSION FAILED</span>
              <h2>GAME <span>OVER</span></h2>
              <p>You were defeated in the arena.</p>
              <button id="restartBtn" class="primary-btn">TRY AGAIN ↻</button>
            </div>
          </div>

          <div id="victoryOverlay" class="overlay hidden">
            <div class="menu-content">
              <span class="eyebrow">MISSION COMPLETE</span>
              <h2>YOU <span>WIN!</span></h2>
              <p>You survived the arena.</p>
              <button id="victoryRestartBtn" class="primary-btn">PLAY AGAIN ↻</button>
            </div>
          </div>
        </div>

        <div class="arena-footer">
          <div class="health-block">
            <span class="health-label">PLAYER HEALTH</span>
            <div class="health-track"><div id="healthBar" class="health-fill"></div></div>
            <span id="healthText">100 / 100</span>
          </div>
          <div class="score-block">
            <span class="health-label">SCORE</span>
            <strong id="scoreText">0000</strong>
          </div>
          <div class="score-block">
            <span class="health-label">ENEMIES</span>
            <strong id="enemyText">0</strong>
          </div>
        </div>
      </section>

      <aside class="side-panel">
        <div class="side-card">
          <span class="eyebrow">CONTROLS</span>
          <h3>How to play</h3>
          <div class="control-row"><div class="key">W</div><span>Move up</span></div>
          <div class="control-row"><div class="key">A</div><span>Move left</span></div>
          <div class="control-row"><div class="key">S</div><span>Move down</span></div>
          <div class="control-row"><div class="key">D</div><span>Move right</span></div>
          <div class="control-row"><div class="key wide">SPACE</div><span>Attack enemies</span></div>
          <div class="control-row"><div class="key wide">SHIFT</div><span>Quick movement</span></div>
        </div>

        <div class="side-card mission-card">
          <span class="eyebrow">OBJECTIVE</span>
          <h3>Survive the Arena</h3>
          <p>Defeat all enemies. Stay alive. Become the ultimate warrior.</p>
          <div class="mission-stat">
            <span>Enemy target</span><strong>10</strong>
          </div>
          <div class="mission-stat">
            <span>Difficulty</span><strong>MEDIUM</strong>
          </div>
        </div>

        <div class="side-card">
          <span class="eyebrow">GAME STATUS</span>
          <div class="engine-status">
            <span class="status-dot"></span>
            <span>2D ENGINE ACTIVE</span>
          </div>
          <p class="small-text">Punjabi Action • Prototype v0.2</p>
        </div>
      </aside>
    </main>

    <footer class="game-footer">
      PUNJABI ACTION <span>•</span> BUILT FOR THE BATTLE
    </footer>
  </div>
`

const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')

const menuOverlay = document.getElementById('menuOverlay')
const gameOverOverlay = document.getElementById('gameOverOverlay')
const victoryOverlay = document.getElementById('victoryOverlay')

const healthBar = document.getElementById('healthBar')
const healthText = document.getElementById('healthText')
const scoreText = document.getElementById('scoreText')
const enemyText = document.getElementById('enemyText')

const W = canvas.width
const H = canvas.height
const TARGET = 10

let player
let enemies
let score
let defeated
let running
let lastTime = 0
let spawnTimer = 0
let keys = {}
let particles = []

function resetGame() {
  player = {
    x: W / 2,
    y: H / 2,
    size: 20,
    speed: 230,
    health: 100,
    direction: { x: 1, y: 0 },
    attackTimer: 0,
    attackCooldown: 0,
    dashTimer: 0
  }

  enemies = []
  score = 0
  defeated = 0
  spawnTimer = 0
  particles = []
  running = true

  updateHUD()
  gameOverOverlay.classList.add('hidden')
  victoryOverlay.classList.add('hidden')
}

function updateHUD() {
  healthBar.style.width = `${player.health}%`
  healthText.textContent = `${player.health} / 100`
  scoreText.textContent = String(score).padStart(4, '0')
  enemyText.textContent = `${defeated} / ${TARGET}`
}

function spawnEnemy() {
  const edge = Math.floor(Math.random() * 4)
  let x, y

  if (edge === 0) { x = Math.random() * W; y = -20 }
  if (edge === 1) { x = W + 20; y = Math.random() * H }
  if (edge === 2) { x = Math.random() * W; y = H + 20 }
  if (edge === 3) { x = -20; y = Math.random() * H }

  enemies.push({
    x, y,
    radius: 16,
    speed: 65 + Math.random() * 35,
    health: 2,
    hitTimer: 0
  })
}

function addParticles(x, y, color, count = 8) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 50 + Math.random() * 160

    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.4 + Math.random() * 0.4,
      color
    })
  }
}

function attack() {
  if (!running || player.attackCooldown > 0) return

  player.attackCooldown = 0.35
  player.attackTimer = 0.18

  const attackRadius = 68

  for (const enemy of enemies) {
    const dx = enemy.x - player.x
    const dy = enemy.y - player.y
    const distance = Math.hypot(dx, dy)

    if (distance < attackRadius + enemy.radius) {
      const dot = (dx * player.direction.x + dy * player.direction.y) /
        Math.max(distance, 1)

      if (dot > -0.25) {
        enemy.health--
        enemy.hitTimer = 0.15
        enemy.x += player.direction.x * 20
        enemy.y += player.direction.y * 20
        addParticles(enemy.x, enemy.y, '#ffb347', 5)
      }
    }
  }

  const dead = enemies.filter(e => e.health <= 0)

  dead.forEach(e => {
    score += 100
    defeated++
    addParticles(e.x, e.y, '#ff4e50', 14)
  })

  enemies = enemies.filter(e => e.health > 0)
  updateHUD()

  if (defeated >= TARGET) {
    running = false
    victoryOverlay.classList.remove('hidden')
  }
}

function update(dt) {
  if (!running) return

  player.attackCooldown = Math.max(0, player.attackCooldown - dt)
  player.attackTimer = Math.max(0, player.attackTimer - dt)
  player.dashTimer = Math.max(0, player.dashTimer - dt)

  let dx = 0, dy = 0

  if (keys.w || keys.arrowup) dy--
  if (keys.s || keys.arrowdown) dy++
  if (keys.a || keys.arrowleft) dx--
  if (keys.d || keys.arrowright) dx++

  if (dx !== 0 || dy !== 0) {
    const length = Math.hypot(dx, dy)
    dx /= length
    dy /= length

    player.direction = { x: dx, y: dy }

    const speed = player.speed * (keys.shift ? 1.65 : 1)

    player.x += dx * speed * dt
    player.y += dy * speed * dt
  }

  player.x = Math.max(25, Math.min(W - 25, player.x))
  player.y = Math.max(25, Math.min(H - 25, player.y))

  spawnTimer += dt

  if (spawnTimer > 1.1 && defeated + enemies.length < TARGET) {
    spawnEnemy()
    spawnTimer = 0
  }

  for (const enemy of enemies) {
    enemy.hitTimer = Math.max(0, enemy.hitTimer - dt)

    const dx = player.x - enemy.x
    const dy = player.y - enemy.y
    const distance = Math.hypot(dx, dy) || 1

    enemy.x += dx / distance * enemy.speed * dt
    enemy.y += dy / distance * enemy.speed * dt

    if (distance < player.size + enemy.radius) {
      player.health -= 22 * dt

      if (player.health <= 0) {
        player.health = 0
        running = false
        gameOverOverlay.classList.remove('hidden')
      }
    }
  }

  for (const p of particles) {
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.life -= dt
  }

  particles = particles.filter(p => p.life > 0)
  updateHUD()
}

function drawBackground() {
  ctx.fillStyle = '#111820'
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = '#17222c'
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = 'rgba(255,255,255,0.035)'
  ctx.lineWidth = 1

  for (let x = 0; x < W; x += 40) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
    ctx.stroke()
  }

  for (let y = 0; y < H; y += 40) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
  }

  ctx.strokeStyle = 'rgba(255,174,67,0.13)'
  ctx.lineWidth = 3
  ctx.strokeRect(12, 12, W - 24, H - 24)

  ctx.fillStyle = 'rgba(255,174,67,0.05)'
  ctx.beginPath()
  ctx.arc(W / 2, H / 2, 140, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = 'rgba(255,174,67,0.10)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(W / 2, H / 2, 140, 0, Math.PI * 2)
  ctx.stroke()
}

function drawPlayer() {
  ctx.save()
  ctx.translate(player.x, player.y)

  // Player shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath()
  ctx.ellipse(0, 12, 19, 10, 0, 0, Math.PI * 2)
  ctx.fill()

  // Body
  ctx.fillStyle = '#e8a13a'
  ctx.fillRect(-11, -12, 22, 25)

  // Turban
  ctx.fillStyle = '#f5c56b'
  ctx.beginPath()
  ctx.arc(0, -17, 12, Math.PI, Math.PI * 2)
  ctx.fill()
  ctx.fillRect(-11, -18, 22, 5)

  // Face
  ctx.fillStyle = '#b87640'
  ctx.fillRect(-8, -13, 16, 13)

  // Eyes
  ctx.fillStyle = '#111'
  ctx.fillRect(-5, -8, 3, 2)
  ctx.fillRect(3, -8, 3, 2)

  // Belt
  ctx.fillStyle = '#292c34'
  ctx.fillRect(-11, 7, 22, 5)

  // Direction indicator
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(player.direction.x * 22, player.direction.y * 22)
  ctx.stroke()

  // Attack effect
  if (player.attackTimer > 0) {
    ctx.strokeStyle = '#ffc35c'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.arc(0, 0, 55, -0.8, 0.8)
    ctx.stroke()
  }

  ctx.restore()
}

function drawEnemy(enemy) {
  ctx.save()
  ctx.translate(enemy.x, enemy.y)

  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath()
  ctx.ellipse(0, 10, 18, 8, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = enemy.hitTimer > 0 ? '#fff' : '#b93445'
  ctx.beginPath()
  ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#222'
  ctx.fillRect(-7, -4, 4, 5)
  ctx.fillRect(3, -4, 4, 5)

  ctx.fillStyle = '#ff6474'
  ctx.fillRect(-12, -21, 24, 4)

  ctx.restore()
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life)
    ctx.fillStyle = p.color
    ctx.fillRect(p.x, p.y, 4, 4)
  }

  ctx.globalAlpha = 1
}

function render() {
  drawBackground()

  for (const enemy of enemies) drawEnemy(enemy)

  drawPlayer()
  drawParticles()
}

function loop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000 || 0, 0.05)
  lastTime = timestamp

  update(dt)
  render()

  requestAnimationFrame(loop)
}

document.addEventListener('keydown', e => {
  const key = e.key.toLowerCase()

  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
    e.preventDefault()
  }

  keys[key] = true

  if (key === ' ' && running) attack()
})

document.addEventListener('keyup', e => {
  keys[e.key.toLowerCase()] = false
})

document.getElementById('playBtn').addEventListener('click', () => {
  resetGame()
  menuOverlay.classList.add('hidden')
})

document.getElementById('restartBtn').addEventListener('click', () => {
  resetGame()
})

document.getElementById('victoryRestartBtn').addEventListener('click', () => {
  resetGame()
})

document.getElementById('playBtn').addEventListener('click', () => {
  lastTime = performance.now()
})

resetGame()
running = false
menuOverlay.classList.remove('hidden')
requestAnimationFrame(loop)
