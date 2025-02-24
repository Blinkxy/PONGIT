 
import { getWebsocket, closeWebsocket, dataPlayer } from "../components/matchMaking.js";
// import {MatchMacking} from "../components/matchMaking"


// game.js

// export let session_name ;

function initializeGameComponent(component) {


	// console.log("start\n\n\n\nend")
	const ball = document.querySelector('.ball');
	const container = document.querySelector('.game-container');
	// ball = "hello"
	// console.log("test" , ball)

	// if we click on quick play button
	const quickPlayBtn = document.querySelector('.game-container .buttons a.first');
	quickPlayBtn.addEventListener('click', () => {
		// matchMacking();
		// console.log('hello fuck');
	})	


	// if we click on play with friends button
	const PlayFriendsBtn = document.querySelector('.game-container .buttons a.second');
	const gameMode = document.querySelector('.game-mode');
	PlayFriendsBtn.addEventListener('click', () => {
		// console.log('hello fuck 1');
		gameMode.style.display = 'block';
	})
	const playLocale = container.querySelector('.game-container .buttons a.first')
	// let gameC = container.querySelector('.game-container')
	playLocale.addEventListener( "click", ( ) => {
		document.querySelector(" game-component ").remove()

		window.loadComponent2('game-component-locale', document.querySelector(" .container "));
		// console.log(gamc)
		// console.log('hello fuck 3');
		// console.log("play locale is clicked")
	})
		// START TEST__CLICK__IN_BUTTON__1__VS__1

	// test click in 1 VS 1
	const Random = document.querySelector('.game-mode .buttons a.first ');
	Random.addEventListener('click', () => {
		matchMacking();
		gameMode.style.display = 'none';
		// console.log('Random player');
	})
	function cancelWaiting() {
		console.log(" test waiting ")
	}
	function hundleCancelButton() {
		const btn_cancel	=	document.querySelector('find-match-component .find-match-container');
		// btn_cancel.addEventListener( () => {
		// 	message = {
		// 		"type"	:	"cancel",
		// 		"code"	:	4500
		// 	}
		// 	game.send(JSON.stringify(message));
		// })
		// console.log( btn_cancel )
	}
		
		// END TEST__CLICK__IN_BUTTON__1__VS__1
	
	// click on cancel btn in game-mode
	const cancelBtn = document.querySelector('.game-mode img');
	cancelBtn.addEventListener('click', ()=> {
		gameMode.style.display = 'none';
	})

	
	const tournament = document.querySelector('.tournament')
	
	// click on tournament button that exist on game-mode
	const tournamentBtn = document.querySelector('.game-mode .buttons .second');
	tournamentBtn.addEventListener('click', ()=> {
		gameMode.style.display = 'none'
		container.style.display = 'none';
		tournament.style.display = 'block';
		// window.location.pathname = '/tournament';

		// window.history.pushState({}, '', '/tournament');

	});
	
	// click on flesh that exist on tournament
	const tournamentFlech = document.querySelector('.tournament i');
	tournamentFlech.addEventListener('click', ()=>{
		gameMode.style.display = 'block';
		container.style.display = 'block';
		tournament.style.display = 'none';
	})

	// click on create tournament button
	const createTrounamentBtn =  document.getElementById('create-tournament-btn');
	createTrounamentBtn.addEventListener('click', function () {
		// Get the container where the form will be added
		const formContainer = document.getElementById('tournament-form');

		// Check if the form already exists to prevent duplication
		if (!formContainer.innerHTML) {
			// Add the label, input, and buttons dynamically
			formContainer.innerHTML = `
				<label for="tournament-name">Tournament Name</label>
				<input type="text" id="tournament-name" placeholder="Enter tournament name">
				<div class="form-buttons">
					<a id="create-btn" class="form-btn create">Create</a>
					<a id="cancel-btn" class="form-btn cancel">Cancel</a>
				</div>
			`;

			// Add functionality to the Cancel button
			document.getElementById('cancel-btn').addEventListener('click', function () {
				// Clear the form content
				formContainer.innerHTML = '';
			});

 
			
			
			// Add functionality to the Create button
			document.getElementById('create-btn').addEventListener('click', async function () {
				const tournamentName = document.getElementById('tournament-name').value.trim();
				//const tournamentName2 = document.querySelector('.tournament .buttons a.second');
				if (tournamentName) {
					// tournamentName2.style.display = 'block';
					// tournamentName2.textContent = tournamentName;
					// console.log(tournamentName);

					const token = localStorage.getItem('accessToken');
        
        			// Prepare data to send to the backend
        			const data = { name: tournamentName };

        			try {
        			    // Send the POST request to create the tournament
        			    const response = await fetch('/api/tournament/', {
        			        method: 'POST',
        			        headers: {
        			            'Content-Type': 'application/json',
        			            'Authorization': `Bearer ${token}`,
        			        },
        			        body: JSON.stringify(data),
        			    });
					
        			    // Handle the response
        			    if (response.status === 201) {
        			        const responseData = await response.json();  // Parse JSON only if status is 201
        			        // console.log('Tournament created successfully:', responseData);
						
        			        // Extract the tournament ID from the response
        			        const tournamentId = responseData.id;
						
        			        // Update the URL with the new tournament ID
							// window.location.pathname = `/ws/tournament/lobby/${tournamentId}`;
        			        window.history.pushState({}, '', `/tournament`);
        			        // // Now that the data is available, call loadComponent2
        			        const appContainer = document.querySelector('.container');
        			        window.loadComponent2("tournament", appContainer, ".owner");
        			    } else {
        			        const errorData = await response.json();
        			        throw new Error(errorData.non_field_errors ? errorData.non_field_errors.join(', ') : 'An error occurred');
        			    }
        			} catch (error) {
						// alert with the error message
						alert(error.message);

					}
				
    				} else {
    				    alert('Please enter a tournament name.');
    				}
						});
					}
	});
	



	//			START		__MATCH__MAKING__TEST__ 
	
	// async function Macking() {
	// 	room_name = "random"
	// 	// Initialize WebSocket connection
	// 	const token = localStorage.getItem('accessToken');
	// 	console.log( "token" , token )
	// 	const socketUrl = `wss://10.11.4.4:443/ws/matchmaking/${room_name}/?token=${token}`;
	// 	// window.macking = new WebSocket(socketUrl);
	// 	let makingMatch = new WebSocket(socketUrl);
		// console.log(makingMatch.isCreated())
		// macking.onopen = function() {
		// 	console.log("connection is open");
		// }
		// macking.onmessage = function( event ) {
		// 	let data = JSON.parse(event.data)
		// 	if ( data["type"] === "waiting" ) {
		// 		const appContainer = document.querySelector('.container');
		// 		window.loadComponent2('find-match', appContainer);
		// 		hundleCancelButton();
		// 	}
		// 	// if ( data["type"] === "waiting" ) {
		// 	// 	let waiting = document.getElementsByClassName("game-mode")[0];
				

		// 	// 	// Create the new element
		// 	// 	let newElm = document.createElement('div');
		// 	// 	newElm.style.width = "200px";
		// 	// 	newElm.style.height = "40px";
		// 	// 	newElm.style.top = "50%";
		// 	// 	newElm.style.left = "50%";
		// 	// 	newElm.style.transform = "translate(-50%, -50%)";
		// 	// 	newElm.style.position = "absolute";
		// 	// 	newElm.style.background = "black";
		// 	// 	newElm.textContent = 'Waiting Player Please';
		// 	// 	newElm.style.justifyContent = "center";
		// 	// 	newElm.style.alignItems = "center";
		// 	// 	newElm.style.display = "flex";
  		// 	// 	newElm.style.fontSize = "14px";
		// 	// 	newElm.style.color = "wheat";
		// 	// 	newElm.style.borderRadius = "25px"
		// 	// 	newElm.setAttribute("id", "waiting");
		// 	// 	if (waiting) {
		// 	// 	    waiting.appendChild(newElm);
		// 	// 	}

		// 	// }
		// 	if ( data["type"] === "already_playing" ) {
		// 		console.log(data["message"])
		// 	}
		// 	if ( data["type"] === "session_name" ) {
		// 		console.log( data );
		// 		fetchData( data["my_id"] )
				
		// 	}
		// }
	// }
	//		END		__MATCH__MAKING__TEST__ 

		// if the user click on the tournament button
		const tournamentNameBtn = document.querySelector('.tournament .buttons a.second');
		tournamentNameBtn.addEventListener('click', ()=> {
			const appContainer = document.querySelector('.container');
			const tournamentName2 = document.querySelector('.tournament .buttons a.second');
			// console.log(tournamentName2.textContent);
			window.loadComponent2("tournament", appContainer, tournamentName2.textContent);
		})
	// });

	
// Ball dimensions
const ballDiameter = ball.offsetWidth;

// Get container dimensions dynamically
function getContainerRect() {
	return container.getBoundingClientRect();
}

// Ball position and velocity
let ballX = Math.random() * (getContainerRect().width - ballDiameter);
let ballY = Math.random() * (getContainerRect().height - ballDiameter);
let velocityX = (Math.random() * 2 - 1) * 6; // Random horizontal speed (-6 to 6)
let velocityY = (Math.random() * 2 - 1) * 6; // Random vertical speed (-6 to 6)

// Animation loop
function moveBall() {
	const containerRect = getContainerRect(); // Get up-to-date container dimensions

	// Update ball position
	ballX += velocityX;
	ballY += velocityY;

	// Correct bounds checking and position clamping
	if (ballX <= 0) {
		velocityX *= -1; // Reverse horizontal direction
		ballX = 0; // Keep ball at left edge
	}
	if (ballX >= containerRect.width - ballDiameter) {
		velocityX *= -1; // Reverse horizontal direction
		ballX = containerRect.width - ballDiameter; // Keep ball at right edge
	}
	if (ballY <= 0) {
		velocityY *= -1; // Reverse vertical direction
		ballY = 0; // Keep ball at top edge
	}
	if (ballY >= containerRect.height - ballDiameter) {
		velocityY *= -1; // Reverse vertical direction
		ballY = containerRect.height - ballDiameter; // Keep ball at bottom edge
	}

	// Update ball's CSS position
	ball.style.left = `${ballX}px`;
	ball.style.top = `${ballY}px`;

	// Request the next animation frame
	requestAnimationFrame(moveBall);
}

// Initialize ball position
ball.style.position = "absolute";
	
	// Start the animation
	moveBall();
// }(this);
function matchMacking() {
	const room_name = "random";
	const token = localStorage.getItem('accessToken');
	const socketUrl = `wss://10.11.4.4:443/ws/matchmaking/random/?token=${token}`;
	// console.log(`here open socket ${socketUrl}`)
	const socket = getWebsocket(socketUrl)
	socket.onopen = function() {
			console.log("connection is open");
	}
	socket.addEventListener("message", ( event ) => {
		let data = JSON.parse(event.data)
		// console.log(data)
		if ( data.type === "waiting" ) {
			const appContainer = document.querySelector('.container');
			window.loadComponent2('find-match', appContainer);
		}
		else if ( data.type === "session_name" ) {
			// console.log("test component find match is loading")
			storeData( data["my_id"], "myData" )
			dataPlayer["myData"].id 	= 	data["my_id"];
			storeData( data["your_id"], "yourData" )
			dataPlayer["yourData"].id 	= 	data["your_id"];
			dataPlayer.session_name 	=	data["session_name"]
			dataPlayer["id"]			= 	-1
			dataPlayer["type"]			=	"random"
			// console.log("test here is loading game component")
			setTimeout(addGame,5000)
		}
	})
	socket.addEventListener("close", ( event ) => {
		// console.log("1test close web socket2")
		const token = localStorage.getItem('accessToken');
		const socketUrl = `wss://10.11.4.4:443/ws/matchmaking/random/?token=${token}`;
		closeWebsocket(socketUrl);
	})
}
	
	// function versusContainer() {
	// 	const findMatchContainer = document.querySelector(".container .find-match-container");
	// 	const versusContainer = document.querySelector(".versus-container");
	
	// 	findMatchContainer.style.display = "none";
	// 	versusContainer.style.display = "block";
	
	// 	const versusPlayer1 = document.querySelector(".versus-container .versus .player1");
	// 	versusPlayer1.querySelector("img").src =  dataPlayer["myData"].profile_image
	// 	versusPlayer1.querySelector(".player-name").textContent = dataPlayer["myData"].username
	
	// 	const versusPlayer2 = document.querySelector(".versus-container .versus .player2");
	// 	versusPlayer2.querySelector("img").src =  dataPlayer["yourData"].profile_image
	// 	versusPlayer2.querySelector(".player-name").textContent = dataPlayer["yourData"].username
	// }
	
	
	// async function storeData( id, haveId ) {
	// 	try {
	// 		const data = await fetchDataplayer(id);
	// 		dataPlayer[haveId].username 	=	data["username"];
	// 		dataPlayer[haveId].profile_image	=	data["profile_image"]
	// 		versusContainer()
	// 	}
	// 	else if ( data.type === "session_name") {
	// 		storeData( data["my_id"], "myData" )
	// 		dataPlayer["myData"].id 	= 	data["my_id"];
	// 		storeData( data["your_id"], "yourData" )
	// 		dataPlayer["yourData"].id 	= 	data["your_id"];
	// 		dataPlayer.session_name 	=	data["session_name"]
			// setTimeout(addGame,5000)
			
	// 	}
	// })
	// socket.addEventListener("close", ( event ) => {
	// 	console.log("1test close web socket2")
	// 	const token = localStorage.getItem('accessToken');
	// 	const socketUrl = `wss://10.11.4.4:443/ws/matchmaking/random/?token=${token}`;
	// 	closeWebsocket(socketUrl);
	// })
// }

async function versusContainer() {
	// console.log("call versusContainer")
	const versusPlayer1 					=	document.querySelector(".versus-container .versus .player1");
	versusPlayer1.querySelector("img").src  =	 dataPlayer["myData"].profile_image
	let usernameNamePalyerOne 				=	dataPlayer["myData"].username;
	let usernameNamePalyerTwo 				=	dataPlayer["yourData"].username;
	if ( usernameNamePalyerOne.length >= 10) {
		usernameNamePalyerOne = usernameNamePalyerOne.substring(0,9)
		usernameNamePalyerOne += "."
	}
	if ( usernameNamePalyerTwo.length >= 10) {
		usernameNamePalyerTwo = usernameNamePalyerTwo.substring(0,9)
		usernameNamePalyerTwo += "."
	}
	// versusPlayer1.querySelector(".player-name").textContent = dataPlayer["myData"].username
	versusPlayer1.querySelector(".player-name").textContent = usernameNamePalyerOne

	const versusPlayer2 = document.querySelector(".versus-container .versus .player2");
	versusPlayer2.querySelector("img").src =  dataPlayer["yourData"].profile_image
	// versusPlayer2.querySelector(".player-name").textContent = dataPlayer["yourData"].username
	versusPlayer2.querySelector(".player-name").textContent = usernameNamePalyerTwo
}


async function storeData( id, haveId ) {
	try {
		const data = await fetchDataplayer(id);
		// console.log( "fetch data" , data )
		dataPlayer[haveId].username 	=	data["username"];
		dataPlayer[haveId].profile_image	=	data["profile_image"]
		if ( haveId === "yourData" )
		{
			const appContainer		 =	document.querySelector(".container")
			const findMatchComponent =	appContainer.querySelector("find-match-component");
			const gameComponent 	 =	appContainer.querySelector("game-component");
			if ( gameComponent != null ) {
				gameComponent.remove()
				console.log( "game component is removed" )
			}
			if ( findMatchComponent != null )
			{
				findMatchComponent.remove()
				console.log( "match makng is removed")
			}
			window.loadComponent2('versus-component', appContainer);
			const versusComponent = document.querySelector("versus-component");
			versusComponent.addEventListener("content-loaded", () => {
				versusContainer()
			});
		}
	}
	catch( error ) {
		console.error("error in fetch data", error)
	}
}

function addGame() {
	const appContainer 		= 	document.querySelector('.container');
	const versusComponent	=	appContainer.querySelector("versus-component")
	if ( versusComponent != null)
		versusComponent.remove()
	window.loadComponent2('game-component-play', appContainer);
	const token = localStorage.getItem('accessToken');
	const socketUrl = `wss://10.11.4.4:443/ws/matchmaking/random/?token=${token}`;
	closeWebsocket(socketUrl)
}

async function fetchDataplayer( id ) {
	const token = localStorage.getItem('accessToken');
	// console.log(token)
	if (!token)
		throw new Error('No access token found in localStorage');
	try {
		const response = await fetch(`/api/user/${id}` , {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			}
		})
		if ( !response.ok ) 
			{
				// console.log("error in API")
				throw new Error(`HTTP error! status: ${response.status}`);
			}
		else {
			const data = await response.json();
			return data;
		}
	}
	catch( error ) {
		console.error("fetch error" , error )
		throw error
	}
}
}

// initializeGameComponent(this);
window.initializeGameComponent = initializeGameComponent;

// window.socket = new WebSocket(socketUrl)
// window.socket.onopen = function() {
// 		console.log("connection is open");
// }
// window.socket.onmessage = function( event ) {
// 	let data = JSON.parse(event.data)
// 	if ( data.type === "waiting" ) {
// 		const appContainer = document.querySelector('.container');
// 		window.loadComponent2('find-match', appContainer);
// 	}
// 	console.log( data )
// }


