const canvas = document.getElementById('collisionCanvas');
const ctx = canvas.getContext('2d');
let animationId;
let particles = [];
let detectorHits = [];

function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
}

window.addEventListener('resize', () => {
    resizeCanvas();
    if (particles.length > 0) {
        startSimulation(); // Reinicia la simulación al cambiar el tamaño
    }
});

resizeCanvas(); // Inicializar tamaño del canvas

class Particle {
    constructor(x, y, dx, dy, type) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.type = type;
        this.radius = type === 'proton' ? canvas.width * 0.02 : canvas.width * 0.01;
        this.color = type === 'proton' ? '#0066cc' : '#ffcc00';
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
    }
}

function drawDetector() {
    const detectorRadius = Math.min(canvas.width, canvas.height) * 0.35;
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, detectorRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#666';
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.font = `${canvas.width * 0.03}px Arial`;
    const text = "← Detector →";
    const textWidth = ctx.measureText(text).width;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(canvas.width/2 - textWidth/2 - 5, canvas.height * 0.1 - 12, textWidth + 10, 20);
    
    ctx.fillStyle = '#333';
    ctx.fillText(text, canvas.width/2 - textWidth/2, canvas.height * 0.1);
}

function startSimulation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    particles = [];
    detectorHits = [];

    const speed = canvas.width * 0.005;
    particles.push(new Particle(canvas.width * 0.2, canvas.height/2, speed, 0, 'proton'));
    particles.push(new Particle(canvas.width * 0.8, canvas.height/2, -speed, 0, 'proton'));

    animate();
}

function checkCollision() {
    if (particles.length >= 2) {
        const p1 = particles[0];
        const p2 = particles[1];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < p1.radius + p2.radius && particles.length === 2) {
            const numParticles = 8;
            for (let i = 0; i < numParticles; i++) {
                const angle = (Math.PI * 2 / numParticles) * i;
                const speed = canvas.width * 0.006;
                particles.push(new Particle(
                    canvas.width/2,
                    canvas.height/2,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    'resultant'
                ));
            }
            particles = particles.slice(2);
        }
    }
}

function detectParticles() {
    const detectorRadius = Math.min(canvas.width, canvas.height) * 0.35;
    particles.forEach(particle => {
        if (particle.type === 'resultant') {
            const dx = particle.x - canvas.width/2;
            const dy = particle.y - canvas.height/2;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (Math.abs(distance - detectorRadius) < 5) {
                detectorHits.push({
                    x: particle.x,
                    y: particle.y,
                    time: 30
                });
            }
        }
    });
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawDetector();
    
    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
    });

    checkCollision();
    detectParticles();

    detectorHits.forEach((hit, index) => {
        if (hit.time > 0) {
            ctx.beginPath();
            ctx.arc(hit.x, hit.y, canvas.width * 0.01, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 0, 0, ${hit.time/30})`;
            ctx.fill();
            hit.time--;
        }
    });

    detectorHits = detectorHits.filter(hit => hit.time > 0);

    animationId = requestAnimationFrame(animate);
}