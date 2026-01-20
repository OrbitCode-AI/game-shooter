import './Menu.css';

interface MenuProps {
  title: string;
  score?: number;
  highScore?: number;
  onStart: () => void;
  buttonText?: string;
}

function Menu({ title, score, highScore, onStart, buttonText = 'Play' }: MenuProps) {
  return (
    <div className="menu">
      <div className="menu-content">
        <span className="menu-icon">🚀</span>
        <h1 className="menu-title">{title}</h1>
        {score !== undefined && (
          <p className="menu-score">Score: {score}</p>
        )}
        {highScore !== undefined && highScore > 0 && (
          <p className="menu-highscore">High Score: {highScore}</p>
        )}
        <button className="menu-button" onClick={onStart}>
          {buttonText}
        </button>
        <div className="menu-controls">
          <p>⬅️ ➡️ or A/D to move</p>
          <p>SPACE to shoot</p>
        </div>
      </div>
    </div>
  );
}

// Default export renders component in isolation for preview
export default function MenuPreview() {
  return (
    <Menu
      title="Space Defender"
      highScore={500}
      onStart={() => alert('Starting!')}
    />
  );
}

export { Menu };
