// Super Mario Web Game Engine
(() => {
  const CANVAS_WIDTH = 256;
  const CANVAS_HEIGHT = 224;
  const TILE_SIZE = 16;
  const GRAVITY = 0.28;
  const MAX_FALL_SPEED = 6.0;

  let canvas, ctx;
  let audio;
  let keys = {};
  let lastTime = 0;
  let gameState = 'START'; // START, PLAYING, LEVEL_CLEAR, GAME_OVER, PAUSED

  // Game stats
  let score = 0;
  let coins = 0;
  let lives = 3;
  let timeLeft = 400;
  let timeAccumulator = 0;

  // Camera
  let cameraX = 0;
  let maxCameraX = 0;

  // Level Entities
  let player;
  let enemies = [];
  let items = [];
  let particles = [];
  let floatingTexts = [];
  let blocks = [];
  let scenery = [];
  let flagPole = null;
  let castle = null;

  // Level dimensions
  const LEVEL_TILES_WIDTH = 220;
  const LEVEL_WIDTH = LEVEL_TILES_WIDTH * TILE_SIZE;

  class FloatingText {
    constructor(text, x, y, color = '#ffffff') {
      this.text = text;
      this.x = x;
      this.y = y;
      this.color = color;
      this.life = 45;
      this.vy = -0.8;
    }
    update() {
      this.y += this.vy;
      this.life--;
    }
    draw(ctx) {
      ctx.save();
      ctx.fillStyle = this.color;
      ctx.font = '8px monospace';
      ctx.fillText(this.text, Math.round(this.x - cameraX), Math.round(this.y));
      ctx.restore();
    }
  }

  class Particle {
    constructor(x, y, vx, vy, spriteKey = 'brick', rotate = true) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.spriteKey = spriteKey;
      this.rotate = rotate;
      this.angle = 0;
      this.life = 60;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += GRAVITY * 0.8;
      this.angle += 0.2;
      this.life--;
    }
    draw(ctx) {
      ctx.save();
      ctx.translate(Math.round(this.x - cameraX), Math.round(this.y));
      if (this.rotate) ctx.rotate(this.angle);
      const sprite = SpriteEngine.get(this.spriteKey);
      if (sprite) {
        ctx.drawImage(sprite, 0, 0, 8, 8, -4, -4, 8, 8);
      } else {
        ctx.fillStyle = '#c84c0c';
        ctx.fillRect(-3, -3, 6, 6);
      }
      ctx.restore();
    }
  }

  class Block {
    constructor(x, y, type, content = null) {
      this.x = x;
      this.y = y;
      this.w = TILE_SIZE;
      this.h = TILE_SIZE;
      this.type = type; // 'ground', 'brick', 'question', 'empty', 'pipe'
      this.content = content; // 'coin', 'mushroom', null
      this.bumpOffset = 0;
      this.bumpTimer = 0;
      this.animTimer = 0;
    }

    bump() {
      if (this.type === 'empty') {
        audio.bump();
        return;
      }
      if (this.bumpTimer > 0) return;
      this.bumpTimer = 12;

      if (this.type === 'question') {
        if (this.content === 'coin') {
          coins++;
          score += 200;
          audio.coin();
          floatingTexts.push(new FloatingText('+200', this.x + 2, this.y - 8, '#fcd1a1'));
          // Pop out jumping coin particle
          particles.push(new Particle(this.x + 4, this.y - 12, 0, -4, 'coin1', false));
        } else if (this.content === 'mushroom') {
          audio.powerupAppear();
          items.push(new Mushroom(this.x, this.y - 16));
        }
        this.type = 'empty';
        this.content = null;
      } else if (this.type === 'brick') {
        if (player.isBig) {
          // Shatter brick!
          audio.breakBlock();
          score += 50;
          particles.push(new Particle(this.x, this.y, -2, -4, 'brick'));
          particles.push(new Particle(this.x + 8, this.y, 2, -4, 'brick'));
          particles.push(new Particle(this.x, this.y + 8, -1.5, -2, 'brick'));
          particles.push(new Particle(this.x + 8, this.y + 8, 1.5, -2, 'brick'));
          this.destroyed = true;
          return;
        } else {
          audio.bump();
        }
      }

      // Check if enemy is standing on top of this block when bumped!
      enemies.forEach(e => {
        if (!e.isDead && Math.abs(e.x - this.x) < 14 && Math.abs(e.y + e.h - this.y) < 6) {
          e.die(true);
        }
      });
    }

    update() {
      this.animTimer++;
      if (this.bumpTimer > 0) {
        this.bumpTimer--;
        this.bumpOffset = Math.sin((12 - this.bumpTimer) / 12 * Math.PI) * 6;
      } else {
        this.bumpOffset = 0;
      }
    }

    draw(ctx) {
      const renderY = this.y - this.bumpOffset;
      if (this.type === 'ground') {
        SpriteEngine.draw(ctx, 'ground', this.x - cameraX, renderY);
      } else if (this.type === 'brick') {
        SpriteEngine.draw(ctx, 'brick', this.x - cameraX, renderY);
      } else if (this.type === 'empty') {
        SpriteEngine.draw(ctx, 'block_empty', this.x - cameraX, renderY);
      } else if (this.type === 'question') {
        const frame = Math.floor(this.animTimer / 15) % 2 === 0 ? 'question1' : 'question2';
        SpriteEngine.draw(ctx, frame, this.x - cameraX, renderY);
      } else {
        SpriteEngine.draw(ctx, this.type, this.x - cameraX, renderY);
      }
    }
  }

  class Item {
    constructor(x, y, w, h) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.vx = 0;
      this.vy = 0;
      this.isCollected = false;
    }
  }

  class Mushroom extends Item {
    constructor(x, y) {
      super(x, y, 16, 16);
      this.vx = 1.0;
      this.vy = -1.5;
    }

    update() {
      this.vy = Math.min(this.vy + GRAVITY, MAX_FALL_SPEED);

      // Horizontal move
      this.x += this.vx;
      blocks.forEach(b => {
        if (b.destroyed) return;
        if (checkRectCollide(this, b)) {
          if (this.vx > 0) {
            this.x = b.x - this.w;
            this.vx = -this.vx;
          } else if (this.vx < 0) {
            this.x = b.x + b.w;
            this.vx = -this.vx;
          }
        }
      });

      // Vertical move
      this.y += this.vy;
      blocks.forEach(b => {
        if (b.destroyed) return;
        if (checkRectCollide(this, b)) {
          if (this.vy > 0) {
            this.y = b.y - this.h;
            this.vy = 0;
          } else if (this.vy < 0) {
            this.y = b.y + b.h;
            this.vy = 0;
          }
        }
      });

      // Player pickup
      if (checkRectCollide(this, player) && !player.isDead) {
        this.isCollected = true;
        audio.powerup();
        player.grow();
        score += 1000;
        floatingTexts.push(new FloatingText('+1000', this.x, this.y - 8, '#fcd1a1'));
      }
    }

    draw(ctx) {
      SpriteEngine.draw(ctx, 'mushroom', this.x - cameraX, this.y);
    }
  }

  class CoinPickup extends Item {
    constructor(x, y) {
      super(x + 2, y + 2, 12, 12);
      this.animTimer = 0;
    }
    update() {
      this.animTimer++;
      if (checkRectCollide(this, player) && !player.isDead) {
        this.isCollected = true;
        audio.coin();
        coins++;
        score += 200;
        floatingTexts.push(new FloatingText('+200', this.x, this.y - 8, '#fcd1a1'));
      }
    }
    draw(ctx) {
      const frameIdx = Math.floor(this.animTimer / 8) % 4;
      const key = frameIdx === 0 ? 'coin1' : (frameIdx === 1 ? 'coin2' : (frameIdx === 2 ? 'coin3' : 'coin2'));
      SpriteEngine.draw(ctx, key, this.x - 2 - cameraX, this.y - 2);
    }
  }

  class Enemy {
    constructor(x, y, type = 'goomba') {
      this.x = x;
      this.y = y;
      this.w = 16;
      this.h = 16;
      this.type = type;
      this.vx = -0.7;
      this.vy = 0;
      this.isGrounded = false;
      this.isDead = false;
      this.deadTimer = 0;
      this.animTimer = 0;
      // Koopa specific
      this.isShell = false;
      this.shellSpeed = 0;
    }

    update() {
      if (this.isDead) {
        this.deadTimer--;
        if (this.type === 'koopa' && !this.isShell) {
          this.y += this.vy;
          this.vy += GRAVITY;
        }
        return;
      }

      // Don't activate until close to camera
      if (this.x > cameraX + CANVAS_WIDTH + 48) return;

      this.animTimer++;
      this.vy = Math.min(this.vy + GRAVITY, MAX_FALL_SPEED);

      if (this.isShell) {
        this.vx = this.shellSpeed;
      }

      // Move horizontally
      this.x += this.vx;
      blocks.forEach(b => {
        if (b.destroyed) return;
        if (checkRectCollide(this, b)) {
          if (this.vx > 0) {
            this.x = b.x - this.w;
            this.vx = -this.vx;
            if (this.isShell) audio.bump();
          } else if (this.vx < 0) {
            this.x = b.x + b.w;
            this.vx = -this.vx;
            if (this.isShell) audio.bump();
          }
        }
      });

      // Move vertically
      this.y += this.vy;
      this.isGrounded = false;
      blocks.forEach(b => {
        if (b.destroyed) return;
        if (checkRectCollide(this, b)) {
          if (this.vy > 0) {
            this.y = b.y - this.h;
            this.vy = 0;
            this.isGrounded = true;
          } else if (this.vy < 0) {
            this.y = b.y + b.h;
            this.vy = 0;
          }
        }
      });

      // Shell hitting other enemies!
      if (this.isShell && Math.abs(this.shellSpeed) > 0.5) {
        enemies.forEach(other => {
          if (other !== this && !other.isDead && checkRectCollide(this, other)) {
            other.die(true);
            score += 200;
            audio.stomp();
            floatingTexts.push(new FloatingText('+200', other.x, other.y - 8, '#fcd1a1'));
          }
        });
      }

      // Despawn if fallen into pit
      if (this.y > CANVAS_HEIGHT + 32) {
        this.isDead = true;
        this.deadTimer = 0;
      }
    }

    die(fromFlip = false) {
      if (this.isDead) return;
      if (fromFlip) {
        this.isDead = true;
        this.deadTimer = 30;
        this.vy = -3.5;
        this.vx = 0.5;
        return;
      }

      if (this.type === 'goomba') {
        this.isDead = true;
        this.deadTimer = 30;
        this.vx = 0;
        this.vy = 0;
      } else if (this.type === 'koopa') {
        if (!this.isShell) {
          this.isShell = true;
          this.shellSpeed = 0;
          this.vx = 0;
        }
      }
    }

    draw(ctx) {
      if (this.isDead && this.type === 'goomba') {
        SpriteEngine.draw(ctx, 'goomba_flat', this.x - cameraX, this.y);
        return;
      }
      if (this.isDead && this.deadTimer > 0) {
        // Flipped dying animation
        ctx.save();
        ctx.translate(this.x - cameraX + 8, this.y + 8);
        ctx.scale(1, -1);
        SpriteEngine.draw(ctx, this.type === 'goomba' ? 'goomba_walk1' : 'koopa_shell', -8, -8);
        ctx.restore();
        return;
      }

      if (this.type === 'goomba') {
        const frame = Math.floor(this.animTimer / 10) % 2 === 0 ? 'goomba_walk1' : 'goomba_walk2';
        SpriteEngine.draw(ctx, frame, this.x - cameraX, this.y);
      } else if (this.type === 'koopa') {
        if (this.isShell) {
          SpriteEngine.draw(ctx, 'koopa_shell', this.x - cameraX, this.y);
        } else {
          const frame = Math.floor(this.animTimer / 10) % 2 === 0 ? 'koopa_walk1' : 'koopa_walk2';
          SpriteEngine.draw(ctx, frame, this.x - cameraX, this.y - 8, this.vx > 0);
        }
      }
    }
  }

  class Player {
    constructor() {
      this.reset(32, 160);
    }

    reset(x, y) {
      this.x = x;
      this.y = y;
      this.w = 12;
      this.h = 16;
      this.vx = 0;
      this.vy = 0;
      this.isGrounded = false;
      this.isJumping = false;
      this.facingRight = true;
      this.isBig = false;
      this.isDead = false;
      this.deadTimer = 0;
      this.invulnerableTimer = 0;
      this.animTimer = 0;
      this.growTimer = 0;
      this.reachedFlag = false;
      this.walkSpeed = 1.6;
      this.runSpeed = 2.4;
      this.accel = 0.12;
      this.friction = 0.86;
      this.jumpImpulse = -5.4;
    }

    grow() {
      if (this.isBig) return;
      this.isBig = true;
      this.h = 28;
      this.y -= 12;
      this.growTimer = 30;
    }

    shrink() {
      if (!this.isBig) return;
      this.isBig = false;
      this.h = 16;
      this.y += 12;
      this.invulnerableTimer = 90;
      audio.pipe();
    }

    die() {
      if (this.isDead) return;
      this.isDead = true;
      this.deadTimer = 90;
      this.vx = 0;
      this.vy = -6.5;
      audio.die();
    }

    update() {
      if (this.isDead) {
        this.deadTimer--;
        this.y += this.vy;
        this.vy += GRAVITY * 0.9;
        if (this.deadTimer <= 0) {
          lives--;
          if (lives > 0) {
            restartLevel();
          } else {
            gameState = 'GAME_OVER';
          }
        }
        return;
      }

      if (this.growTimer > 0) {
        this.growTimer--;
        return;
      }

      if (this.invulnerableTimer > 0) {
        this.invulnerableTimer--;
      }

      if (this.reachedFlag) {
        // Flagpole sliding & castle walk animation
        this.y += 2.0;
        const groundY = 12 * TILE_SIZE - this.h;
        if (this.y >= groundY) {
          this.y = groundY;
          this.vx = 1.2;
          this.x += this.vx;
          this.facingRight = true;
          this.animTimer++;
          if (this.x >= castle.x + 24) {
            gameState = 'LEVEL_CLEAR';
          }
        }
        return;
      }

      // Controls
      const targetSpeed = keys['Shift'] || keys['KeyX'] ? this.runSpeed : this.walkSpeed;
      if (keys['ArrowLeft'] || keys['KeyA']) {
        this.vx -= this.accel;
        if (this.vx < -targetSpeed) this.vx = -targetSpeed;
        this.facingRight = false;
      } else if (keys['ArrowRight'] || keys['KeyD']) {
        this.vx += this.accel;
        if (this.vx > targetSpeed) this.vx = targetSpeed;
        this.facingRight = true;
      } else {
        this.vx *= this.friction;
        if (Math.abs(this.vx) < 0.05) this.vx = 0;
      }

      // Jump control (variable height)
      const wantsJump = keys['ArrowUp'] || keys['KeyW'] || keys['Space'] || keys['KeyZ'];
      if (wantsJump && this.isGrounded && !this.isJumping) {
        this.vy = this.jumpImpulse;
        this.isGrounded = false;
        this.isJumping = true;
        this.jumpTimer = 14;
        audio.jump();
      } else if (wantsJump && this.isJumping && this.jumpTimer > 0) {
        this.vy -= 0.16; // Continue applying upward thrust while holding jump
        this.jumpTimer--;
      } else {
        this.isJumping = false;
      }

      // Gravity
      this.vy = Math.min(this.vy + GRAVITY, MAX_FALL_SPEED);

      // Horizontal movement & collision
      this.x += this.vx;
      if (this.x < cameraX) {
        this.x = cameraX;
        this.vx = 0;
      }

      blocks.forEach(b => {
        if (b.destroyed) return;
        if (checkRectCollide(this, b)) {
          if (this.vx > 0) {
            this.x = b.x - this.w;
            this.vx = 0;
          } else if (this.vx < 0) {
            this.x = b.x + b.w;
            this.vx = 0;
          }
        }
      });

      // Vertical movement & collision
      this.y += this.vy;
      this.isGrounded = false;

      blocks.forEach(b => {
        if (b.destroyed) return;
        if (checkRectCollide(this, b)) {
          if (this.vy > 0) {
            // Landing on top of block
            this.y = b.y - this.h;
            this.vy = 0;
            this.isGrounded = true;
          } else if (this.vy < 0) {
            // Head bump against bottom of block
            this.y = b.y + b.h;
            this.vy = 0;
            b.bump();
          }
        }
      });

      // Enemy interactions
      enemies.forEach(e => {
        if (e.isDead && e.type !== 'koopa') return;
        if (checkRectCollide(this, e)) {
          if (e.isShell && Math.abs(e.shellSpeed) < 0.1) {
            // Kick the dormant shell!
            e.shellSpeed = (this.x < e.x) ? 4.5 : -4.5;
            audio.stomp();
            score += 100;
            floatingTexts.push(new FloatingText('+100', e.x, e.y - 8, '#fcd1a1'));
          } else if (this.vy > 0 && this.y + this.h - this.vy <= e.y + 10) {
            // Stomp enemy from above!
            audio.stomp();
            this.vy = -4.2;
            if (e.isShell) {
              e.shellSpeed = 0; // stop sliding shell
            } else {
              e.die();
            }
            score += 100;
            floatingTexts.push(new FloatingText('+100', e.x, e.y - 8, '#fcd1a1'));
          } else {
            // Enemy hits player
            if (e.isShell && Math.abs(e.shellSpeed) < 0.1) {
              e.shellSpeed = (this.x < e.x) ? 4.5 : -4.5;
              audio.stomp();
            } else if (this.invulnerableTimer === 0) {
              if (this.isBig) {
                this.shrink();
              } else {
                this.die();
              }
            }
          }
        }
      });

      // Check Flagpole collision
      if (flagPole && checkRectCollide(this, flagPole) && !this.reachedFlag) {
        this.reachedFlag = true;
        this.vx = 0;
        this.vy = 0;
        audio.stageClear();
        score += 2000;
        floatingTexts.push(new FloatingText('+2000', flagPole.x, this.y, '#ffff00'));
      }

      // Check pit death
      if (this.y > CANVAS_HEIGHT + 16) {
        this.die();
      }

      // Animation cycle
      if (Math.abs(this.vx) > 0.1 && this.isGrounded) {
        this.animTimer += Math.abs(this.vx) * 0.2;
      } else {
        this.animTimer = 0;
      }
    }

    draw(ctx) {
      if (this.isDead) {
        SpriteEngine.draw(ctx, 'mario_die', this.x - cameraX - 2, this.y);
        return;
      }

      // Flashing when invulnerable
      if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer / 4) % 2 === 0) {
        return;
      }

      let spriteKey = 'mario_idle';
      if (this.isBig) {
        if (!this.isGrounded) {
          spriteKey = 'mario_big_jump';
        } else if (Math.abs(this.vx) > 0.1) {
          const runFrame = Math.floor(this.animTimer) % 3 + 1;
          spriteKey = `mario_big_run${runFrame}`;
        } else {
          spriteKey = 'mario_big_idle';
        }
      } else {
        if (!this.isGrounded) {
          spriteKey = 'mario_jump';
        } else if (Math.abs(this.vx) > 0.1) {
          const runFrame = Math.floor(this.animTimer) % 3 + 1;
          spriteKey = `mario_run${runFrame}`;
        }
      }

      SpriteEngine.draw(ctx, spriteKey, this.x - cameraX - 2, this.y, !this.facingRight);
    }
  }

  function checkRectCollide(r1, r2) {
    return (
      r1.x < r2.x + r2.w &&
      r1.x + r1.w > r2.x &&
      r1.y < r2.y + r2.h &&
      r1.y + r1.h > r2.y
    );
  }

  function buildLevel() {
    blocks = [];
    enemies = [];
    items = [];
    particles = [];
    floatingTexts = [];
    scenery = [];

    // Continuous ground with a few classic pits
    const pit1 = { start: 69, end: 71 };
    const pit2 = { start: 86, end: 89 };
    const pit3 = { start: 153, end: 155 };

    for (let col = 0; col < LEVEL_TILES_WIDTH; col++) {
      if (
        (col >= pit1.start && col <= pit1.end) ||
        (col >= pit2.start && col <= pit2.end) ||
        (col >= pit3.start && col <= pit3.end)
      ) {
        continue;
      }
      blocks.push(new Block(col * TILE_SIZE, 12 * TILE_SIZE, 'ground'));
      blocks.push(new Block(col * TILE_SIZE, 13 * TILE_SIZE, 'ground'));
    }

    // Helper for pipes
    function addPipe(col, heightInTiles) {
      const topRow = 12 - heightInTiles;
      const x = col * TILE_SIZE;
      blocks.push(new Block(x, topRow * TILE_SIZE, 'pipe_top_left'));
      blocks.push(new Block(x + TILE_SIZE, topRow * TILE_SIZE, 'pipe_top_right'));
      for (let r = topRow + 1; r < 12; r++) {
        blocks.push(new Block(x, r * TILE_SIZE, 'pipe_shaft_left'));
        blocks.push(new Block(x + TILE_SIZE, r * TILE_SIZE, 'pipe_shaft_right'));
      }
    }

    addPipe(28, 2);
    addPipe(38, 3);
    addPipe(46, 4);
    addPipe(57, 4);
    addPipe(163, 2);
    addPipe(179, 2);

    // Question blocks & bricks layout (World 1-1 style)
    // Initial ? block
    blocks.push(new Block(16 * TILE_SIZE, 8 * TILE_SIZE, 'question', 'coin'));

    // Question / Brick row 1
    blocks.push(new Block(20 * TILE_SIZE, 8 * TILE_SIZE, 'brick'));
    blocks.push(new Block(21 * TILE_SIZE, 8 * TILE_SIZE, 'question', 'mushroom'));
    blocks.push(new Block(22 * TILE_SIZE, 8 * TILE_SIZE, 'brick'));
    blocks.push(new Block(23 * TILE_SIZE, 8 * TILE_SIZE, 'question', 'coin'));
    blocks.push(new Block(24 * TILE_SIZE, 8 * TILE_SIZE, 'brick'));

    // High ? block
    blocks.push(new Block(22 * TILE_SIZE, 4 * TILE_SIZE, 'question', 'coin'));

    // Floating Coins in arc
    items.push(new CoinPickup(31 * TILE_SIZE, 9 * TILE_SIZE));
    items.push(new CoinPickup(32 * TILE_SIZE, 8 * TILE_SIZE));
    items.push(new CoinPickup(33 * TILE_SIZE, 9 * TILE_SIZE));

    // Mid section blocks
    blocks.push(new Block(64 * TILE_SIZE, 8 * TILE_SIZE, 'brick'));
    blocks.push(new Block(65 * TILE_SIZE, 8 * TILE_SIZE, 'question', 'mushroom'));
    blocks.push(new Block(66 * TILE_SIZE, 8 * TILE_SIZE, 'brick'));

    for (let c = 80; c <= 87; c++) {
      blocks.push(new Block(c * TILE_SIZE, 4 * TILE_SIZE, 'brick'));
    }
    blocks.push(new Block(91 * TILE_SIZE, 8 * TILE_SIZE, 'brick'));
    blocks.push(new Block(92 * TILE_SIZE, 8 * TILE_SIZE, 'brick'));
    blocks.push(new Block(93 * TILE_SIZE, 8 * TILE_SIZE, 'question', 'coin'));
    blocks.push(new Block(94 * TILE_SIZE, 8 * TILE_SIZE, 'brick'));

    // Pyramids / Stairs before flagpole
    function addStairs(startCol, height, faceRight = true) {
      for (let h = 1; h <= height; h++) {
        const col = faceRight ? startCol + (h - 1) : startCol + (height - h);
        for (let r = 0; r < h; r++) {
          blocks.push(new Block(col * TILE_SIZE, (11 - r) * TILE_SIZE, 'ground'));
        }
      }
    }

    addStairs(134, 4, true);
    addStairs(140, 4, false);
    addStairs(148, 4, true);
    addStairs(155, 4, false);
    addStairs(181, 8, true);

    // Flagpole at col 198
    const flagCol = 198;
    flagPole = {
      x: flagCol * TILE_SIZE + 6,
      y: 3 * TILE_SIZE,
      w: 4,
      h: 9 * TILE_SIZE
    };
    blocks.push(new Block(flagCol * TILE_SIZE, 11 * TILE_SIZE, 'ground'));

    // Castle at col 202
    castle = {
      x: 202 * TILE_SIZE,
      y: 7 * TILE_SIZE,
      w: 5 * TILE_SIZE,
      h: 5 * TILE_SIZE
    };

    // Populate Enemies
    enemies.push(new Enemy(22 * TILE_SIZE, 11 * TILE_SIZE, 'goomba'));
    enemies.push(new Enemy(41 * TILE_SIZE, 11 * TILE_SIZE, 'goomba'));
    enemies.push(new Enemy(51 * TILE_SIZE, 11 * TILE_SIZE, 'goomba'));
    enemies.push(new Enemy(53 * TILE_SIZE, 11 * TILE_SIZE, 'goomba'));
    enemies.push(new Enemy(82 * TILE_SIZE, 11 * TILE_SIZE, 'koopa'));
    enemies.push(new Enemy(98 * TILE_SIZE, 11 * TILE_SIZE, 'goomba'));
    enemies.push(new Enemy(107 * TILE_SIZE, 11 * TILE_SIZE, 'goomba'));
    enemies.push(new Enemy(125 * TILE_SIZE, 11 * TILE_SIZE, 'koopa'));
    enemies.push(new Enemy(174 * TILE_SIZE, 11 * TILE_SIZE, 'goomba'));

    // Background scenery (clouds, bushes, hills)
    for (let c = 5; c < LEVEL_TILES_WIDTH; c += 24) {
      scenery.push({ type: 'cloud', x: c * TILE_SIZE, y: 32 });
      scenery.push({ type: 'hill', x: (c + 8) * TILE_SIZE, y: 12 * TILE_SIZE });
      scenery.push({ type: 'bush', x: (c + 14) * TILE_SIZE, y: 12 * TILE_SIZE });
    }
  }

  function restartLevel() {
    cameraX = 0;
    maxCameraX = 0;
    timeLeft = 400;
    player.reset(32, 160);
    buildLevel();
    audio.startMusic();
  }

  function startNewGame() {
    score = 0;
    coins = 0;
    lives = 3;
    gameState = 'PLAYING';
    restartLevel();
  }

  function drawHUD(ctx) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px monospace';

    // Mario Score
    ctx.fillText('MARIO', 16, 12);
    ctx.fillText(String(score).padStart(6, '0'), 16, 22);

    // Coins
    SpriteEngine.draw(ctx, 'coin1', 84, 14);
    ctx.fillText(`x${String(coins).padStart(2, '0')}`, 98, 22);

    // World
    ctx.fillText('WORLD', 148, 12);
    ctx.fillText(' 1-1', 148, 22);

    // Time
    ctx.fillText('TIME', 208, 12);
    ctx.fillText(String(Math.max(0, Math.floor(timeLeft))).padStart(3, '0'), 212, 22);

    // Lives
    ctx.fillText(`LIVES: ${lives}`, 16, CANVAS_HEIGHT - 6);

    ctx.restore();
  }

  function drawScenery(ctx) {
    scenery.forEach(s => {
      const screenX = s.x - cameraX * 0.7; // slight parallax
      if (screenX < -64 || screenX > CANVAS_WIDTH + 64) return;

      if (s.type === 'cloud') {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(screenX + 16, s.y + 12, 12, 0, Math.PI * 2);
        ctx.arc(screenX + 28, s.y + 8, 14, 0, Math.PI * 2);
        ctx.arc(screenX + 44, s.y + 12, 12, 0, Math.PI * 2);
        ctx.fill();
      } else if (s.type === 'hill') {
        ctx.fillStyle = '#00a800';
        ctx.beginPath();
        ctx.arc(s.x - cameraX, s.y, 28, Math.PI, 0, false);
        ctx.fill();
        ctx.strokeStyle = '#005000';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (s.type === 'bush') {
        ctx.fillStyle = '#80d010';
        ctx.beginPath();
        ctx.arc(s.x - cameraX + 8, s.y - 6, 8, 0, Math.PI * 2);
        ctx.arc(s.x - cameraX + 18, s.y - 10, 10, 0, Math.PI * 2);
        ctx.arc(s.x - cameraX + 28, s.y - 6, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw Flagpole
    if (flagPole) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(flagPole.x - cameraX, flagPole.y, flagPole.w, flagPole.h);
      ctx.fillStyle = '#00a800';
      ctx.beginPath();
      ctx.arc(flagPole.x - cameraX + 2, flagPole.y, 4, 0, Math.PI * 2);
      ctx.fill();
      // Flag
      const flagY = player.reachedFlag ? Math.min(flagPole.y + flagPole.h - 16, player.y) : flagPole.y + 4;
      SpriteEngine.draw(ctx, 'flag', flagPole.x - cameraX - 14, flagY);
    }

    // Draw Castle
    if (castle) {
      ctx.fillStyle = '#c84c0c';
      ctx.fillRect(castle.x - cameraX, castle.y, castle.w, castle.h);
      // Battlements
      ctx.fillRect(castle.x - cameraX - 4, castle.y - 8, 12, 8);
      ctx.fillRect(castle.x - cameraX + 16, castle.y - 8, 12, 8);
      ctx.fillRect(castle.x - cameraX + 36, castle.y - 8, 12, 8);
      ctx.fillRect(castle.x - cameraX + 56, castle.y - 8, 12, 8);
      ctx.fillRect(castle.x - cameraX + 72, castle.y - 8, 12, 8);
      // Doorway
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(castle.x - cameraX + 40, castle.y + 48, 14, Math.PI, 0);
      ctx.fillRect(castle.x - cameraX + 26, castle.y + 48, 28, 32);
      ctx.fill();
    }
  }

  function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    if (gameState === 'PLAYING') {
      timeAccumulator += dt;
      if (timeAccumulator >= 0.4) {
        timeAccumulator = 0;
        timeLeft -= 1;
        if (timeLeft <= 0) {
          player.die();
        }
      }

      player.update();

      // Camera horizontal follow
      if (player.x - cameraX > CANVAS_WIDTH * 0.45) {
        cameraX = player.x - CANVAS_WIDTH * 0.45;
      }
      cameraX = Math.max(0, Math.min(cameraX, LEVEL_WIDTH - CANVAS_WIDTH));

      // Update blocks
      blocks.forEach(b => b.update());
      blocks = blocks.filter(b => !b.destroyed);

      // Update enemies
      enemies.forEach(e => e.update());
      enemies = enemies.filter(e => !e.isDead || e.deadTimer > 0);

      // Update items
      items.forEach(item => item.update());
      items = items.filter(item => !item.isCollected);

      // Update particles
      particles.forEach(p => p.update());
      particles = particles.filter(p => p.life > 0);

      // Update floating texts
      floatingTexts.forEach(ft => ft.update());
      floatingTexts = floatingTexts.filter(ft => ft.life > 0);
    }

    // Render pass
    ctx.fillStyle = '#61afff'; // Bright vibrant sky blue
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    drawScenery(ctx);
    blocks.forEach(b => b.draw(ctx));
    items.forEach(item => item.draw(ctx));
    enemies.forEach(e => e.draw(ctx));
    player.draw(ctx);
    particles.forEach(p => p.draw(ctx));
    floatingTexts.forEach(ft => ft.draw(ctx));
    drawHUD(ctx);

    // Overlay Screens
    if (gameState === 'START') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#fcb800';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SUPER MARIO WEB', CANVAS_WIDTH / 2, 70);
      ctx.fillStyle = '#ffffff';
      ctx.font = '8px monospace';
      ctx.fillText('PRESS ENTER OR TAP TO START', CANVAS_WIDTH / 2, 110);
      ctx.fillText('ARROWS/WASD : MOVE', CANVAS_WIDTH / 2, 135);
      ctx.fillText('SPACE / Z / UP : JUMP', CANVAS_WIDTH / 2, 148);
      ctx.fillText('SHIFT / X : SPRINT', CANVAS_WIDTH / 2, 161);
      ctx.fillText('M : MUTE AUDIO', CANVAS_WIDTH / 2, 174);
      ctx.textAlign = 'left';
    } else if (gameState === 'LEVEL_CLEAR') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#fcb800';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('STAGE CLEAR!', CANVAS_WIDTH / 2, 80);
      ctx.fillStyle = '#ffffff';
      ctx.font = '8px monospace';
      ctx.fillText(`FINAL SCORE: ${score}`, CANVAS_WIDTH / 2, 110);
      ctx.fillText('PRESS ENTER OR TAP TO REPLAY', CANVAS_WIDTH / 2, 140);
      ctx.textAlign = 'left';
    } else if (gameState === 'GAME_OVER') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#e52521';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, 90);
      ctx.fillStyle = '#ffffff';
      ctx.font = '8px monospace';
      ctx.fillText('PRESS ENTER OR TAP TO TRY AGAIN', CANVAS_WIDTH / 2, 125);
      ctx.textAlign = 'left';
    }

    requestAnimationFrame(gameLoop);
  }

  function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    audio = new RetroAudio();
    SpriteEngine.init();

    player = new Player();
    buildLevel();

    // Keyboard handlers
    window.addEventListener('keydown', e => {
      keys[e.code] = true;
      audio.ensureContext();

      if (e.code === 'KeyM') {
        const isMuted = audio.toggleMute();
        const muteBtn = document.getElementById('muteBtn');
        if (muteBtn) muteBtn.innerText = isMuted ? '🔇 Unmute' : '🔊 Sound On';
      }

      if (e.code === 'Enter' || e.code === 'Space') {
        if (gameState === 'START' || gameState === 'LEVEL_CLEAR' || gameState === 'GAME_OVER') {
          startNewGame();
        }
      }
    });

    window.addEventListener('keyup', e => {
      keys[e.code] = false;
    });

    // Touch & Virtual Control bindings
    setupVirtualControls();

    requestAnimationFrame(gameLoop);
  }

  function setupVirtualControls() {
    const bindBtn = (id, keyCode) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      const startHandler = (e) => {
        e.preventDefault();
        keys[keyCode] = true;
        audio.ensureContext();
        if (gameState === 'START' || gameState === 'LEVEL_CLEAR' || gameState === 'GAME_OVER') {
          startNewGame();
        }
      };
      const endHandler = (e) => {
        e.preventDefault();
        keys[keyCode] = false;
      };
      btn.addEventListener('touchstart', startHandler, { passive: false });
      btn.addEventListener('touchend', endHandler, { passive: false });
      btn.addEventListener('mousedown', startHandler);
      btn.addEventListener('mouseup', endHandler);
      btn.addEventListener('mouseleave', endHandler);
    };

    bindBtn('btnLeft', 'ArrowLeft');
    bindBtn('btnRight', 'ArrowRight');
    bindBtn('btnDown', 'ArrowDown');
    bindBtn('btnJump', 'Space');
    bindBtn('btnRun', 'Shift');

    // Canvas click to start
    canvas.addEventListener('click', () => {
      audio.ensureContext();
      if (gameState === 'START' || gameState === 'LEVEL_CLEAR' || gameState === 'GAME_OVER') {
        startNewGame();
      }
    });

    // Sound toggle button
    const muteBtn = document.getElementById('muteBtn');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        audio.ensureContext();
        const isMuted = audio.toggleMute();
        muteBtn.innerText = isMuted ? '🔇 Unmute' : '🔊 Sound On';
      });
    }

    // Restart button
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        audio.ensureContext();
        startNewGame();
      });
    }
  }

  window.addEventListener('load', init);
})();
