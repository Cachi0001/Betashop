import { useEffect, useRef } from 'react';

function EnhancedAnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      const particleCount = Math.min(80, Math.floor(window.innerWidth / 25));
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 4 + 1,
          speedX: (Math.random() - 0.5) * 0.8,
          speedY: (Math.random() - 0.5) * 0.8,
          opacity: Math.random() * 0.6 + 0.2,
          hue: Math.random() * 60 + 240, // Blue to purple range
          originalX: 0,
          originalY: 0,
          angle: Math.random() * Math.PI * 2,
        });
        particles[i].originalX = particles[i].x;
        particles[i].originalY = particles[i].y;
      }
    };

    const animate = () => {
      time += 0.01;
      
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
      gradient.addColorStop(0.3, 'rgba(30, 41, 59, 0.9)');
      gradient.addColorStop(0.7, 'rgba(51, 65, 85, 0.85)');
      gradient.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add floating orbs
      const orbCount = 3;
      for (let i = 0; i < orbCount; i++) {
        const orbX = canvas.width * 0.2 + Math.sin(time + i * 2) * 100;
        const orbY = canvas.height * 0.3 + Math.cos(time * 0.7 + i * 1.5) * 80;
        const orbSize = 150 + Math.sin(time + i) * 30;
        
        const orbGradient = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbSize);
        orbGradient.addColorStop(0, `hsla(${260 + i * 20}, 70%, 60%, 0.1)`);
        orbGradient.addColorStop(0.5, `hsla(${260 + i * 20}, 70%, 60%, 0.05)`);
        orbGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = orbGradient;
        ctx.beginPath();
        ctx.arc(orbX, orbY, orbSize, 0, Math.PI * 2);
        ctx.fill();
      }

      particles.forEach((particle, index) => {
        // Add floating motion
        particle.x = particle.originalX + Math.sin(time + particle.angle) * 20;
        particle.y = particle.originalY + Math.cos(time + particle.angle * 0.8) * 15;
        
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.originalX += particle.speedX;
        particle.originalY += particle.speedY;

        // Wrap around edges
        if (particle.originalX < -50) {
          particle.originalX = canvas.width + 50;
          particle.x = particle.originalX;
        }
        if (particle.originalX > canvas.width + 50) {
          particle.originalX = -50;
          particle.x = particle.originalX;
        }
        if (particle.originalY < -50) {
          particle.originalY = canvas.height + 50;
          particle.y = particle.originalY;
        }
        if (particle.originalY > canvas.height + 50) {
          particle.originalY = -50;
          particle.y = particle.originalY;
        }

        // Draw particle with glow effect
        const glowSize = particle.size * 3;
        const glowGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, glowSize
        );
        glowGradient.addColorStop(0, `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`);
        glowGradient.addColorStop(0.5, `hsla(${particle.hue}, 70%, 60%, ${particle.opacity * 0.3})`);
        glowGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Draw core particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particle.hue}, 70%, 70%, ${particle.opacity * 0.8})`;
        ctx.fill();

        // Draw connections with enhanced styling
        particles.slice(index + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            const connectionOpacity = 0.15 * (1 - distance / 120);
            const connectionGradient = ctx.createLinearGradient(
              particle.x, particle.y,
              otherParticle.x, otherParticle.y
            );
            connectionGradient.addColorStop(0, `hsla(${particle.hue}, 70%, 60%, ${connectionOpacity})`);
            connectionGradient.addColorStop(1, `hsla(${otherParticle.hue}, 70%, 60%, ${connectionOpacity})`);
            
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = connectionGradient;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createParticles();
    animate();

    const handleResize = () => {
      resizeCanvas();
      createParticles();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #334155 70%, #0f172a 100%)'
      }}
    />
  );
}

export default EnhancedAnimatedBackground;