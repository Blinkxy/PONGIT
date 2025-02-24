import { getWebsocket, closeWebsocket }  from "../components/matchMaking.js";

(function initializeChatComponent(component) {
	const token = localStorage.getItem('accessToken');
	const socketUrl = `wss://10.11.4.4:443/ws/matchmaking/random/?token=${token}`;
	const socket = getWebsocket(socketUrl)

	const dots = document.querySelector('.dots');
	
	const container = document.querySelector('.container');
	// setInterval(() => {
	// 	dots.textContent = dots.textContent.length >= 3 ? '' : dots.textContent + '.';
	// }, 500);
	const button = document.querySelector('.cancel-btn')
	console.log( "match making ")
	// button.addEventListener('click', () => {
	// 		let message = {
	// 			"type"	:	"cancel",
	// 			"code"	:	4500
	// 		}
	// 		// window.socket.send(JSON.stringify(message));
	// 		socket.send(JSON.stringify(message));
	// 		socket.addEventListener = function ( event )  {
	// 			console.log( "cancel btn --->", event.data )
	// 		}
	// 		container.querySelector('find-match-component').remove();
	// 		console.log('Search cancelled');
	// });

	// set a timeout for 5s for desplay 1v1 and hide the loading part
	// Get references to the containers

    const findMatchContainer = document.querySelector(".find-match-container");
    // const versusContainer = document.querySelector(".versus-container");
    
    // Initially hide the versus container
    // versusContainer.style.display = "none";
    
    // Set a timeout to switch containers after 5 seconds
			// test
    // setTimeout(() => {
    //     // Hide the find-match container
    //     findMatchContainer.style.display = "none";
        
    //     // Show the versus container
    //     versusContainer.style.display = "block";
    // }, 5000); // 5000 milliseconds = 5 seconds


	// You can dynamically update player names and images like this:
	// function updatePlayers(player1, player2) {
	// 	const players = {
	// 		player1: {
	// 			name: player1.name,
	// 			image: player1.image
	// 		},
	// 		player2: {
	// 			name: player2.name,
	// 			image: player2.image
	// 		}
	// 	};

	// 	document.querySelector('.player1 .player-name').textContent = players.player1.name;
	// 	document.querySelector('.player2 .player-name').textContent = players.player2.name;
	// 	document.querySelector('.player1 .player-image').src = players.player1.image;
	// 	document.querySelector('.player2 .player-image').src = players.player2.image;
	// }

	
})(this);

