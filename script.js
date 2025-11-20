const CONFIG = {
    particles: {
        count: 50,
        maxSpeed: 0.5,
        size: 2,
        color: 'rgba(99, 179, 237, 0.6)',
        glowOnReveal: true
    },
    
    animation: {
        revealDelay: 100,
        particleBurstCount: 15
    },
    
    messages: [
        {
            title: "Hello, World!",
            subtitle: "Welcome to something special"
        },
        {
            title: "Keep Exploring",
            subtitle: "There's more to discover"
        },
        {
            title: "Stay Curious",
            subtitle: "The journey continues"
        }
    ],
    
    currentMessageIndex: 0
};


const container = document.getElementById('container');
const messageWrapper = document.getElementById('messageWrapper');
const instruction = document.getElementById('instruction');
const message = document.getElementById('message');
const subtitle = document.getElementById('subtitle');
const hint = document.getElementById('hint');
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');


let isRevealed = false;
let particles = [];
let animationId = null;


class Particle {
    constructor(x, y, burst = false) {
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height;
        this.size = burst ? Math.random() * 3 + 1 : CONFIG.particles.size;
        this.speedX = (Math.random() - 0.5) * (burst ? 2 : CONFIG.particles.maxSpeed);
        this.speedY = (Math.random() - 0.5) * (burst ? 2 : CONFIG.particles.maxSpeed);
        this.opacity = burst ? 1 : Math.random() * 0.5 + 0.3;
        this.life = burst ? 1 : 1;
        this.decay = burst ? 0.02 : 0;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.decay > 0) {
            this.life -= this.decay;
            this.opacity = this.life;
        }
        
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
    }
    
    draw() {
        ctx.fillStyle = CONFIG.particles.color;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}


function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}


function initParticles() {
    particles = [];
    for (let i = 0; i < CONFIG.particles.count; i++) {
        particles.push(new Particle());
    }
}


function createParticleBurst(x, y) {
    for (let i = 0; i < CONFIG.animation.particleBurstCount; i++) {
        particles.push(new Particle(x, y, true));
    }
}


function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
        
        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });
    
    animationId = requestAnimationFrame(animate);
}


function revealMessage() {
    if (isRevealed) {
        return;
    }
    
    isRevealed = true;
    
    instruction.classList.add('hidden');
    hint.classList.add('hidden');
    
    setTimeout(() => {
        message.classList.add('revealed');
        subtitle.classList.add('revealed');
        
        if (CONFIG.particles.glowOnReveal) {
            createParticleBurst(canvas.width / 2, canvas.height / 2);
        }
    }, CONFIG.animation.revealDelay);
}


function handleInteraction(e) {
    revealMessage();
    
    container.classList.add('active');
    setTimeout(() => {
        container.classList.remove('active');
    }, 100);
    
    createParticleBurst(canvas.width / 2, canvas.height / 2);
}

function handleKeyPress(e) {
    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        revealMessage();
    }
}

function handleResize() {
    setupCanvas();
    initParticles();
}


function init() {
    setupCanvas();
    initParticles();
    animate();
    
    container.addEventListener('click', handleInteraction);
    container.addEventListener('touchstart', handleInteraction, { passive: true });
    document.addEventListener('keypress', handleKeyPress);
    window.addEventListener('resize', handleResize);
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}


function setMessage(title, subtitleText) {
    message.textContent = title;
    subtitle.textContent = subtitleText;
}

function setParticleColor(color) {
    CONFIG.particles.color = color;
}

function addParticles(count) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        setMessage,
        setParticleColor,
        addParticles
    };
}
