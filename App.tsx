import { useVar } from 'orbitcode';
import { Game } from './Game';
import { HUD } from './HUD';
import { Menu } from './Menu';
import './styles.css';

export default function App() {
  const [gameState, setGameState] = useVar<'menu' | 'playing' | 'gameover'>('shooterState', 'menu');
  const [score, setScore] = useVar('shooterScore', 0);
  const [lives, setLives] = useVar('shooterLives', 3);
  const [highScore, setHighScore] = useVar('shooterHighScore', 0);
  const [key, setKey] = useVar('shooterKey', 0);

  const handleStart = () => {
    setScore(0);
    setLives(3);
    setKey((k) => k + 1);
    setGameState('playing');
  };

  const handleScore = (points: number) => {
    setScore((s) => s + points);
  };

  const handleHit = () => {
    setLives((l) => {
      if (l <= 1) {
        if (score > highScore) setHighScore(score);
        setGameState('gameover');
        return 0;
      }
      return l - 1;
    });
  };

  return (
    <div className="shooter-game">
      {gameState === 'menu' && (
        <Menu title="Space Defender" highScore={highScore} onStart={handleStart} />
      )}
      {gameState === 'playing' && (
        <>
          <Game key={key} onScore={handleScore} onHit={handleHit} />
          <HUD score={score} lives={lives} />
        </>
      )}
      {gameState === 'gameover' && (
        <Menu
          title="Game Over"
          score={score}
          highScore={highScore}
          onStart={handleStart}
          buttonText="Try Again"
        />
      )}
    </div>
  );
}
