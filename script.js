ZE: Change these values
// ============================================
const CONFIG = {
    // Particle settings
    particles: {
        count: 50,              // Number of particles (reduce for better mobile performance)
        maxSpeed: 0.5,          // Maximum particle speed
        size: 2,                // Particle size
        color: 'rgba(99, 179, 237, 0.6)',  // Particle color (matches CSS accent)
        glowOnReveal: true      // Enable glow effect on message reveal
    },
    
    // Animation settings
    animation: {
        revealDelay: 100,       // Delay before reveal animation (ms)
        particleBurstCount: 15  // Extra particles on reveal
    },
    
    // Ripple effect settings
    ripple: {
        size: 100,              // Initial ripple size (px)
        alwaysShow: true        // Show ripple even after message is revealed
    }
};


// ============================================
// DOM ELEMENTS
// ============================================
const container = document.getElementById('container');
const messageWrapper = document.getElementById('messageWrapper');
const instruction = document.getElementById('instruction');
const message = document.getElementById('message');
const subtitle = document.getElementById('subtitle');
const hint = document.getElementById('hint');
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');


// ============================================
// STATE
// ============================================
let isRevealed = false;
let particles = [];
let animationId = null;


// ============================================
// PARTICLE SYSTEM
// Manages background particle effects
// ============================================
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
        
        // Decay for burst particles
        if (this.decay > 0) {
            this.life -= this.decay;
            this.opacity = this.life;
        }
        
        // Wrap around screen edges
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


// ============================================
// CANVAS SETUP
// Initializes and resizes canvas
// ============================================
function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = Math.max(window.innerHeight, document.documentElement.scrollHeight);
}


// ============================================
// PARTICLE INITIALIZATION
// Creates initial particle set
// ============================================
function initParticles() {
    particles = [];
    for (let i = 0; i < CONFIG.particles.count; i++) {
        particles.push(new Particle());
    }
}


// ============================================
// PARTICLE BURST EFFECT
// Triggered on message reveal
// CUSTOMIZE: Change burst behavior here
// ============================================
function createParticleBurst(x, y) {
    for (let i = 0; i < CONFIG.animation.particleBurstCount; i++) {
        particles.push(new Particle(x, y, true));
    }
}


// ============================================
// ANIMATION LOOP
// Renders particles continuously
// ============================================
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
        
        // Remove dead burst particles
        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });
    
    animationId = requestAnimationFrame(animate);
}


// ============================================
// RIPPLE EFFECT
// Creates a ripple animation at click position
// ============================================
function createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = `${CONFIG.ripple.size}px`;
    ripple.style.height = `${CONFIG.ripple.size}px`;
    ripple.style.marginLeft = `-${CONFIG.ripple.size / 2}px`;
    ripple.style.marginTop = `-${CONFIG.ripple.size / 2}px`;
    
    document.body.appendChild(ripple);
    
    // Remove ripple after animation completes
    setTimeout(() => {
        ripple.remove();
    }, 800);
}


// ============================================
// MESSAGE REVEAL
// Shows the hidden message with animation (only once)
// CUSTOMIZE: Modify reveal behavior here
// ============================================
function revealMessage() {
    if (isRevealed) {
        // Already revealed - do nothing
        return;
    }
    
    isRevealed = true;
    
    // Hide instruction and hint
    instruction.classList.add('hidden');
    hint.classList.add('hidden');
    
    // Reveal message with delay
    setTimeout(() => {
        message.classList.add('revealed');
        subtitle.classList.add('revealed');
        
        // Create particle burst at center
        if (CONFIG.particles.glowOnReveal) {
            createParticleBurst(window.innerWidth / 2, window.innerHeight / 2);
        }
        
        // Remove cursor pointer after reveal
        container.style.cursor = 'default';
    }, CONFIG.animation.revealDelay);
}


// ============================================
// EVENT HANDLERS
// ============================================

// Click/Tap handler
function handleInteraction(e) {
    // Get click/tap position
    const x = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : window.innerWidth / 2);
    const y = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : window.innerHeight / 2);
    
    // Always create ripple effect on click
    createRipple(x, y);
    
    // Create particle burst at click position
    createParticleBurst(x, y);
    
    // Reveal message if not already revealed
    if (!isRevealed) {
        revealMessage();
        
        // Add active state feedback
        container.classList.add('active');
        setTimeout(() => {
            container.classList.remove('active');
        }, 100);
    }
}

// Keyboard support (accessibility)
function handleKeyPress(e) {
    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        revealMessage();
    }
}

// Window resize handler
function handleResize() {
    setupCanvas();
}

// Scroll handler - update canvas height
function handleScroll() {
    const newHeight = Math.max(window.innerHeight, document.documentElement.scrollHeight);
    if (canvas.height !== newHeight) {
        canvas.height = newHeight;
    }
}


// ============================================
// TELEGRAM WEBAPP INTEGRATION (Optional)
// CUSTOMIZE: Uncomment if using Telegram WebApp
// ============================================
function initTelegramWebApp() {
    // Check if running inside Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Expand to full height
        tg.expand();
        
        // Set custom theme
        tg.setHeaderColor('#0f0f0f');
        tg.setBackgroundColor('#0f0f0f');
        
        // Enable closing confirmation
        tg.enableClosingConfirmation();
        
        // Optional: Send data back to bot
        // tg.sendData(JSON.stringify({ action: 'message_revealed' }));
        
        console.log('Telegram WebApp initialized');
    }
}


// ============================================
// INITIALIZATION
// Runs when page loads
// ============================================
function init() {
    // Setup canvas and particles
    setupCanvas();
    initParticles();
    animate();
    
    // Add event listeners
    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction, { passive: true });
    document.addEventListener('keypress', handleKeyPress);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    
    // Optional: Initialize Telegram WebApp features
    // Uncomment the line below if using Telegram WebApp
    // initTelegramWebApp();
    
    console.log('Interactive message page initialized');
    console.log('Click/tap anywhere to reveal the message');
}


// ============================================
// START APPLICATION
// ============================================
// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}


// ============================================
// UTILITY FUNCTIONS (Optional)
// Additional helper functions you can use
// ============================================

// Function to manually trigger reveal (if needed)
// USAGE: triggerReveal()
function triggerReveal() {
    if (!isRevealed) {
        revealMessage();
    }
}

// Function to change particle color dynamically
// USAGE: setParticleColor("rgba(255, 100, 100, 0.6)")
function setParticleColor(color) {
    CONFIG.particles.color = color;
}

// Function to add more particles
// USAGE: addParticles(20)
function addParticles(count) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

// Export functions for external use (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        setMessage,
        setParticleColor,
        addParticles
    };
}
