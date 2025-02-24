import { getWebsocket, closeWebsocket , dataPlayer}  from "/components/matchMaking.js"
import { Manger } from "../scripts/gamePlay.js"

let CANVA_HEIGHT    =   500
let CANVA_WIDTH     =   1000
let PLAYER_WIDTH    =   10
let PLAYER_HEIGHT   =   100
let PLAYER_SPEED    =   80
let PLAYERS_ONE_X   =   10
let PLAYERS_ONE_Y   =   ( CANVA_HEIGHT  / 2 ) - ( PLAYER_HEIGHT / 2 )
let PLAYERS_TWO_X   =   ( CANVA_WIDTH ) - PLAYER_WIDTH - 10
let PLAYERS_TWO_Y   =   ( CANVA_HEIGHT / 2 ) - ( PLAYER_HEIGHT / 2 )

        // # BALL
let BALL_WIDTH      =   10
let BALL_HEIGHT     =   10
let BALL_X          =   ( CANVA_WIDTH / 2 ) - ( BALL_WIDTH / 2 )
let BALL_Y          =   ( CANVA_HEIGHT / 2 ) - ( BALL_HEIGHT / 2 )
let BALL_SPEED_X    =   3
let BALL_SPEED_Y    =   3
let data = {
    "left" : {
        "coordinates_x" :   PLAYERS_ONE_X,
        "coordinates_y" :   PLAYERS_ONE_Y,
        "color"         :   "white"
    },
    "right" : {
        "coordinates_x" :   PLAYERS_TWO_X,
        "coordinates_y" :   PLAYERS_TWO_Y,
        "color"         :   "white",
    },
    "data"  :   {
        "canvas_w"  :   CANVA_WIDTH,
        "canvas_h"   :   CANVA_HEIGHT,
        "ball_x"    :   BALL_X,
        "ball_y"    :   BALL_Y,
        "ball_w"    :   BALL_WIDTH,
        "ball_h"    :   BALL_HEIGHT,
        "ball_speed":   BALL_SPEED_X,
        "player_h"  :   PLAYER_HEIGHT,
        "player_w"  :   PLAYER_WIDTH
    }
}
class GamePlayLocale extends HTMLElement {
	constructor() {
        super(); 
        // console.log(" constructor game play component")
        // const token     =   localStorage.getItem('accessToken');
        // const type      =   dataPlayer.type
        // console.log( "type of game is " , type)
	    // const socketUrl =   `ws://127.0.0.1:8080/ws/game/${dataPlayer.session_name}/?token=${token}&type=${type}&id=${dataPlayer.id}`;
        // this.socket     =   getWebsocket(socketUrl)
        this.manager    =   null;
        this.requestFrame   =   null;
        this.handleKeyDown  =   this.handleKeyDown.bind(this);
	} 
    async connectedCallback() {
        this.color = "white"
        // Fetch HTML

		const htmlResponse = await fetch('../views/gameLocale.html');
		const htmlContent = await htmlResponse.text();

        const cssResponse = await fetch('../assets/css/gameLocale.css');
		const cssContent = await cssResponse.text();

        const style = document.createElement('style');
		style.textContent = cssContent;
        // Set inner HTML
		this.innerHTML = htmlContent;
        this.appendChild(style);
        this.changeColor()

        // this.socket.onmessage = ( event )  =>  {
        //     let data = JSON.parse(event.data)
        //     console.log(data)
        //     if ( data["type"] === "information_game" ) {
        //         this.informationTable( data )
        //         this.manager = new Manger(data ,"canvas")
        //         this.manager.start()
        //         setTimeout(() => {
        //             console.log("test send event start")
        //             this.socket.send(JSON.stringify({"type" : "start"}))
        //             document.addEventListener("keydown", this.handleKeyDown)
        //         }, 3000)
        //     }
        //     else if ( data["type"] === "move_player") {
        //         this.manager[`${data["pos"]}`].targetY = data["new_position"]
        //         console.log(Number(data["new_position"]))
        //     }
        //     else if ( data["type"] === "end.game" ) {
        //         console.log( data )
        //         this.manager.stop()
        //         console.log( "data result" , data["result"])
        //         if ( data["result"] === "lost" )
        //             showLoser();
        //         else 
        //             showWinner();
                
        //     }
        //     else if ( data["type"] === "play" ) {
        //         console.log("player alrady play")
        //     }
        //     else if ( data["type"] === "newData" ) {
        //         if ( data["reset"] === "reset" ) {
        //             console.log("score is changed you must rest [TARGET]")
        //             this.manager.reset      =   "reset"
        //             this.manager.ball.x     =   data["ball_x"]
        //             this.manager.ball.y     =   data["ball_y"]
        //         }
        //         else {
        //             this.manager.reset      =   "none"
        //         }
        //         this.manager.ball.targetX            =   data["ball_x"]
        //         this.manager.ball.targetY            =   data["ball_y"]
        //         if ( this.manager.left.score !== data["left"] || this.manager.right.score !== data["right"] ) {
        //             this.manager.left.score              =   data["left"]
        //             this.manager.right.score             =   data["right"]
        //             document.querySelector(".container game-component-play .leftPlayer p").innerHTML = data["left"]
        //             document.querySelector(".container game-component-play .rightPlayer p").innerHTML = data["right"]
        //             console.log( this.manager.left.score, this.manager.right.score )
        //             this.manager.stop()
        //             this.manager.start()
        //         }
        //     }
        // }
 
        this.dispatchEvent(new CustomEvent('content-loaded', { bubbles: true, composed: true }));

    }
    // updateDataPlayer( img1, img2 ) {
    //     const container =  this.querySelector(".dataPlayer")
    //     this.querySelector(".dataPlayer .leftPlayer img").src = img1
    //     this.querySelector(".dataPlayer .rightPlayer img").src = img2
    // }
    async changeColor() {
        const canvas = this.querySelector('canvas');
        canvas.width = 1000;
        canvas.height = 500;
        const paddelLeft = this.querySelector('.paddel-left');
        const paddelRight = this.querySelector('.paddel-right');
        const colorDivs = this.querySelectorAll('.color-paddele .color div');
        const startButton = this.querySelector('.start');
        let infoPlayer = await this.getInformationUser()
        const container =  this.querySelector(".dataPlayer")
        this.querySelector(".dataPlayer .leftPlayer img").src = infoPlayer.profile_image
        this.querySelector(".dataPlayer .rightPlayer img").src = "../assets/imgs/sa7ibnass.jpeg"
        colorDivs.forEach(div => {
            div.addEventListener('click', () => {
                const newColor = div.getAttribute('data-color');
                // console.log(newColor)
                this.color = newColor;
                paddelLeft.style.background = this.color;
                paddelRight.style.background = this.color;
            });
        });
		// when the user choose the color and click on send ...
        startButton.addEventListener('click', () => {
			const colorPaddle = this.querySelector('.color-paddele');
            // console.log(this.querySelector("canvas"))
             this.informationTable( data )
            data["left"]["color"]  =  this.color
            data["right"]["color"] =  this.color
            // console.log("test color ")
			// const loader = this.querySelector('.loader-container');
            // let LocalGame = this.querySelector(".container .allElementLocal")
            // console.log(LocalGame)
            // LocalGame.querySelector(".game-play .position-padele").style.display = "none"
            // LocalGame.querySelector(".game-play .canvas").style.display = "block"
            // this.manger = new Manger( data , "canvas" )
            // this.start()
			// // colorPaddle.style.display = 'none';
			// loader.style.display = 'block';
            // const message = {
            //     "type"  : "color",
            //     "color" : this.color
            // }
            // this.socket.send(JSON.stringify(message))
            colorPaddle.remove();
            this.manager = new Manger(data ,"canvas")
            this.manager.typeGame = "locale"
            this.manager.start()
            document.addEventListener("keydown", this.handleKeyDown)
        });
    }
    informationTable( data ) {
        const canvas = this.querySelector('canvas');
        const gamePlayer = this.querySelector('.game-play .position-padele'); 
        const positionPaddle = this.querySelector('.game-play .position-padele');
                
        // let img1, img2;
        // if ( data["side"] === "left" ) {
        //     img1 = "http://127.0.0.1:8080" + dataPlayer["myData"].profile_image;
        //     img2 = "http://127.0.0.1:8080" + dataPlayer["yourData"].profile_image
        // }
        // else {
        //     img1 = "http://127.0.0.1:8080" + dataPlayer["yourData"].profile_image;
        //     img2 = "http://127.0.0.1:8080" + dataPlayer["myData"].profile_image
        // }
        // this.updateDataPlayer( img1, img2 )
        // console.log("test test function ")
        
        // console.log(infoPlayer.profile_image)
        //const colorPaddle = this.querySelector('.color-paddele')
		const loader = this.querySelector('.loader-container');
        canvas.style.display = "block";
        if ( gamePlayer ) gamePlayer.remove()
        // if ( colorPaddle ) colorPaddle.remove()
        if ( loader ) loader.style.display = 'none';
        if ( positionPaddle ) positionPaddle.remove()
    }
    async getInformationUser() {
        const token = localStorage.getItem('accessToken');
                if (!token)
                    throw new Error('No access token found in localStorage');
                try
                {
                    const response = await fetch(`/api/profile` , {
                        method: 'GET',
                        headers:
                        {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    if ( !response.ok ) 
                        throw new Error(`HTTP error! status: ${response.status}`);
                    else {
                        const data = await response.json();
                        // console.log("MY DATA: ", data);
                        
                        // this.querySelector(".dataPlayer .rightPlayer img").src = img2
                        return data;
                    }
                }
                catch( error ) {
                    console.error("fetch error" , error )
                    throw error
                }
    }
    handleKeyDown( e ) {
        // console.log("code " , e.code)
        if ( e.code === "KeyW" ) {
            if ( this.manager.left.targetY > 0 )
                this.manager.left.targetY -= 20
            // console.log("target --> " , this.manager.left.targetY)
        }
        else if ( e.code == "KeyS" ) {
            if ( this.manager.left.targetY < 400 )
                this.manager.left.targetY += 20
            // console.log( "target --> " , this.manager.left.targetY )
        }
        else if ( e.code === "ArrowUp" ) {
            if ( this.manager.right.targetY > 0 )
                this.manager.right.targetY -= 20
            // console.log("target --> " , this.manager.right.targetY)
        }
        else if ( e.code == "ArrowDown" ) {
            if ( this.manager.right.targetY < 400 )
                this.manager.right.targetY += 20
            // console.log( "target --> " , this.manager.right.targetY )
        }
    }
    disconnectedCallback( ) {
        if ( this.manager != null )
            this.manager.stop()
        // console.log("locations " , window.location.href)
        // console.log("test game local")
        document.removeEventListener( "keydown", this.handleKeyDown );
        // console.log(window.location.href)
        if ( window.location.href === "https://10.11.4.4/game" ) {
            window.loadComponent2('game', document.querySelector('.container'));
        }
    }
    
}
customElements.define( 'game-component-locale', GamePlayLocale );































// import { dataPlayer } from "./matchMaking.js";

// let CANVA_WIDTH     =   1000
// let CANVA_HEIGHT    =   500

//         // # PLAYERS ( CORDINATES START GAME )
// let PLAYER_WIDTH    =   10
// let PLAYER_HEIGHT   =   100
// let PLAYER_SPEED    =   25
// let PLAYERS_ONE_X   =   10
// let PLAYERS_ONE_Y   =   ( CANVA_HEIGHT  / 2 ) - ( PLAYER_HEIGHT / 2 )
// let PLAYERS_TWO_X   =   ( CANVA_WIDTH ) - PLAYER_WIDTH - 10
// let PLAYERS_TWO_Y   =   ( CANVA_HEIGHT / 2 ) - ( PLAYER_HEIGHT / 2 )

//         // # BALL
// let BALL_WIDTH      =   10
// let BALL_HEIGHT     =   10
// let BALL_X          =   ( CANVA_WIDTH / 2 ) - ( BALL_WIDTH / 2 )
// let BALL_Y          =   ( CANVA_HEIGHT / 2 ) - ( BALL_HEIGHT / 2 )
// let BALL_SPEED_X    =   7
// let BALL_SPEED_Y    =   7
// // let info = {
// //     "CANVA_WIDTH"   :   1000,
// //     "CANVA_HEIGHT"  :   500,
// //     "PLAYER_WIDTH"  :   10,
// //     "PLAYER_HEIGHT" :   100,
// //     "PLAYER_SPEED"  :   25,
// //     "PLAYERS_ONE_X" :   10,
// //     "PLAYERS_ONE_Y ":   ( "CANVA_HEIGHT"  / 2 ) - ( "PLAYER_HEIGHT" / 2 ),
// //     "PLAYERS_TWO_X" :   ( "CANVA_WIDTH" ) - "PLAYER_WIDTH" - 10,
// //     "PLAYERS_TWO_Y" :   ( "CANVA_HEIGHT" / 2 ) - ( "PLAYER_HEIGHT" / 2 ),
// //    "BALL_WIDTH"     :   10,
// //     "BALL_HEIGHT"   :   10,
// //     "BALL_X"        :   ( "CANVA_WIDTH" / 2 ) - ( "BALL_WIDTH" / 2 ),
// //     "BALL_Y"        :   ( "CANVA_HEIGHT" / 2 ) - ( "BALL_HEIGHT" / 2 ),
// //     "BALL_SPEED_X"  :   7,
// //     "BALL_SPEED_Y"  :   7,
// // }
// class Player {
//     constructor( x, y, width, height , pos, color ) {
//         this.x       =  Number(x);
//         this.y       =  Number(y);
//         this.targetY =  Number(y);
//         this.width   =  Number(width);
//         this.height  =  Number(height);
//         this.color   =  color
//         this.speed   =  0;
//         this.score   =  0;
//         this.position=  pos; 
//     }

//     updatePosition() {
//         const   smoothFactor = 0.1; // Adjust this value for smoothness (lower = smoother but slower)
//         const   epsilon      = 0.0001
//         if ( Math.abs(this.targetY - this.y) > epsilon ) {
//             this.y += (this.targetY - this.y) * smoothFactor;
//         }
//         console.log("here" , this.y)
//     }
// }

// class Ball {
//     constructor( x, y ,width, height, speed) {
//         this.x      =   Number(x);
//         this.y      =   Number(y);
//         this.width  =   Number(width);
//         this.height =   Number(height);
//         this.speedX =   Number(speed);
//         this.speedY =   Number(speed);
//         this.targetY=   Number(this.y);
//         this.targetX=   Number(this.x);
//     }
//     updatePosition() {
//         const smoothFactor = 0.3; // Adjust this value for smoothness (lower = smoother but slower)
//         this.y += (this.targetY - this.y) * smoothFactor;
//         this.x += (this.targetX - this.x) * smoothFactor;
//     }
// }

// class GamePlayLocal extends HTMLElement {
//     constructor() {
//         super();
//         this.canvaWidth = CANVA_WIDTH
//         this.canvaHeight = CANVA_HEIGHT
//         this.loop = this.loop.bind(this)
//         this.running        =   false;
//         this.loop = this.loop.bind(this)
//     }
//     async connectedCallback( ) {
//         this.color = "white"
//         const htmlResponse = await fetch('../views/gameLocal.html');
// 		const htmlContent = await htmlResponse.text();

//         const cssResponse = await fetch('../assets/css/gameLocal.css');
// 		const cssContent = await cssResponse.text();

//         const style = document.createElement('style');
// 		style.textContent = cssContent;
//         // Set inner HTML
// 		this.innerHTML = htmlContent;
//         this.appendChild(style);

//         let container = document.querySelector(".container gameComponentLocal .allElementLocal ")
//         this.changeColor()
//         // let img1 = "http://127.0.0.1:8080" + dataPlayer["myData"].profile_image;
//         // console.log(dataPlayer["myData"].profile_image)
//         // let img2 = "http://127.0.0.1:8080" + dataPlayer["yourData"].profile_image;
//         this.dispatchEvent(new CustomEvent('content-loaded', { bubbles: true, composed: true }));
//     }
//     changeColor() {
//         const canvas = this.querySelector('canvas');
//         canvas.width = 1000;
//         canvas.height = 500;
//         const paddelLeft = this.querySelector('.paddel-left');
//         const paddelRight = this.querySelector('.paddel-right');
//         const colorDivs = this.querySelectorAll('.color-paddele .color div');
//         const startButton = this.querySelector('.start');
//         colorDivs.forEach(div => {
//             div.addEventListener('click', () => {
//                 const newColor = div.getAttribute('data-color');
//                 console.log(newColor)
//                 this.color = newColor;
//                 paddelLeft.style.background = this.color;
//                 paddelRight.style.background = this.color;
//             });
//         });
// 		// when the user choose the color and click on send ...
//         startButton.addEventListener('click', () => {
// 			const colorPaddle = document.querySelector('.container .allElementLocal .color-paddele');
//             this.left   =   new Player( PLAYERS_ONE_X , PLAYERS_ONE_Y, PLAYER_WIDTH,
//                                         PLAYER_HEIGHT, "left", this.color )
//             this.right   =   new Player( PLAYERS_TWO_X, PLAYERS_TWO_Y, PLAYER_WIDTH,
//                                         PLAYER_HEIGHT, "right", this.color )
//             this.ball   =   new Ball( BALL_X, BALL_Y, BALL_WIDTH, BALL_HEIGHT, 
//                                         BALL_SPEED_X)
//             this.doc    =   document.querySelector("canvas")
//             this.cxt    =   this.doc.getContext("2d")
//             console.log("test color ")
//             let LocalGame = document.querySelector(".container .allElementLocal")
//             LocalGame.querySelector(".game-play .position-padele").style.display = "none"
//             LocalGame.querySelector(".game-play .canvas").style.display = "block"
//             this.start()
//             document.addEventListener("keydown", this.handleKeyDown)
//             console.log("target is " , this.left.targetY )
// 			// const loader = this.querySelector('.loader-container');
// 			// // colorPaddle.style.display = 'none';
// 			// loader.style.display = 'block';
//             // const message = {
//             //     "type"  : "color",
//             //     "color" : this.color
//             // }
//             // this.socket.send(JSON.stringify(message))
//             colorPaddle.remove();
//         });
//     }

//     draw(  ) {
//         this.cxt.clearRect(0 , 0, this.canvaWidth, this.canvaHeight); 
//         this.cxt.fillStyle = this.left.color;
//         // console.log(this.left.y +"\n");
//         // console.log(typeof(this.left.y))
//         console.log(this.left.x, this.left.y,  this.left.width, this.left.height)
//         this.cxt.fillRect(this.left.x, this.left.y, this.left.width, this.left.height);

//         // this.cxt.fillRect(10, 150, 10, 150);
//         this.cxt.fillStyle = this.right.color;
//         this.cxt.fillRect(this.right.x, this.right.y, this.right.width, this.right.height);


//         this.cxt.fillStyle = "Red";
//         this.cxt.fillRect( this.ball.x, this.ball.y, this.ball.width, this.ball.height);
//         this.cxt.fillStyle = "red";
//         this.cxt.font = "45px sans-serif";
//     }
//     loop () {
//         if ( this.running === false ) return;
//         console.log("test game local game")
//         if ( this.left.targetY >= 0 )
//             this.left.updatePosition()
//         // if ( manager.right.targetY <= 349 )
//         this.right.updatePosition()
//         this.ball.updatePosition()
//         // this.updatePlayers()
//         this.draw();
//         this.draw();
//         this.requestFrameId =  requestAnimationFrame(this.loop);
//         // console.log(this.requestFrameId)
//     }
//     start(){
        
//         this.running = true
//         this.loop()
//     }
//     stop() {
//         this.running = false
//         cancelAnimationFrame( this.requestFrameId )
//     }
//     handleKeyDown( e ) {
//         console.log(e.code)
//         if ( e.code === "KeyW" ) {
//             console.log("handleKeyDown" , this.left.targetY )
//             if ( this.left.targetY - 7 >= 0 )
//                 this.left.targetY -= -7;
//             // let message = {
//             //     "type"      : "move",
//             //     "key"       : "Up"   
//             // }
//             // this.socket.send(JSON.stringify(message));
//         }
//         else if ( e.code == "KeyS" ) {
//             if ( this.left.targetY + 7 >= 0 )
//                 this.left.targetY += 7;
//             // let message = {
//             //     "type"      : "move",
//             //     "key"       : "Down"   
//             // }
//             // this.socket.send(JSON.stringify(message));
//         }
//     }
// }   

// customElements.define( 'gameComponentLocal', GamePlayLocal );
