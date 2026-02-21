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

    // Move bullets and remove off-screen ones
    const updateBullets = () => {
      for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= 10;
        if (bullets[i].y < 0) bullets.splice(i, 1);
      }
    };

    // Check if a bullet hits an enemy (AABB)
    const bulletHitsEnemy = (
      b: { x: number; y: number },
      e: { x: number; y: number; width: number; height: number },
    ) =>
      b.x > e.x - e.width / 2 &&
      b.x < e.x + e.width / 2 &&
      b.y > e.y - e.height / 2 &&
      b.y < e.y + e.height / 2;

    // Check if enemy overlaps player
    const enemyHitsPlayer = (e: { x: number; y: number; width: number; height: number }) =>
      Math.abs(e.x - player.x) < (e.width + player.width) / 2 &&
      Math.abs(e.y - player.y) < (e.height + player.height) / 2;

    // Check bullet-enemy collisions; returns true if enemy was destroyed
    const checkBulletCollisions = (enemyIdx: number): boolean => {
      const e = enemies[enemyIdx];
      for (let j = bullets.length - 1; j >= 0; j--) {
        if (bulletHitsEnemy(bullets[j], e)) {
          enemies.splice(enemyIdx, 1);
          bullets.splice(j, 1);
          onScore(10);
          return true;
        }
      }
      return false;
    };

    // Process a single enemy: returns true if enemy was removed
    const processEnemy = (i: number): boolean => {
      enemies[i].y += enemies[i].speed;
      if (checkBulletCollisions(i)) return true;
      if (!enemies[i]) return true;
      if (enemies[i].y > H) { enemies.splice(i, 1); onHit(); return true; }
      if (enemyHitsPlayer(enemies[i])) { enemies.splice(i, 1); onHit(); return true; }
      return false;
    };

    // Update player movement and shooting
    const updatePlayer = () => {
      if (keys.left) player.x -= 6;
      if (keys.right) player.x += 6;
      player.x = Math.max(20, Math.min(W - 20, player.x));
      if (keys.shoot && shootCooldown <= 0) {
        bullets.push({ x: player.x, y: player.y - 20 });
        shootCooldown = 15;
      }
      shootCooldown--;
    };

    const update = () => {
      if (!gameRef.current?.running) return;
      updatePlayer();
      updateBullets();
      spawnTimer++;
      if (spawnTimer > 60) { spawnEnemy(); spawnTimer = 0; }
      for (let i = enemies.length - 1; i >= 0; i--) processEnemy(i);
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

    const shooterKeyMap: Record<string, keyof typeof keys> = {
      ArrowLeft: 'left', KeyA: 'left',
      ArrowRight: 'right', KeyD: 'right',
      Space: 'shoot',
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = shooterKeyMap[e.code];
      if (k) { keys[k] = true; if (k === 'shoot') e.preventDefault(); }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = shooterKeyMap[e.code];
      if (k) keys[k] = false;
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
