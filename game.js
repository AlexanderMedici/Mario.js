//  Kaboom is a free online 2D space game, game.js is the main game engine.

kaboom({
    global: true,
    fullscreen: true,
    scale: 2,
    debug: true,
    clearColor: [0, 0, 0, 1],
})
// Constant Variables (Do not change)
const MOVE_SPEED = 120
const JUMP_FORCE = 360
let CURRENT_JUMP_FORCE = JUMP_FORCE
const BIG_JUMP_FORCE = 550
let isJumping = true;
const FALL_DEATH = 400;
   
//Game Sprites using imgur.com as a source

loadRoot("https://i.imgur.com/")
loadSprite("coin", 'Adq6Znk.png')
loadSprite("evil-shroom", "hdjHVb7.png")
loadSprite("brick", "tWooyQ8.png")
loadSprite("block", "daKjGFG.png")
loadSprite("mario", "1LGlOSS.png")
loadSprite("mushroom", "h3ukp9c.png")
loadSprite("evil-mushroom", "L6i1lbv.png")
loadSprite("surprise", "lGpc6nV.png")
loadSprite("unboxed", "NezIXR5.png")
loadSprite("pipe-top-left", "iOq0WyA.png")
loadSprite("pipe-top-right", "Pcaepfx.png")
loadSprite("pipe-bottom-left", "D7Xix1I.png")
loadSprite("pipe-bottom-right", "d13LL59.png")
// level 2 sprites (change these)

loadSprite("blue-block", "vY63MwH.png")
loadSprite("blue-brick", "d13LL59.png")
loadSprite("blue-steel", "sQcBRRv.png")
loadSprite("blue-evil-shroom", "5zJt0Kn.png")
loadSprite("blue-surprise", "lGpc6nV.png")


// Game Objects and Map (Change these)
scene("game", ({ level, score}) => {
    layers(["bg ", "obj", "ui"], 'obj')
    const maps = [
    [
        '                                                      ',
        '                                                      ',
        '                                                      ',
        '                                                      ',
        '                                                      ',
        '       % =*=%=         *                   ',
        '                                                     ',
        '                                                     ',
        '     ^            ^   -+                         ',
        '======================() ',
        ],
       [ 
        '~                                                   ',
        '~                                                    ',
        '~                                                    ',
        '~                                                    ',
        '~                                                    ',
        '~  @  *  @  @       @      @            ',
        '~                       x                           ',
        '~                       x x                        ',
        '~     z  z    z    z  x x x               -+  ',
        '~!!!!!!!!!!!!!!!!!!           !!!!!!!!!!!!()',
        ]

    ] 
    //  Sprite Assets (Do not change) 
    const levelCfg = {
        width: 20,
        height: 20,
        '=': [sprite('block'), solid()],
        '$': [sprite('coin'),  'coin'],
        '%': [sprite('surprise'), solid(), 'coin-surprise'],
        '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
        '}': [sprite('unboxed'), solid()],
        '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
        ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
        '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
        '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
        '^': [sprite("evil-mushroom"), solid(), 'dangerous'],
        '#': [sprite("mushroom"), solid(), 'mushroom', body()],
        '!': [sprite("blue-block"), solid(),scale(0.5), 'blue-block'],
        '~': [sprite("blue-brick"), solid(), scale(0.5), 'blue-brick'],
        'z': [sprite("blue-evil-shroom"), solid(), scale(0.5), 'dangerous'],
        '@': [sprite("blue-surprise"), solid(), scale(0.5), 'coin-surprise'],
        'x': [sprite("blue-steel"), solid(),scale(0.5)],
    }
    

    //  this variable gameLevel is used to keep track of the current level
    const gameLevel = addLevel(maps[level], levelCfg)

    // this variable is used to keep track of the current score
    const scoreLabel = add([
        text(score),
        pos(30, 6),
        layer('ui'),
        {
            value: score,
        }
    ])

    add([text("level  " + parseInt(level + 1)), pos(40, 6)])
    //  this variable makes the player bigger when they collect  mushrooms from the mushroom-surprise block
    function big() {
        let timer = 0
        let isBig = false
        return {
            update() {
                if (isBig) {
                    CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
                    timer -=  dt()
                    if (timer  <= 0) {
                        this.smallify( )
                    }
                }
            },
            isBig() {
                return isBig
            },
            smallify() {
                this.scale = vec2(1)
                CURRENT_JUMP_FORCE = JUMP_FORCE
                timer = 0
                isBig = false
            },
            biggify(time) {
                this.scale = vec2(2)
                timer = time
                isBig = true
            }
        }
    }
    
        //  this makes the players character, in our case mario sprite. 
    const player = add([
        sprite('mario'), solid(),
        pos(30, 0),
        body(),
        big(), 
        origin('bot')
    ])
    // this variable is used to move a sprite with the label of 'mushroom'
    action('mushroom', (m) => {
        m.move(40,0)
    })
    player.on("headbump", (obj) => {
        if (obj.is("coin-surprise")) {
            gameLevel.spawn("$", obj.gridPos.sub(0, 1))
            destroy(obj)
            gameLevel.spawn('}' , obj.gridPos.sub(0, 0))
        }
          if (obj.is("mushroom-surprise")) {
            gameLevel.spawn("#", obj.gridPos.sub(0, 1))
            destroy(obj)
            gameLevel.spawn('}' , obj.gridPos.sub(0, 0))
        }
    })
    // If Mario hits a mushroom, he grows, for 9 seconds.
    player.collides("mushroom", (m) => {
        destroy(m)
        player.biggify(9)
    })
//  If player collides with a coin, destroy the coin and add a coin to the ScoreLabel
    player.collides("coin", (c) => {
        destroy(c)
        scoreLabel.value++
        scoreLabel.text = scoreLabel.value
    })
    //  Speed of Enemy Sprites with the label of "dangerous" (Do not change)
    const ENEMY_SPEED = 20
    action("dangerous", (d) => {
        d.move(-ENEMY_SPEED, 0)
    })
//  if player is jumping on an enemy, destroy the enemy else if player collides with a enemy, go to lose screen display score and level. 
    player.collides("dangerous", (d) => {
        if (isJumping) {
            destroy(d)
        } else {
            go('lose', {score:scoreLabel.value})
        }
    })
//  if player falls off the map, go to lose screen display score and level.
    player.action(() => {
        camPos(player.pos)
        if (player.pos.y >= FALL_DEATH) {
            go('lose', {score:scoreLabel.value})
        }
    })
    //  if player is on top  of  a pipe and presses key down go to next level.
    player.collides('pipe', () => {
        keyPress("down", () => {
            go('game', {
                level:(level + 1)  % maps.length,
                score: scoreLabel.value 
            })        
        })
    })
//  if a player uses left key move left on the map.
     keyDown("left", () => {
        player.move(-MOVE_SPEED, 0)
    })
  
    // if a player uses right key move right on the map.
    keyDown("right", () => {
        player.move(MOVE_SPEED, 0)
    })
    //  if a player is grounded is jumping is false
    player.action(() => {
        if (player.grounded()) {
            isJumping = false;
        }
    })
//  if a player is grounded  has pressed a space key then add to player jump current-jump-force.
    keyPress("space", () => {
        if (player.grounded()) {
            isJumping = true;
            player.jump(CURRENT_JUMP_FORCE)           
        }        
    })
})

//  lose screen display score and level. 
scene("lose", ({ score}) => {
    add([text(score, 32) , origin("center"), pos(width()/2, height()/2  ) ])
})

start("game" ,{level: 0, score: 0})