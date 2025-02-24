
    //  const
// let canvaWidth
    let     canva;
    let     start;
    let     game;

function startCanva( data ) {
    // console.log(data)
    start = document.getElementById("game");
    canva = document.createElement("canvas");
    canva.setAttribute("id","pongGame");
    canva.style.background = "#c4c4c4";
    canva.style.transform = "translate(-50%, -50%)";
    canva.style.position = "absolute";
    canva.style.top = "50%";
    canva.style.left = "50%";
    canva.width = data.canva.w;
    // console.log(canva.width)
    canva.height = data.canva.h;
    start.appendChild(canva)
    const element = document.getElementById("start");
    element.remove()
}
    // move players 
    
    
    function startGame() {
        let manager;
        const room_name = "1#2";
        const url = `ws://10.11.4.4:8080/ws/game/${encodeURIComponent(room_name)}/`;
        game = new WebSocket(url);
        game.onopen = function() {
            console.log("connection is open")
            // game.send(JSON.stringify(message));
        }
    game.onmessage = function( e ) {
        let data = JSON.parse(e.data);
        if ( data.bool == 0 ) {
            startCanva( data );
            manager = new Manager( data /*canva.width, canva.height*/ , "pongGame")
            manager.draw()
            console.log( data );
        }
        else {
            manager.draw()
        }
    }
}
document.getElementById("start").addEventListener("click", startGame);
document.addEventListener("keyup", movePlayer)

function movePlayer( e ) {
    console.log(e.code)
    if ( game !== undefined && game.readyState !== WebSocket.CLOSED ) {
        if ( e.code === "KeyW" ) {
            const message = {
                "id"    : 1,
                "key"   : "Up"   
            }
            game.send(JSON.stringify(message));
            // canva.player1.speed = -7;
        }
        if ( e.code === "KeyS" ) {
            const message = {
                "id"    : 1,
                "key"   : "Down"   
            }
            game.send(JSON.stringify(message));
            // canva.player1.speed = 7;
        }
    
        if ( e.code === "ArrowUp" ) {
            const message = {
                "id"    : 2,
                "key"   : "Up"   
            }
            game.send(JSON.stringify(message));
            // canva.player2.speed = -7;
        }
        if ( e.code === "ArrowDown" ) {
            const message = {
                "id"    : 2,
                "key"   : "Down"   
            }
            game.send(JSON.stringify(message));
            // canva.player2.speed = 7;
        }
    }
}




class Player {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 0;
    }
}

class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.speedX = 7;
        this.speedY = 7;
    }
}

class Manager {
    canvaWidth;
    canvaHeight;
    constructor( data/*width, height*/, name ) {
        this.canvaWidth = data.canva.w ;
        this.canvaHeight =  data.canva.h ;
        console.log(this.canvaHeight)
        this.player1 = new Player(data.player1.x, this.canvaHeight / 2 - (data.player1.height / 2), data.player1.width, data.player1.height);
        this.player2 = new Player(this.canvaWidth - this.player1.width - 10, this.canvaHeight / 2 - (data.player1.height / 2), data.player1.width, data.player1.height);
        this.ball = new Ball(( this.canvaWidth / 2 ) - ( data.ball.width / 2 ),  ( this.canvaHeight / 2 ) - ( data.ball.height / 2 ));
        this.doc = document.getElementById(name);
        // this.updatePlayers = this.updatePlayers.bind(this);
        this.cxt = this.doc.getContext("2d")
    }
    draw(  ) {

        // this.doc.width = this.canvaWidth;
        // console.log(this.doc.width)

        // this.doc.height = this.canvaHeight;
        this.cxt.clearRect(0 , 0, this.canvaWidth, this.canvaHeight); 
        this.cxt.fillStyle = "#ff9001";
        console.log(this.player1.y);
        this.cxt.fillRect(this.player1.x, this.player1.y, this.player1.width, this.player1.height);

        // this.cxt.fillRect(10, 150, 10, 150);
        this.cxt.fillRect(this.player2.x, this.player2.y, this.player2.width, this.player2.height);


        this.cxt.fillStyle = "black";
        this.cxt.fillRect( this.ball.x, this.ball.y, this.ball.width, this.ball.height);

    }
    // updatePlayers() {
    //     requestAnimationFrame(this.updatePlayers);

    //     this.cxt.clearRect(0 , 0, this.canvaWidth, this.canvaHeight); 

    //     if ( this.outOfRing( this.player1.y + this.player1.speed ) == false )
    //         this.player1.y += this.player1.speed;
    //     if ( this.outOfRing( this.player2.y + this.player2.speed ) == false )
    //         this.player2.y += this.player2.speed;

    //     this.ball.x += this.ball.speedX;
    //     this.ball.y += this.ball.speedY;

    //     if ( this.ball.y <= 0 || this.ball.y + this.ball.height >= this.canvaHeight )
    //         this.ball.speedY *= -1;

    //     if ( this.detectCollision(this.ball, this.player1) || this.detectCollision(this.ball, this.player2) ) {
    //         // if ( this.ball.x <=  this.player2.x +  this.player2.width )
    //             this.ball.speedX *= -1;
    //     }
    //     // else if (  ) {
    //     //     if (  this.ball.x + this.ball.width >=  this.player2.x)
    //     //         this.ball.speedX *= -1;
    //     // }


    //     if (this. ball.x < 0 ) {
    //         // thisplayerR.score++;
    //         this.resetGame( this.ball );
    //     }
    //     else if ( this.ball.x + this.ball.width >= this.canvaWidth) {
    //         // playerL.score++;
    //         this.resetGame( this.ball );
    //     }
    //     this.draw();
    // }
    // outOfRing( postionPlayer ) {
    //     return (postionPlayer < 0 || postionPlayer + this.player1.height > this.canvaHeight);
    // }
    // detectCollision( ball , player ) {
    //     return ball.x < player.x + player.width &&
    //             ball.x + ball.width > player.x &&
    //             ball.y < player.y + player.height &&
    //             ball.y + ball.height > player.y;
    // }
    // resetGame( ball ) {
    //     this.ball.x = ( this.canvaWidth / 2 ) - ( 20 / 2 );
    //     this.ball.y = ( this.canvaHeight / 2 ) - ( 20 / 2 );
    //     this.ball.speedX *= -1;
    // }
}

// let canva = new Manager( screen.width, screen.height , "pongGame");

// window.document.addEventListener("keydown", movePlayer);
// window.document.addEventListener("keyup", stopPlayer);



// function stopPlayer(e) {
//     if ( e.code === "KeyW" || e.code === "KeyS" ) {
//         canva.player1.speed = 0;
//     }

//     if ( e.code === "ArrowUp" || e.code === "ArrowDown" ) {
//         canva.player2.speed = 0;
//     }
// }

// requestAnimationFrame(canva.updatePlayers)