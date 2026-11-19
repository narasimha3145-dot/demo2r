# Super Mario Web Game

A fully featured, responsive retro Super Mario platformer built with pure HTML5 Canvas and Web Audio API synthesis (no external assets or heavy dependencies required).

## Features

- **Iconic Pixel Art Graphics**: Procedurally generated 16x16 & 16x32 NES-style pixel-art sprites for Small Mario, Super Mario, Goombas, Koopa Troopas, Question Blocks, Bricks, Pipes, and Flagpole.
- **Classic Physics & Controls**: Variable-height jumps, momentum, horizontal acceleration, skid friction, and sprint/dash mechanics.
- **Power-ups & Combat**:
  - Break bricks or hit `[?]` blocks to reveal coins and Super Mushrooms.
  - Super Mushroom transforms Mario into Big Mario (extra hit point).
  - Stomp Goombas or knock Koopas into shells.
  - Kick Koopa shells to slide and wipe out rows of enemies!
- **8-Bit Web Audio Synthesizer**: Complete retro sound effects (jump, stomp, bump, power-up appear, break block, coin chime, die, stage clear) and synthesized overworld theme melody with mute toggle (`M`).
- **Mobile & Touch Friendly**: Includes an on-screen responsive D-pad (Left/Right/Down) and Action buttons (A for Jump, B for Run) for mobile or tablet play.
- **Authentic Level Design**: Full World 1-1 style layout with pipes, floating question blocks, brick rows, pyramids, flagpole slide, and the end castle.

## How to Play

### Controls

| Action | Keyboard | Touch / Mobile |
| :--- | :--- | :--- |
| **Move** | `◀` `▶` or `A` / `D` | Left / Right D-Pad buttons |
| **Crouch** | `▼` or `S` | Down D-Pad button |
| **Jump** | `Space`, `▲`, `W`, or `Z` (hold for higher jump) | `A` Button |
| **Sprint / Run** | `Shift` or `X` | `B` Button |
| **Start / Restart** | `Enter` or click screen | Tap screen |
| **Mute / Unmute** | `M` key | Sound button top-right |

## Local Development Server

Run in terminal:
```bash
python3 -m http.server 8000 --directory /content/mario-game
```
Then open `http://localhost:8000` in your web browser.
