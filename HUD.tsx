import './HUD.css'

interface HUDProps {
  score: number
  lives: number
}

function HUD({ score, lives }: HUDProps) {
  return (
    <div className="hud">
      <div className="hud-item">
        <span className="hud-label">SCORE</span>
        <span className="hud-value score">{score}</span>
      </div>
      <div className="hud-item">
        <span className="hud-label">LIVES</span>
        <span className="hud-value lives">
          {Array.from({ length: lives }).map((_, i) => (
            <span key={i} className="life-heart">
              ❤️
            </span>
          ))}
        </span>
      </div>
    </div>
  )
}

// Default export renders component in isolation for preview
export default function HUDPreview() {
  return (
    <div className="preview-container">
      <HUD score={1250} lives={3} />
    </div>
  )
}

export { HUD }
