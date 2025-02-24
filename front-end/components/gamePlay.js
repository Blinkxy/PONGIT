import { getWebsocket, closeWebsocket , dataPlayer}  from "/components/matchMaking.js"
import { Manger } from "../scripts/gamePlay.js"
class GamePlay extends HTMLElement {
	constructor() {
        super(); 
        // console.log(" constructor game play component")
        const token     =   localStorage.getItem('accessToken');
        const type      =   dataPlayer.type
        // console.log( "type of game is " , type)
	    const socketUrl =   `wss://10.11.4.4:443/ws/game/${dataPlayer.session_name}/?token=${token}&type=${type}&id=${dataPlayer.id}`;
        this.socket     =   getWebsocket(socketUrl)
        this.manager    =   null;
        this.requestFrame   =   null;
        this.handleKeyDown  =   this.handleKeyDown.bind(this);
        // this.handleKeyUp = this.handleKeyUp.bind(this);
	} 
    async connectedCallback() {
        this.color = "white"
        // Fetch HTML

		const htmlResponse = await fetch('../views/gamePlay.html');
		const htmlContent = await htmlResponse.text();

        const cssResponse = await fetch('../assets/css/gamePlay.css');
		const cssContent = await cssResponse.text();

        const style = document.createElement('style');
		style.textContent = cssContent;
        // Set inner HTML
		this.innerHTML = htmlContent;
        this.appendChild(style);

        // const gameModule = await import('../scripts/gamePlay.js');
        // console.log("test test test hello in connectedCallback function")
        this.changeColor()
        let img1 =  dataPlayer["myData"].profile_image;
        let img2 =  dataPlayer["yourData"].profile_image;
        this.updateDataPlayer(img1, img2)
            // socket
        this.socket.onopen = function() {
            console.log("game socket is open")
        }

		// To show the winner announcement:
		function showWinner() {
			const winnerOverlay = document.querySelector('.game-end.winner');
			winnerOverlay.classList.add('show');
			// Hide after 3 seconds
			setTimeout(() => {
                // console.log("test show winner")
				winnerOverlay.classList.remove('show');
                const appContainer         =     document.querySelector('.container');
                const versusComponentTour  =    appContainer.querySelector("game-component-play")
                if ( versusComponentTour != null )
                    versusComponentTour.remove()
                if (dataPlayer["type"] === "tournament") {
                    const tournamentComponent = document.querySelector(".tournament-map-container")
                    if ( tournamentComponent != null ) {
                        tournamentComponent.style.display = "block"
                    }
                    else {
                        console.log("tournament component is null")
                    }

                }
                else
                    console.log("type of game is not tournament")

			}, 7000);
		}

		// To show the loser announcement:
		function showLoser() {
			const loserOverlay = document.querySelector('.game-end.loser');
            if ( loserOverlay !== null ) {
                loserOverlay.classList.add('show');
                // Hide after 3 seconds
                setTimeout(() => {
                    // console.log("test show loser")
                    loserOverlay.classList.remove('show');
                    /////////////////////////////
                    const appContainer         =     document.querySelector('.container');
                    const versusComponentTour  =    appContainer.querySelector("game-component-play")
                    if ( versusComponentTour != null)
                        versusComponentTour.remove()
                    if (dataPlayer["type"] === "tournament") {
                        const tournamentComponent = document.querySelector(".tournament-map-container")
                        tournamentComponent.remove()
                        window.history.pushState({}, '', `/game`);
                        window.loadComponent2('game', document.querySelector('.container'));
                        // if ( tournamentComponent != null ) {
                        //     tournamentComponent.style.display = "block"
                        // }
                        // else {
                        //     console.log("tournament component is null")
                        // }
                    }
                    else
                        console.log("type of game is not tournament")
    
                    /////////////////////////////
                }, 7000);
            }
            else {
                console.log("socket close in loserOverlay ")
            }
		}

        this.socket.onmessage = ( event )  =>  {
            let data = JSON.parse(event.data)
            // console.log(data)
            if ( data["type"] === "information_game" ) {
                this.informationTable( data )
                this.manager = new Manger(data ,"canvas")
                this.manager.start()
                setTimeout(() => {
                    console.log("test send event start")
                    if ( this.socket.readyState !== WebSocket.CLOSED ) {
                        this.socket.send(JSON.stringify({"type" : "start"}))
                        document.addEventListener("keydown", this.handleKeyDown)
                    }
                    else {
                        console.log("web socket is closed ")
                    }
                }, 3000)
            }
            else if ( data["type"] === "move_player") {
                this.manager[`${data["pos"]}`].targetY = data["new_position"]
                // console.log(Number(data["new_position"]))
            }
            else if ( data["type"] === "end.game" ) {
                dataPlayer.stateGame = "end"
                // console.log( data )
                this.manager.stop()
                // console.log( "data result" , data["result"])
                if ( data["result"] === "lost" )
                    showLoser();
                else 
                    showWinner();
                
            }
            else if ( data["type"] === "play" ) {
                console.log("player alrady play")
            }
            else if ( data["type"] === "newData" ) {
                if ( data["reset"] === "reset" ) {
                    // console.log("score is changed you must rest [TARGET]")
                    this.manager.reset      =   "reset"
                    this.manager.ball.x     =   data["ball_x"]
                    this.manager.ball.y     =   data["ball_y"]
                }
                else {
                    this.manager.reset      =   "none"
                }
                this.manager.ball.targetX            =   data["ball_x"]
                this.manager.ball.targetY            =   data["ball_y"]
                if ( this.manager.left.score !== data["left"] || this.manager.right.score !== data["right"] ) {
                    this.manager.left.score              =   data["left"]
                    this.manager.right.score             =   data["right"]
                    if ( document.querySelector(".container game-component-play") === null ) {
                        const token     =   localStorage.getItem('accessToken');
                        const type      =   dataPlayer.type
                        // console.log( "type of game is " , type)
	                    const socketUrl =   `wss://10.11.4.4:443/ws/game/${dataPlayer.session_name}/?token=${token}&type=${type}&id=${dataPlayer.id}`;
                        // this.socket.close(3880)
                        if (this.socket !== null ) {
                            // console.log()
                            let message = {
                                "type"      :  "closeGame",
                            }
                            this.socket.send(JSON.stringify(message));
                            // this.socket.close(3220)
                        }
                        // console.log("close game inside component")
                        // closeWebsocket(socketUrl)
                        this.manager.stop()
                    }
                    else {
                        document.querySelector(".container game-component-play .leftPlayer p").innerHTML = data["left"]
                        document.querySelector(".container game-component-play .rightPlayer p").innerHTML = data["right"]
                        // console.log( this.manager.left.score, this.manager.right.score )
                        this.manager.stop()
                        this.manager.start()  
                    }
                }
            }
        }
 
        this.dispatchEvent(new CustomEvent('content-loaded', { bubbles: true, composed: true }));

    }
    updateDataPlayer( img1, img2 ) {
        const container =  this.querySelector(".dataPlayer")
        this.querySelector(".dataPlayer .leftPlayer img").src = img1
        this.querySelector(".dataPlayer .rightPlayer img").src = img2
    }
    changeColor() {
        const canvas = this.querySelector('canvas');
        canvas.width = 1000;
        canvas.height = 500;
        const paddelLeft = this.querySelector('.paddel-left');
        const paddelRight = this.querySelector('.paddel-right');
        const colorDivs = this.querySelectorAll('.color-paddele .color div');
        const startButton = this.querySelector('.start');
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
            // console.log("test color ")
			const loader = this.querySelector('.loader-container');
			// colorPaddle.style.display = 'none';
			loader.style.display = 'block';
            const message = {
                "type"  : "color",
                "color" : this.color
            }
            this.socket.send(JSON.stringify(message))
            colorPaddle.remove();
        });
    }
    informationTable( data ) {
        const canvas = this.querySelector('canvas');
        const gamePlayer = this.querySelector('.game-play .position-padele'); 
        const positionPaddle = this.querySelector('.game-play .position-padele');
        let img1, img2;
        if ( data["side"] === "left" ) {
            img1 =  dataPlayer["myData"].profile_image;
            img2 =  dataPlayer["yourData"].profile_image
        }
        else {
            img1 =  dataPlayer["yourData"].profile_image;
            img2 =  dataPlayer["myData"].profile_image
        }
        this.updateDataPlayer( img1, img2 )
        // console.log(dataPlayer)
        //const colorPaddle = this.querySelector('.color-paddele')
		const loader = this.querySelector('.loader-container');
        canvas.style.display = "block";
        if ( gamePlayer ) gamePlayer.remove()
        // if ( colorPaddle ) colorPaddle.remove()
        if ( loader ) loader.style.display = 'none';
        if ( positionPaddle ) positionPaddle.remove()
    }
    handleKeyDown( e ) {
        // console.log(e.code)
        if ( this.socket.readyState === WebSocket.OPEN ) {
            if ( e.code === "KeyW" ) {
                let message = {
                    "type"      : "move",
                    "key"       : "Up"   
                }
                this.socket.send(JSON.stringify(message));
            }
            else if ( e.code == "KeyS") {
                let message = {
                    "type"      : "move",
                    "key"       : "Down"   
                }
                this.socket.send(JSON.stringify(message));
            }
        }
    }
    disconnectedCallback( ) {
        if ( this.manager != null )
            this.manager.stop()
        document.removeEventListener( "keydown", this.handleKeyDown );
        if ( (dataPlayer.type == "random" || dataPlayer.type == "chat") && dataPlayer.stateGame !== "end") {
            // console.log("\n\n\n\n\n\n\n\n\n\test n\n\n\n\n\n\n\n\n")
            if (this.socket !== null ) {
                // console.log()
                let message = {
                    "type"      :  "closeGame",
                }
                console.log("close game inside disctructure component")
                this.socket.send(JSON.stringify(message));
                // this.socket.close(3220)
            }
        }
        if ( window.location.href === "https://10.11.4.4/game" ) 
        {
            console.log("from com game play" , window.location.href, document.querySelector("game-component"))
            if ( document.querySelector("game-component") == null ) {
                console.log("test load component 1")
                // setTimeout(()=> {
                    window.loadComponent2("game", document.querySelector(".container"));
                // }, 1000)
            }
        }
        // console.log("locations " , window.location.href)
        // if ( dataPlayer.stateGame !== "end") {
        //     // this.socket.send( {
        //     //     type    :   "close",
        //     //     code    :   3220,
        //     //     reason  :   "cancel play game",
        //     // })
            
        //     // reason: "That's all folks",
        // }
    }
}

customElements.define('game-component-play', GamePlay);
