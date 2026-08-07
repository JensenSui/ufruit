/**
 * UFRÜIT Slicer - HTML5 Canvas Mini-Game
 * A lightweight, dependency-free interactive game for the landing page.
 */

const GameEngine = (() => {
    let canvas, ctx;
    let width, height;
    
    // Game State
    let isPlaying = false;
    let score = 0;
    let lives = 3;
    let animationId;
    let lastTime = 0;
    
    // Entities
    let fruits = [];
    let particles = [];
    let floatingTexts = [];
    
    // Slicing mechanic
    let slicePath = [];
    let isSlicing = false;
    
    // Assets & Config
    const FRUIT_TYPES = [
        { src: 'assets/character-berry.svg', color: '#D4272B', radius: 40 },
        { src: 'assets/character-juice.svg', color: '#E8722A', radius: 40 },
        { src: 'assets/character-lemon.svg', color: '#F0B429', radius: 40 },
        { src: 'assets/character-crisp.svg', color: '#6B8C3A', radius: 40 },
        { src: 'assets/character-cado.svg', color: '#4A6B2A', radius: 40 }
    ];
    let loadedImages = [];
    
    // Physics
    const GRAVITY = 600; // pixels per second squared
    
    function init() {
        canvas = document.getElementById('fruitGame');
        if (!canvas) return;
        ctx = canvas.getContext('2d', { alpha: false });
        
        resize();
        window.addEventListener('resize', resize);
        
        // Input Listeners
        canvas.addEventListener('mousedown', startSlice);
        canvas.addEventListener('mousemove', slice);
        window.addEventListener('mouseup', endSlice);
        
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            startSlice({ clientX: touch.clientX, clientY: touch.clientY });
        }, { passive: false });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            slice({ clientX: touch.clientX, clientY: touch.clientY });
        }, { passive: false });
        
        window.addEventListener('touchend', endSlice);
        
        // Preload Images
        let loadedCount = 0;
        FRUIT_TYPES.forEach((type, index) => {
            const img = new Image();
            img.src = type.src;
            img.onload = () => {
                loadedImages[index] = img;
                loadedCount++;
            };
        });
        
        // Bind UI
        const startBtn = document.getElementById('gameStartBtn');
        if (startBtn) startBtn.addEventListener('click', startGame);
        
        const restartBtn = document.getElementById('gameRestartBtn');
        if (restartBtn) restartBtn.addEventListener('click', startGame);
    }
    
    function resize() {
        const container = canvas.parentElement;
        width = container.clientWidth;
        height = container.clientHeight;
        canvas.width = width;
        canvas.height = height;
    }
    
    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    function startSlice(e) {
        if (!isPlaying) return;
        isSlicing = true;
        slicePath = [getMousePos(e)];
    }
    
    function slice(e) {
        if (!isSlicing || !isPlaying) return;
        const pos = getMousePos(e);
        slicePath.push(pos);
        
        // Keep trail short
        if (slicePath.length > 8) {
            slicePath.shift();
        }
        
        checkCollisions(pos);
    }
    
    function endSlice() {
        isSlicing = false;
        slicePath = [];
    }
    
    function checkCollisions(pos) {
        if (slicePath.length < 2) return;
        const p1 = slicePath[slicePath.length - 2];
        const p2 = pos;
        
        for (let i = fruits.length - 1; i >= 0; i--) {
            const f = fruits[i];
            
            // Simple distance to line segment check
            const dist = pointToLineDistance(f.x, f.y, p1.x, p1.y, p2.x, p2.y);
            
            if (dist < f.radius) {
                // Sliced!
                score += 10;
                updateScoreUI();
                createSplatter(f.x, f.y, f.color);
                floatingTexts.push({ x: f.x, y: f.y, text: "+10", life: 1, maxLife: 1 });
                fruits.splice(i, 1);
            }
        }
    }
    
    // Math helper: distance from point (x,y) to line segment (x1,y1)-(x2,y2)
    function pointToLineDistance(x, y, x1, y1, x2, y2) {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        if (len_sq != 0) param = dot / len_sq;
        
        let xx, yy;
        
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        const dx = x - xx;
        const dy = y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    function createSplatter(x, y, color) {
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 300 + 100;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                size: Math.random() * 6 + 4,
                life: 1,
                maxLife: Math.random() * 0.5 + 0.5
            });
        }
    }
    
    function spawnFruit() {
        if (!isPlaying) return;
        
        const typeIndex = Math.floor(Math.random() * FRUIT_TYPES.length);
        const type = FRUIT_TYPES[typeIndex];
        const img = loadedImages[typeIndex];
        
        if (!img) return; // Not loaded yet
        
        // Spawn from bottom
        const startX = Math.random() * (width - 100) + 50;
        
        // Throw towards middle
        const targetX = width / 2;
        const vx = (targetX - startX) * 0.8 + (Math.random() - 0.5) * 100;
        
        // Jump height (needs to clear the screen easily)
        const vy = -(Math.random() * 200 + 700); 
        
        fruits.push({
            x: startX,
            y: height + 50,
            vx: vx,
            vy: vy,
            type: type,
            img: img,
            radius: type.radius * (width < 600 ? 0.8 : 1), // Scale down on mobile
            rotation: 0,
            rotSpeed: (Math.random() - 0.5) * 4
        });
    }
    
    let spawnTimer = 0;
    
    function loop(timestamp) {
        if (!isPlaying) return;
        
        const dt = (timestamp - lastTime) / 1000 || 0;
        lastTime = timestamp;
        
        update(dt);
        draw();
        
        animationId = requestAnimationFrame(loop);
    }
    
    function update(dt) {
        // Spawning
        spawnTimer += dt;
        if (spawnTimer > 1.2) {
            spawnTimer = 0;
            // Spawn 1 to 3 fruits
            const count = Math.floor(Math.random() * 3) + 1;
            for(let i=0; i<count; i++) {
                setTimeout(spawnFruit, i * 200);
            }
        }
        
        // Update Fruits
        for (let i = fruits.length - 1; i >= 0; i--) {
            const f = fruits[i];
            f.x += f.vx * dt;
            f.vy += GRAVITY * dt;
            f.y += f.vy * dt;
            f.rotation += f.rotSpeed * dt;
            
            // Check if fallen off screen
            if (f.y > height + 100 && f.vy > 0) {
                fruits.splice(i, 1);
                loseLife();
            }
        }
        
        // Update Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx * dt;
            p.vy += (GRAVITY * 0.8) * dt; // Particles fall a bit slower
            p.y += p.vy * dt;
            p.life -= dt;
            
            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        }
        
        // Update Floating Texts
        for (let i = floatingTexts.length - 1; i >= 0; i--) {
            const ft = floatingTexts[i];
            ft.y -= 50 * dt; // Float up
            ft.life -= dt;
            
            if (ft.life <= 0) {
                floatingTexts.splice(i, 1);
            }
        }
    }
    
    function draw() {
        // Draw background (match the page)
        ctx.fillStyle = '#F5F0E8';
        ctx.fillRect(0, 0, width, height);
        
        // Draw decorative elements to make it feel connected
        ctx.fillStyle = 'rgba(0,0,0,0.02)';
        ctx.font = '900 150px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('UFRÜIT', width/2, height/2);
        
        // Draw Particles
        particles.forEach(p => {
            ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        });
        
        // Draw Fruits
        fruits.forEach(f => {
            ctx.save();
            ctx.translate(f.x, f.y);
            ctx.rotate(f.rotation);
            // Draw image centered
            const size = f.radius * 2;
            ctx.drawImage(f.img, -size/2, -size/2, size, size);
            ctx.restore();
        });
        
        // Draw Floating Texts
        ctx.font = 'bold 24px var(--font-display, sans-serif)';
        ctx.textAlign = 'center';
        floatingTexts.forEach(ft => {
            ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
            ctx.fillStyle = '#25D366';
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.globalAlpha = 1.0;
        });
        
        // Draw Slice Trail
        if (isSlicing && slicePath.length > 1) {
            ctx.beginPath();
            ctx.moveTo(slicePath[0].x, slicePath[0].y);
            for (let i = 1; i < slicePath.length; i++) {
                ctx.lineTo(slicePath[i].x, slicePath[i].y);
            }
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = 6;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.stroke();
            
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#25D366';
            ctx.stroke();
        }
    }
    
    function startGame() {
        document.getElementById('gameStartScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('gameHUD').style.display = 'flex';
        
        score = 0;
        lives = 3;
        fruits = [];
        particles = [];
        floatingTexts = [];
        spawnTimer = 0;
        updateScoreUI();
        updateLivesUI();
        
        isPlaying = true;
        lastTime = performance.now();
        animationId = requestAnimationFrame(loop);
    }
    
    function loseLife() {
        lives--;
        updateLivesUI();
        
        const container = document.getElementById('gameContainer');
        if (container) {
            container.classList.add('flash-red');
            setTimeout(() => container.classList.remove('flash-red'), 200);
        }
        
        if (lives <= 0) {
            gameOver();
        }
    }
    
    function gameOver() {
        isPlaying = false;
        cancelAnimationFrame(animationId);
        
        document.getElementById('gameHUD').style.display = 'none';
        const goScreen = document.getElementById('gameOverScreen');
        if (goScreen) goScreen.style.display = 'flex';
        const finalScoreEl = document.getElementById('finalScore');
        if (finalScoreEl) finalScoreEl.innerText = score;
    }
    
    function updateScoreUI() {
        const el = document.getElementById('gameScore');
        if (el) el.innerText = score;
    }
    
    function updateLivesUI() {
        const el = document.getElementById('gameLives');
        if (el) {
            el.innerHTML = '';
            for(let i=0; i<3; i++) {
                if (i < lives) {
                    el.innerHTML += '<span style="color: #D4272B; margin-left: 5px; font-size: 1.5rem;">❤️</span>';
                } else {
                    el.innerHTML += '<span style="color: #ccc; margin-left: 5px; font-size: 1.5rem;">🤍</span>';
                }
            }
        }
    }
    
    return {
        init: init
    };
})();

// Auto-init since script is at the bottom of body
GameEngine.init();
