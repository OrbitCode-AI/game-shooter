import { useEffect, useRef } from 'preact/hooks';
import './Game.css';

interface GameProps {
  onScore: (points: number) => void;
  onHit: () => void;
}

function Game({ onScore, onHit }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<{ running: boolean } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    canvas.width = 600;
    canvas.height = 700;
    const W = canvas.width;
    const H = canvas.height;

    const player = { x: W / 2, y: H - 60, width: 40, height: 40 };
    const bullets: { x: number; y: number }[] = [];
    const enemies: { x: number; y: number; width: number; height: number; speed: number }[] = [];
    const keys = { left: false, right: false, shoot: false };
    let shootCooldown = 0;
    let spawnTimer = 0;

    gameRef.current = { running: true };

    const spawnEnemy = () => {
      enemies.push({
        x: 30 + Math.random() * (W - 60),
        y: -30,
        width: 30,
        height: 30,
        speed: 2 + Math.random() * 2,
      });
    };

    const update = () => {
      if (!gameRef.current?.running) return;

      // Player movement
      if (keys.left) player.x -= 6;
      if (keys.right) player.x += 6;
      player.x = Math.max(20, Math.min(W - 20, player.x));

      // Shooting
      if (keys.shoot && shootCooldown <= 0) {
        bullets.push({ x: player.x, y: player.y - 20 });
        shootCooldown = 15;
      }
      shootCooldown--;

      // Update bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= 10;
        if (bullets[i].y < 0) bullets.splice(i, 1);
      }

      // Spawn enemies
      spawnTimer++;
      if (spawnTimer > 60) {
        spawnEnemy();
        spawnTimer = 0;
      }

      // Update enemies
      for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemies[i].speed;

        // Check bullet collision
        for (let j = bullets.length - 1; j >= 0; j--) {
          const e = enemies[i];
          const b = bullets[j];
          if (b && e &&
            b.x > e.x - e.width / 2 &&
            b.x < e.x + e.width / 2 &&
            b.y > e.y - e.height / 2 &&
            b.y < e.y + e.height / 2
          ) {
            enemies.splice(i, 1);
            bullets.splice(j, 1);
            onScore(10);
            break;
          }
        }

        // Check if enemy reached bottom
        if (enemies[i] && enemies[i].y > H) {
          enemies.splice(i, 1);
          onHit();
        }

        // Check player collision
        const e = enemies[i];
        if (e &&
          Math.abs(e.x - player.x) < (e.width + player.width) / 2 &&
          Math.abs(e.y - player.y) < (e.height + player.height) / 2
        ) {
          enemies.splice(i, 1);
          onHit();
        }
      }
    };

    const draw = () => {
      // Background
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, W, H);

      // Stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      for (let i = 0; i < 50; i++) {
        ctx.fillRect(
          ((i * 37) % W),
          ((i * 53 + Date.now() / 20) % H),
          1, 1
        );
      }

      // Player
      ctx.fillStyle = '#4fc3f7';
      ctx.beginPath();
      ctx.moveTo(player.x, player.y - 20);
      ctx.lineTo(player.x - 20, player.y + 20);
      ctx.lineTo(player.x + 20, player.y + 20);
      ctx.closePath();
      ctx.fill();

      // Bullets
      ctx.fillStyle = '#ffd93d';
      for (const b of bullets) {
        ctx.fillRect(b.x - 2, b.y - 8, 4, 16);
      }

      // Enemies
      ctx.fillStyle = '#ff6b6b';
      for (const e of enemies) {
        ctx.fillRect(e.x - e.width / 2, e.y - e.height / 2, e.width, e.height);
      }
    };

    let animationId: number;
    const gameLoop = () => {
      update();
      draw();
      if (gameRef.current?.running) {
        animationId = requestAnimationFrame(gameLoop);
      }
    };
    gameLoop();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
      if (e.code === 'Space') { keys.shoot = true; e.preventDefault(); }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
      if (e.code === 'Space') keys.shoot = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (gameRef.current) gameRef.current.running = false;
    };
  }, [onScore, onHit]);

  return <canvas ref={canvasRef} className="game-canvas" />;
}

// Default export renders component in isolation for preview
export default function GamePreview() {
  return (
    <div className="preview-container">
      <Game
        onScore={(p) => console.log('Score:', p)}
        onHit={() => console.log('Hit!')}
      />
      <p className="preview-hint">Arrow keys to move, SPACE to shoot!</p>
    </div>
  );
}

export { Game };
