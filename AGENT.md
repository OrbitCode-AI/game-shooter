# Game Shooter (Space Defender) - Agent Guide

## Architecture

- **App.tsx** — Entry point. Manages game state machine (`menu | playing | gameover`), `score`, `lives` (starts at 3), `highScore`, and a `key` counter (forces `Game` remount on restart) via `useVar` from `orbitcode`. Renders `Menu` (start/game-over) or `Game` + `HUD` during play.
- **Game.tsx** — Canvas-based top-down shooter (600x700). Runs a `requestAnimationFrame` loop. Player is a triangle at the bottom, moves left/right with Arrow/A/D keys, fires bullets upward with Space (15-frame cooldown). Enemies spawn from the top at random x positions every 60 frames with random speeds. AABB collision detection for bullet-enemy hits (`onScore`) and enemy-player or enemy-past-screen hits (`onHit`). Scrolling star background.
- **HUD.tsx** — Overlay displaying score and lives (as heart icons).
- **Menu.tsx** — Reusable menu with configurable `title`, `score`, `highScore`, and `buttonText`. Shows control hints. Used for both start and game-over screens.
- **styles.css** — Global styles. Each component also imports its own CSS file.

Data flow: `App` owns all persistent state. `Game` receives `onScore(points)` and `onHit()` callbacks. When lives reach 0, `App` transitions to `gameover` and updates `highScore`. The `key` prop on `Game` forces a clean remount on restart.

## Styling

- Separate `.css` files per component: `Game.css`, `HUD.css`, `Menu.css`, plus `styles.css` for globals.
- Plain CSS class selectors (e.g., `.shooter-game`, `.hud-item`, `.life-heart`). Not CSS modules.
- Space theme: `#0a0a14` background, `#4fc3f7` player, `#ffd93d` bullets, `#ff6b6b` enemies.

## Extension Points

- Add enemy types (different sizes, movement patterns, health) by extending the enemy object with a `type` field and branching spawn/draw/collision logic in `Game.tsx`.
- Add weapon upgrades (spread shot, faster fire rate) by modifying the bullet-spawn logic and cooldown in `updatePlayer`.
- Add a wave/level system by tracking enemy kill count and adjusting spawn rate (`spawnTimer` threshold) and enemy speed ranges.

## Constraints

- Game state lives in a `useRef` (`gameRef`), so internal mutations do not trigger re-renders. Only `onScore`/`onHit` callbacks communicate back to the component tree.
