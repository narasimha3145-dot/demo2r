// Procedural Pixel-Art Sprite Engine for Mario Game
const SpriteEngine = (() => {
  const PALETTES = {
    mario: {
      'R': '#e52521', // Red
      'B': '#0038c8', // Blue
      'S': '#fcd1a1', // Skin
      'H': '#502800', // Hair/Brown
      'Y': '#fcb800', // Yellow
      'W': '#ffffff', // White
      '.': null
    },
    goomba: {
      'O': '#a84400', // Dark Orange / Brown
      'Y': '#fce0a8', // Belly / Tan
      'F': '#000000', // Feet / Eyes
      '.': null
    },
    koopa: {
      'G': '#00a800', // Shell Green
      'Y': '#fce0a8', // Skin Yellow
      'W': '#ffffff', // White
      'B': '#000000', // Eye black
      'O': '#d88000', // Orange/Shoe
      '.': null
    },
    block: {
      'B': '#c84c0c', // Brick Brown
      'D': '#602000', // Dark Mortar
      'L': '#fca044', // Highlight
      'Y': '#fcb800', // Question Yellow
      'O': '#e47400', // Question Dark
      'W': '#ffffff', // Question White
      'S': '#888888', // Metal gray
      'K': '#444444', // Dark gray
      '.': null
    },
    pipe: {
      'G': '#00a800', // Green
      'L': '#70e000', // Highlight
      'D': '#005000', // Dark shadow
      'B': '#000000', // Black outline
      'b': '#000000', // Black outline
      '.': null
    },
    item: {
      'R': '#e52521', // Mushroom Red
      'W': '#ffffff', // White
      'S': '#fcd1a1', // Tan Stem
      'B': '#000000', // Eyes
      'Y': '#fcb800', // Coin Yellow
      'O': '#f08000', // Coin Orange
      'L': '#fff890', // Coin Highlight
      '.': null
    }
  };

  const DATA = {
    mario_idle: {
      palette: 'mario',
      rows: [
        '.....RRRRR......',
        '....RRRRRRRRR...',
        '....HHHSSHS.....',
        '...HSHSSSHSSS...',
        '...HSHHSSSHSSS..',
        '...HHSSSSHHHH...',
        '.....SSSSSSS....',
        '....RRBRR.......',
        '...RRRBRRBRRR...',
        '..RRRRBBBBBRRR..',
        '..SS.BBYBBYB.SS.',
        '..SSBBBBBBBB.SS.',
        '...BBBBBBBBBB...',
        '...BBBB..BBBB...',
        '..HHH......HHH..',
        '.HHHH......HHHH.'
      ]
    },
    mario_run1: {
      palette: 'mario',
      rows: [
        '.....RRRRR......',
        '....RRRRRRRRR...',
        '....HHHSSHS.....',
        '...HSHSSSHSSS...',
        '...HSHHSSSHSSS..',
        '...HHSSSSHHHH...',
        '.....SSSSSSS....',
        '....RRBRR.......',
        '...RRRBBBRRR....',
        '..RRRRBBBBBRRR..',
        '..SSBBBYBBYBSS..',
        '..SSBBBBBBBBSS..',
        '..BBBBBBBBBB....',
        '.HHHH.BBBB......',
        'HHHHH.HHHH......',
        '......HHHH......'
      ]
    },
    mario_run2: {
      palette: 'mario',
      rows: [
        '.....RRRRR......',
        '....RRRRRRRRR...',
        '....HHHSSHS.....',
        '...HSHSSSHSSS...',
        '...HSHHSSSHSSS..',
        '...HHSSSSHHHH...',
        '.....SSSSSSS....',
        '....RRBRR.......',
        '...RRRBRRBRRR...',
        '..RRRRBBBBBRRR..',
        '..SS.BBYBBYB....',
        '..SSBBBBBBBB....',
        '...BBBBBBBBBB...',
        '...BBBB..BBBB...',
        '..HHH......HHH..',
        '.HHHH......HHHH.'
      ]
    },
    mario_run3: {
      palette: 'mario',
      rows: [
        '.....RRRRR......',
        '....RRRRRRRRR...',
        '....HHHSSHS.....',
        '...HSHSSSHSSS...',
        '...HSHHSSSHSSS..',
        '...HHSSSSHHHH...',
        '.....SSSSSSS....',
        '....RRBRR.......',
        '....RRBBBRRR....',
        '...RRRBBBBBRRR..',
        '...SSBBYBBYBSS..',
        '...SSBBBBBBBB...',
        '....BBBBBBBBBB..',
        '....BBBB..HHHH..',
        '....HHHH.HHHHH..',
        '....HHHH........'
      ]
    },
    mario_jump: {
      palette: 'mario',
      rows: [
        '.....RRRRR......',
        '....RRRRRRRRR...',
        '....HHHSSHS.....',
        '...HSHSSSHSSS...',
        '...HSHHSSSHSSS..',
        '...HHSSSSHHHH...',
        '.....SSSSSSS....',
        '..SS.RRBRR......',
        '.SSRRRBRRBRRRSS.',
        '..RRRRBBBBBRRSS.',
        '...BBBYBBYBBB...',
        '..BBBBBBBBBBBB..',
        '.HHH.BBBB.HHH...',
        'HHHH.BBBB.HHHH..',
        'HHHH......HHHH..',
        '................'
      ]
    },
    mario_skid: {
      palette: 'mario',
      rows: [
        '.....RRRRR......',
        '....RRRRRRRRR...',
        '....HHHSSHS.....',
        '...HSHSSSHSSS...',
        '...HSHHSSSHSSS..',
        '...HHSSSSHHHH...',
        '.....SSSSSSS....',
        '....RRBRR.......',
        '....RRBRRBRRR...',
        '....RRBBBBBRRR..',
        '...SSBBYBBYB....',
        '..SSBBBBBBBB....',
        '..SSBBBBBBBB....',
        '.HHHH...BBBB....',
        'HHHH.....HHHH...',
        '................'
      ]
    },
    mario_die: {
      palette: 'mario',
      rows: [
        '.....RRRRR......',
        '....RRRRRRRRR...',
        '....HHHSSHS.....',
        '...HSHSSSHSSS...',
        '...HSHHSSSHSSS..',
        '...HHSSSSHHHH...',
        '.....SSSSSSS....',
        '..SS.RRRRR..SS..',
        '.SS.RRRRRRR..SS.',
        '....RRBBBRR.....',
        '...BBBYBBYBBB...',
        '..BBBBBBBBBBBB..',
        '..BB..BBBB..BB..',
        '..HH..BBBB..HH..',
        'HHHH........HHHH',
        '................'
      ]
    },
    // Big Mario (16x32)
    mario_big_idle: {
      palette: 'mario',
      rows: [
        '.....RRRRR......',
        '....RRRRRRRRR...',
        '....RRRRRRRRR...',
        '....HHHSSHS.....',
        '...HSHSSSHSSS...',
        '...HSHSSSHSSS...',
        '...HSHHSSSHSSS..',
        '...HHSSSSHHHH...',
        '.....SSSSSSS....',
        '....RRRRRRR.....',
        '...RRRRRRRRR....',
        '...RRRBRRBRRR...',
        '..RRRRBRRBRRRR..',
        '..RRRRBBBBBRRR..',
        '..RRRRBBBBBRRR..',
        '..SS.BBYBBYB.SS.',
        '..SS.BBYBBYB.SS.',
        '..SSBBBBBBBB.SS.',
        '..SSBBBBBBBB.SS.',
        '...BBBBBBBBBB...',
        '...BBBBBBBBBB...',
        '...BBBB..BBBB...',
        '...BBBB..BBBB...',
        '...BBBB..BBBB...',
        '..HHH......HHH..',
        '..HHH......HHH..',
        '.HHHH......HHHH.',
        '.HHHH......HHHH.',
        'HHHHH......HHHHH',
        '................',
        '................',
        '................'
      ]
    },
    mario_big_run1: {
      palette: 'mario',
      rows: [
        '.....RRRRR......',
        '....RRRRRRRRR...',
        '....RRRRRRRRR...',
        '....HHHSSHS.....',
        '...HSHSSSHSSS...',
        '...HSHSSSHSSS...',
        '...HSHHSSSHSSS..',
        '...HHSSSSHHHH...',
        '.....SSSSSSS....',
        '....RRRRRRR.....',
        '...RRRRRRRRR....',
        '...RRRBRRBRRR...',
        '..RRRRBRRBRRRR..',
        '..RRRRBBBBBRRR..',
        '..RRRRBBBBBRRR..',
        '..SS.BBYBBYB.SS.',
        '..SS.BBYBBYB.SS.',
        '..SSBBBBBBBB.SS.',
        '..SSBBBBBBBB.SS.',
        '..BBBBBBBBBB....',
        '..BBBBBBBBBB....',
        '.HHHH.BBBB......',
        '.HHHH.BBBB......',
        'HHHHH.HHHH......',
        'HHHHH.HHHH......',
        '......HHHH......',
        '......HHHH......',
        '......HHHHH.....',
        '......HHHHH.....',
        '................',
        '................',
        '................'
      ]
    },
    mario_big_run2: {
      palette: 'mario',
      rows: [
        '.....RRRRR......',
        '....RRRRRRRRR...',
        '....RRRRRRRRR...',
        '....HHHSSHS.....',
        '...HSHSSSHSSS...',
        '...HSHSSSHSSS...',
        '...HSHHSSSHSSS..',
        '...HHSSSSHHHH...',
        '.....SSSSSSS....',
        '....RRRRRRR.....',
        '...RRRRRRRRR....',
        '...RRRBRRBRRR...',
        '..RRRRBRRBRRRR..',
        '..RRRRBBBBBRRR..',
        '..RRRRBBBBBRRR..',
        '..SS.BBYBBYB.SS.',
        '..SS.BBYBBYB.SS.',
        '..SSBBBBBBBB.SS.',
        '..SSBBBBBBBB.SS.',
        '...BBBBBBBBBB...',
        '...BBBBBBBBBB...',
        '...BBBB..BBBB...',
        '...BBBB..BBBB...',
        '...BBBB..BBBB...',
        '..HHH......HHH..',
        '..HHH......HHH..',
        '.HHHH......HHHH.',
        '.HHHH......HHHH.',
        'HHHHH......HHHHH',
        '................',
        '................',
        '................'
      ]
    },
    mario_big_run3: {
      palette: 'mario',
      rows: [
        '.....RRRRR......',
        '....RRRRRRRRR...',
        '....RRRRRRRRR...',
        '....HHHSSHS.....',
        '...HSHSSSHSSS...',
        '...HSHSSSHSSS...',
        '...HSHHSSSHSSS..',
        '...HHSSSSHHHH...',
        '.....SSSSSSS....',
        '....RRRRRRR.....',
        '...RRRRRRRRR....',
        '...RRRBRRBRRR...',
        '..RRRRBRRBRRRR..',
        '..RRRRBBBBBRRR..',
        '..RRRRBBBBBRRR..',
        '..SS.BBYBBYB.SS.',
        '..SS.BBYBBYB.SS.',
        '..SSBBBBBBBB.SS.',
        '..SSBBBBBBBB.SS.',
        '....BBBBBBBBBB..',
        '....BBBBBBBBBB..',
        '....BBBB..HHHH..',
        '....BBBB..HHHH..',
        '....HHHH.HHHHH..',
        '....HHHH.HHHHH..',
        '....HHHH........',
        '....HHHH........',
        '...HHHHH........',
        '...HHHHH........',
        '................',
        '................',
        '................'
      ]
    },
    mario_big_jump: {
      palette: 'mario',
      rows: [
        '.....RRRRR......',
        '....RRRRRRRRR...',
        '....RRRRRRRRR...',
        '....HHHSSHS.....',
        '...HSHSSSHSSS...',
        '...HSHSSSHSSS...',
        '...HSHHSSSHSSS..',
        '...HHSSSSHHHH...',
        '.....SSSSSSS....',
        '..SS.RRRRRR..SS.',
        '.SSRRRRRRRRRRSS.',
        '..RRRRBRRBRRRR..',
        '...RRRBBBBBRRR..',
        '...BBBYBBYBBB...',
        '..BBBBBBBBBBBB..',
        '..BBBBBBBBBBBB..',
        '..BBBBBBBBBBBB..',
        '.HHH.BBBB.HHH...',
        '.HHH.BBBB.HHH...',
        'HHHH.BBBB.HHHH..',
        'HHHH......HHHH..',
        'HHHH......HHHH..',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................'
      ]
    },
    // Goomba
    goomba_walk1: {
      palette: 'goomba',
      rows: [
        '......OOOO......',
        '....OOOOOOOO....',
        '...OOOOOOOOOO...',
        '..OOOOOOOOOOOO..',
        '.OOOOOOOOOOOOOO.',
        '.OOOOOOOOOOOOOO.',
        'OOOO.OO..OO.OOOO',
        'OOOO.OO..OO.OOOO',
        'OOOOOOOOOOOOOOOO',
        '..YYYYYYYYYYYY..',
        '..YYYYYYYYYYYY..',
        '...YYY....YYY...',
        '..FFFF....FFFF..',
        '.FFFFFF..FFFFFF.',
        '.FFFFFF..FFFFFF.',
        '..FFFF....FFFF..'
      ]
    },
    goomba_walk2: {
      palette: 'goomba',
      rows: [
        '......OOOO......',
        '....OOOOOOOO....',
        '...OOOOOOOOOO...',
        '..OOOOOOOOOOOO..',
        '.OOOOOOOOOOOOOO.',
        '.OOOOOOOOOOOOOO.',
        'OOOO.OO..OO.OOOO',
        'OOOO.OO..OO.OOOO',
        'OOOOOOOOOOOOOOOO',
        '..YYYYYYYYYYYY..',
        '..YYYYYYYYYYYY..',
        '...YYY....YYY...',
        '.FFFFFF.........',
        '.FFFFFF..FFFFFF.',
        '..FFFF..FFFFFFF.',
        '.........FFFFF..'
      ]
    },
    goomba_flat: {
      palette: 'goomba',
      rows: [
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '....OOOOOOOO....',
        '...OOOOOOOOOO...',
        '..OOOOOOOOOOOO..',
        'OOOO.OO..OO.OOOO',
        'OOOOOOOOOOOOOOOO',
        '..FFFFFFFFFFFF..',
        '.FFFFFFFFFFFFFF.'
      ]
    },
    // Koopa
    koopa_walk1: {
      palette: 'koopa',
      rows: [
        '......YYYY......',
        '.....YYYYYY.....',
        '.....YYYYYY.....',
        '....YYBBYYYY....',
        '....YYBBYYYY....',
        '....YYYYYYYY....',
        '.....YYYYYY.....',
        '.....GGGG.......',
        '...GGWWGGGG.....',
        '..GGWWWWGGGG....',
        '..GGWWWWGGGG....',
        '..GGWWWWGGGG....',
        '...GGGGGGGG.....',
        '....GG..GG......',
        '...OOOO..OOOO...',
        '..OOOOO..OOOOO..'
      ]
    },
    koopa_walk2: {
      palette: 'koopa',
      rows: [
        '......YYYY......',
        '.....YYYYYY.....',
        '.....YYYYYY.....',
        '....YYBBYYYY....',
        '....YYBBYYYY....',
        '....YYYYYYYY....',
        '.....YYYYYY.....',
        '.....GGGG.......',
        '...GGWWGGGG.....',
        '..GGWWWWGGGG....',
        '..GGWWWWGGGG....',
        '..GGWWWWGGGG....',
        '...GGGGGGGG.....',
        '....GG..GG......',
        '..OOOOO.........',
        '..OOOOO..OOOOO..'
      ]
    },
    koopa_shell: {
      palette: 'koopa',
      rows: [
        '................',
        '................',
        '................',
        '.....GGGGGG.....',
        '...GGGGGGGGGG...',
        '..GGWWGGGGWWGG..',
        '.GGWWWWGGWWWWGG.',
        '.GGWWWWGGWWWWGG.',
        '.GGWWWWGGWWWWGG.',
        '.GGWWWWGGWWWWGG.',
        '.GGWWWWGGWWWWGG.',
        '..GGWWGGGGWWGG..',
        '...GGGGGGGGGG...',
        '.....GGGGGG.....',
        '................',
        '................'
      ]
    },
    // Blocks
    ground: {
      palette: 'block',
      rows: [
        'LLLLLLLLLLLLLLLL',
        'BBBBBBBBBBBBBBBB',
        'BDBBDBBDBBDBBDBD',
        'BDBBDBBDBBDBBDBD',
        'DDDDDDDDDDDDDDDD',
        'BBBBBBBBBBBBBBBB',
        'DBBDBBDBBDBBDBBD',
        'DBBDBBDBBDBBDBBD',
        'DDDDDDDDDDDDDDDD',
        'BBBBBBBBBBBBBBBB',
        'BDBBDBBDBBDBBDBD',
        'BDBBDBBDBBDBBDBD',
        'DDDDDDDDDDDDDDDD',
        'BBBBBBBBBBBBBBBB',
        'DBBDBBDBBDBBDBBD',
        'DDDDDDDDDDDDDDDD'
      ]
    },
    brick: {
      palette: 'block',
      rows: [
        'LLLLLLLLLLLLLLLL',
        'BBBBBBBBBBBBBBBB',
        'BBBDDDDDBBBDDDDD',
        'BBBDDDDDBBBDDDDD',
        'DDDDDDDDDDDDDDDD',
        'DDDBBBBBDDDBBBBB',
        'DDDBBBBBDDDBBBBB',
        'DDDDDDDDDDDDDDDD',
        'BBBBBBBBBBBBBBBB',
        'BBBDDDDDBBBDDDDD',
        'BBBDDDDDBBBDDDDD',
        'DDDDDDDDDDDDDDDD',
        'DDDBBBBBDDDBBBBB',
        'DDDBBBBBDDDBBBBB',
        'DDDDDDDDDDDDDDDD',
        'DDDDDDDDDDDDDDDD'
      ]
    },
    question1: {
      palette: 'block',
      rows: [
        'YYYYYYYYYYYYYYYY',
        'YWWWWWWWWWWWWWWY',
        'YWYYYYYYYYYYYYWY',
        'YWY..WWWWWW..YWY',
        'YWY.WW....WW.YWY',
        'YWY.......WW.YWY',
        'YWY.....WWW..YWY',
        'YWY....WWW...YWY',
        'YWY....WWW...YWY',
        'YWY..........YWY',
        'YWY....WWW...YWY',
        'YWY....WWW...YWY',
        'YWY..........YWY',
        'YWYYYYYYYYYYYYWY',
        'YWWWWWWWWWWWWWWY',
        'OOOOOOOOOOOOOOOO'
      ]
    },
    question2: {
      palette: 'block',
      rows: [
        'YYYYYYYYYYYYYYYY',
        'YWWWWWWWWWWWWWWY',
        'YWYYYYYYYYYYYYWY',
        'YWY..OOOOOO..YWY',
        'YWY.OO....OO.YWY',
        'YWY.......OO.YWY',
        'YWY.....OOO..YWY',
        'YWY....OOO...YWY',
        'YWY....OOO...YWY',
        'YWY..........YWY',
        'YWY....OOO...YWY',
        'YWY....OOO...YWY',
        'YWY..........YWY',
        'YWYYYYYYYYYYYYWY',
        'YWWWWWWWWWWWWWWY',
        'OOOOOOOOOOOOOOOO'
      ]
    },
    block_empty: {
      palette: 'block',
      rows: [
        'SSSSSSSSSSSSSSSS',
        'SKKKKKKKKKKKKKKS',
        'SKBBBBBBBBBBBKKD',
        'SKBB..BBBB..BKKD',
        'SKBB..BBBB..BKKD',
        'SKBBBBBBBBBBBKKD',
        'SKBBBBBBBBBBBKKD',
        'SKBBBBBBBBBBBKKD',
        'SKBBBBBBBBBBBKKD',
        'SKBBBBBBBBBBBKKD',
        'SKBBBBBBBBBBBKKD',
        'SKBB..BBBB..BKKD',
        'SKBB..BBBB..BKKD',
        'SKBBBBBBBBBBBKKD',
        'SKKKKKKKKKKKKKKD',
        'DDDDDDDDDDDDDDDD'
      ]
    },
    // Pipes
    pipe_top_left: {
      palette: 'pipe',
      rows: [
        'BBBBBBBBBBBBBBBB',
        'BLLLLLLLLLLLLLLB',
        'BLLGGGGGGGGGGLLB',
        'BLGGGGGGGGGGGGGB',
        'BLGGGGGGGGGGGGGB',
        'BLGGGGGGGGGGGGGB',
        'BLGGGGGGGGGGGGGB',
        'BLGGGGGGGGGGGGGB',
        'BLGGGGGGGGGGGGGB',
        'BLGGGGGGGGGGGGGB',
        'BLGGGGGGGGGGGGGB',
        'BLGGGGGGGGGGGGGB',
        'BLGGGGGGGGGGGGGB',
        'BLGGGGGGGGGGGGGB',
        'BLDDDDDDDDDDDDDB',
        'BBBBBBBBBBBBBBBB'
      ]
    },
    pipe_top_right: {
      palette: 'pipe',
      rows: [
        'BBBBBBBBBBBBBBBB',
        'BLLLLLLLLLLLLLLB',
        'BLGGGGGGGGGGGGDB',
        'BLGGGGGGGGGGGDDb',
        'BLGGGGGGGGGGGDDb',
        'BLGGGGGGGGGGGDDb',
        'BLGGGGGGGGGGGDDb',
        'BLGGGGGGGGGGGDDb',
        'BLGGGGGGGGGGGDDb',
        'BLGGGGGGGGGGGDDb',
        'BLGGGGGGGGGGGDDb',
        'BLGGGGGGGGGGGDDb',
        'BLGGGGGGGGGGGDDb',
        'BLGGGGGGGGGGGDDb',
        'BDDDDDDDDDDDDDDB',
        'BBBBBBBBBBBBBBBB'
      ]
    },
    pipe_shaft_left: {
      palette: 'pipe',
      rows: [
        '..BLLGGGGGGGGGG.',
        '..BLLGGGGGGGGGG.',
        '..BLLGGGGGGGGGG.',
        '..BLLGGGGGGGGGG.',
        '..BLLGGGGGGGGGG.',
        '..BLLGGGGGGGGGG.',
        '..BLLGGGGGGGGGG.',
        '..BLLGGGGGGGGGG.',
        '..BLLGGGGGGGGGG.',
        '..BLLGGGGGGGGGG.',
        '..BLLGGGGGGGGGG.',
        '..BLLGGGGGGGGGG.',
        '..BLLGGGGGGGGGG.',
        '..BLLGGGGGGGGGG.',
        '..BLLGGGGGGGGGG.',
        '..BLLGGGGGGGGGG.'
      ]
    },
    pipe_shaft_right: {
      palette: 'pipe',
      rows: [
        '.GGGGGGGGGGGDDb.',
        '.GGGGGGGGGGGDDb.',
        '.GGGGGGGGGGGDDb.',
        '.GGGGGGGGGGGDDb.',
        '.GGGGGGGGGGGDDb.',
        '.GGGGGGGGGGGDDb.',
        '.GGGGGGGGGGGDDb.',
        '.GGGGGGGGGGGDDb.',
        '.GGGGGGGGGGGDDb.',
        '.GGGGGGGGGGGDDb.',
        '.GGGGGGGGGGGDDb.',
        '.GGGGGGGGGGGDDb.',
        '.GGGGGGGGGGGDDb.',
        '.GGGGGGGGGGGDDb.',
        '.GGGGGGGGGGGDDb.',
        '.GGGGGGGGGGGDDb.'
      ]
    },
    // Items
    coin1: {
      palette: 'item',
      rows: [
        '......YYYY......',
        '....YYLLLLYY....',
        '...YLLYYYYLLYY..',
        '..YLYYYYYYYYLYY.',
        '..YLYYY..YYYLYY.',
        '.YLYYY....YYYLY.',
        '.YLYYY....YYYLY.',
        '.YLYYY....YYYLY.',
        '.YLYYY....YYYLY.',
        '.YLYYY....YYYLY.',
        '..YLYYY..YYYLYY.',
        '..YLYYYYYYYYLYY.',
        '...YLLYYYYLLYY..',
        '....YYLLLLYY....',
        '......YYYY......',
        '................'
      ]
    },
    coin2: {
      palette: 'item',
      rows: [
        '.......YY.......',
        '.....YYLLYY.....',
        '....YLLYYLLYY...',
        '...YLYYYYYYLYY..',
        '...YLYY..YYLYY..',
        '..YLYY....YYLY..',
        '..YLYY....YYLY..',
        '..YLYY....YYLY..',
        '..YLYY....YYLY..',
        '..YLYY....YYLY..',
        '...YLYY..YYLYY..',
        '...YLYYYYYYLYY..',
        '....YLLYYLLYY...',
        '.....YYLLYY.....',
        '.......YY.......',
        '................'
      ]
    },
    coin3: {
      palette: 'item',
      rows: [
        '........Y.......',
        '......YYLY......',
        '.....YLYYLY.....',
        '....YLYYYYLY....',
        '....YLYYYYLY....',
        '...YLYYYYYYLY...',
        '...YLYYYYYYLY...',
        '...YLYYYYYYLY...',
        '...YLYYYYYYLY...',
        '...YLYYYYYYLY...',
        '....YLYYYYLY....',
        '....YLYYYYLY....',
        '.....YLYYLY.....',
        '......YYLY......',
        '........Y.......',
        '................'
      ]
    },
    mushroom: {
      palette: 'item',
      rows: [
        '.....RRRRRR.....',
        '...RRWWWWRRRR...',
        '..RRWWWWWWWRRR..',
        '.RRWWWWRWWWWWRR.',
        '.RRWWWWWRWWWWWR.',
        'RRRRWWWRRRWWWWRR',
        'RRRRRWRRRRRWRRRR',
        'RRRRRRRRRRRRRRRR',
        '....SSSSSSSS....',
        '...SSSBSSSBSSS..',
        '...SSSBSSSBSSS..',
        '...SSSSSSSSSSS..',
        '...SSSSSSSSSSS..',
        '....SSSSSSSS....',
        '................',
        '................'
      ]
    },
    flag_pole: {
      palette: 'block',
      rows: [
        '......WWWW......',
        '......WSSW......',
        '.......SS.......',
        '.......SS.......',
        '.......SS.......',
        '.......SS.......',
        '.......SS.......',
        '.......SS.......',
        '.......SS.......',
        '.......SS.......',
        '.......SS.......',
        '.......SS.......',
        '.......SS.......',
        '.......SS.......',
        '.......SS.......',
        '.......SS.......'
      ]
    },
    flag: {
      palette: 'pipe',
      rows: [
        'LLLLLLLLLLLL....',
        'LLGGGGGGGG......',
        'LLGGGGGG........',
        'LLGGGG..........',
        'LLGG............',
        'LL..............',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................'
      ]
    }
  };

  const canvasCache = {};

  function renderDataToCanvas(key, def) {
    const pal = PALETTES[def.palette];
    const rows = def.rows;
    const h = rows.length;
    const w = rows[0].length;

    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;

    for (let y = 0; y < h; y++) {
      const row = rows[y];
      for (let x = 0; x < w; x++) {
        const ch = row[x];
        const hex = pal[ch];
        const idx = (y * w + x) * 4;
        if (hex) {
          // Parse hex color (#RRGGBB)
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        } else {
          data[idx + 3] = 0; // Transparent
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return c;
  }

  function init() {
    for (const key of Object.keys(DATA)) {
      canvasCache[key] = renderDataToCanvas(key, DATA[key]);
    }
  }

  function get(key) {
    return canvasCache[key] || null;
  }

  function draw(ctx, key, x, y, flipX = false) {
    const c = canvasCache[key];
    if (!c) return;
    if (flipX) {
      ctx.save();
      ctx.translate(Math.round(x + c.width), Math.round(y));
      ctx.scale(-1, 1);
      ctx.drawImage(c, 0, 0);
      ctx.restore();
    } else {
      ctx.drawImage(c, Math.round(x), Math.round(y));
    }
  }

  return {
    init,
    get,
    draw
  };
})();

window.SpriteEngine = SpriteEngine;
