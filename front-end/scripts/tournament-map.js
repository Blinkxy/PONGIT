import webSocketService from "../components/websocketService.js";
import { dataPlayer } from "../components/matchMaking.js";
export async function initializeTournamentRounds(component) {
	let round_url = localStorage.getItem('round_url');
	let fetchedData = {};

    const urlParts = round_url.split('/');
    const round_number = urlParts[4];
    async function fetchTournamentData() {
      try {
        const response = await fetch('/api/tournament/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status} message: ${errorData.message}`);
        }
        fetchedData = await response.json();
      } catch (error) {
        console.error('Error fetching tournament data:', error);
        throw error;
      }
    }

    // Fetch player data
    async function fetchDataplayer( id ) {
      const token = localStorage.getItem('accessToken');
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
          throw new Error(`HTTP error! status: ${response.status}`);
        else {
          const data = await response.json();
          console.log("data fetched:", data);
          return data;
        }
      }
      catch( error ) {
        console.error("fetch error" , error )
        throw error
      }
    }
    let playerInfo = {};

    async function updateRoundUI() {
      const round = fetchedData.rounds[round_number - 1];
      const matches = round.matches;
      const htmlClasss = [".player-left1", ".player-left2", ".player-left3", ".player-left4"];
      let i = 0;
      console.log("players:", fetchedData.players);
      for (const match of matches) {
        const player1 = fetchedData.players.find(player => player.id === match.player1);
        const player2 = fetchedData.players.find(player => player.id === match.player2);
    
        if (player1) {
          const fetchedPlayer1 = await fetchDataplayer(player1.player);
          playerInfo[player1.player] = fetchedPlayer1.profile_image;
          console.log("player1:", player1.player);
          const playersBottomContainer = document.querySelector('.players-bottom');
          const player_left1 = playersBottomContainer.querySelector(htmlClasss[i]);
          player_left1.querySelector("img").src =  fetchedPlayer1.profile_image;
          i++;
        }
        if (player2) {
          const fetchedPlayer2 = await fetchDataplayer(player2.player);
          playerInfo[player2.player] = fetchedPlayer2.profile_image;
          console.log("player2:", player2.player);
          const playersBottomContainer = document.querySelector('.players-bottom');
          const player_left2 = playersBottomContainer.querySelector(htmlClasss[i]);
          player_left2.querySelector("img").src =  fetchedPlayer2.profile_image;
          i++;
        }
      }
    }

    let match_id = 0;
    let player = 0;

    const socketCallbacks = {
        onOpen: () => console.log('WebSocket connection opened for round.'),
        onMessage: handleSocketMessage,
        onError: error => console.error('WebSocket Error:', error),
        onClose: () => console.log('WebSocket connection closed for round.')
    };

    async function initializeWebSocket(url) {
        const token = localStorage.getItem('accessToken');
        const socketUrl = `wss://10.11.4.4:443/ws${url}`;
        console.log("Connecting to WebSocket:", socketUrl);
		webSocketService.connect(socketUrl, token);
        webSocketService.setCallbacks(socketCallbacks);
    }
	//////////////////////////

  window.onbeforeunload = function() {
    webSocketService.sendMessage({ type: 'player_disconnected'});
  }
	async function handleSocketMessage(messageData) {
        if (messageData.type === 'match_session') {
			      console.log("match session");
            const appContainer         =  document.querySelector('.container');
            storeData( messageData["my_id"], "myData" )
            dataPlayer["myData"].id    =     messageData["my_id"];
            storeData( messageData["your_id"], "yourData" )
            dataPlayer["yourData"].id  =     messageData["your_id"];
            dataPlayer["session_name"] =     messageData.p_session;
            dataPlayer["id"]           =     fetchedData["id"]
            dataPlayer["type"]         =     "tournament"       
            document.querySelector('.tournament-map-container').style.display = 'none';
            console.log("tournament map container:", document.querySelector('.tournament-map-container'));

            setTimeout(addGame,5000)
        } else if (messageData.type === 'tournament_winner') {
            console.log("Tournament winner received.");
            const playerWinnerContainer = document.querySelector('.tournament-map-container .holder0 .winner');
            const winner =  await fetchDataplayer(messageData.winner);

            playerWinnerContainer.querySelector("img").src = winner.profile_image;
            setTimeout(() => {
              window.history.pushState({}, '', `/game`);
              window.loadComponent2('game', document.querySelector('.container'));
            }, 8000);
            // send a message to the server to delte the tournament
            webSocketService.sendMessage({ type: 'delete_tournament'});
              

        }
        else if (messageData.type === 'final_round') {
            handleFinalRound(messageData);
        }
        else if (messageData.type === 'photo_update') {
            const position = messageData.position;
            const playersTopContainer = document.querySelector('.players-top');
            if (position === 0)
            {
              const player_left = playersTopContainer.querySelector(".player-left1");
              player_left.querySelector("img").src = messageData.photo_url;
            }
            else if (position === 1)
            {
              const player_left = playersTopContainer.querySelector(".player-left2");
              player_left.querySelector("img").src = messageData.photo_url;
            }
        }
        else if (messageData.type === 'round_completed') {
          round_url = messageData.round_url;
          localStorage.setItem('round_url', round_url);
          initializeWebSocket(messageData.round_url);
        }
        else if (messageData.type === 'player_disconnected') {
          // redirect to the game page for all players
          window.history.pushState({}, '', `/game`);
          window.loadComponent2('game', document.querySelector('.container'));
          webSocketService.sendMessage({ type: 'delete_tournament'});
          // window.location.reload();
        }
        else {
            handleSocketMessage_utils(messageData);
            match_id = messageData.match_data.match_id;
            player = messageData.match_data.player;
        }
    }



    let photoUpdateSent = false;

    function sendPhotoUpdate(messageData, position) {
      if (!photoUpdateSent) {
        const message = {
          type: 'photo_update',
          match_id: messageData.match_id,
          position: position,
          winner: messageData.winner,
          loser: messageData.loser,
          photo_url:  playerInfo[messageData.winner],
        };
        webSocketService.sendMessage(message);
        photoUpdateSent = true;
    
        setTimeout(() => { photoUpdateSent = false; }, 1000);
      }
    }


	// Handle final round message
	function handleFinalRound(messageData) {
    
		  if (messageData.message === 'Won')
        {
          // document.querySelector('.tournament-map-container').style.display = 'block';
          const position = messageData.all_matches_id.indexOf(messageData.match_id);
          const playersTopContainer = document.querySelector('.players-top');
          if (position === 0)
          {
            const player_left = playersTopContainer.querySelector(".player-left1");
            player_left.querySelector("img").src =  playerInfo[messageData.winner];
          }
          else if (position === 1)
          {
            const player_left = playersTopContainer.querySelector(".player-left2");
            player_left.querySelector("img").src =  playerInfo[messageData.winner];
          }
          // Notify the server of the photo update
          const message = {
			    type: 'photo_update',
			    match_id: messageData.match_id,
			    position: position,
			    winner: messageData.winner,
			    photo_url:  playerInfo[messageData.winner]
		      };
		      // Send the object (dictionary) directly
          sendPhotoUpdate(message, position);
		}
	}

    // Handle WebSocket messages
    function handleSocketMessage_utils(messageData) {
       // Add CSS for the pop-up
    const style = document.createElement('style');
    style.textContent = `
        .popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
        }

        .popup-overlay.visible {
            opacity: 1;
        }

        .popup-content {
            background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
            padding: 25px;
            border-radius: 15px;
            border: 2px solid #00ff88;
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
            max-width: 400px;
            width: 90%;
            transform: translateY(20px);
            transition: transform 0.3s ease-out;
            position: relative;
        }

        .popup-overlay.visible .popup-content {
            transform: translateY(0);
        }

        .popup-header {
            font-size: 24px;
            font-weight: bold;
            color: #00ff88;
            margin-bottom: 15px;
            text-align: center;
        }

        .popup-message {
            font-size: 18px;
            line-height: 1.5;
            color: #ffffff;
            margin-bottom: 20px;
            text-align: center;
        }

        .popup-icon {
            font-size: 32px;
            margin-bottom: 15px;
            text-align: center;
        }

        .popup-progress {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: #00ff88;
            width: 100%;
            transform-origin: left;
            animation: progress 5s linear;
        }

        @keyframes progress {
            from { transform: scaleX(1); }
            to { transform: scaleX(0); }
        }
    `;

    document.head.appendChild(style);

    // Create popup elements
    const popup = document.createElement('div');
    popup.className = 'popup-overlay';

    const content = document.createElement('div');
    content.className = 'popup-content';

    // Add icon
    const icon = document.createElement('div');
    icon.className = 'popup-icon';
    icon.textContent = '🏓';

    // Add header
    const header = document.createElement('div');
    header.className = 'popup-header';
    header.textContent = 'Match Ready!';

    // Add message
    const message = document.createElement('div');
    message.className = 'popup-message';
    const messageText = messageData.match_data.message;
    message.textContent = messageText;

    // Add progress bar
    const progress = document.createElement('div');
    progress.className = 'popup-progress';

    // Assemble popup
    content.appendChild(icon);
    content.appendChild(header);
    content.appendChild(message);
    content.appendChild(progress);
    popup.appendChild(content);
    document.body.appendChild(popup);

    // Trigger entrance animation
    requestAnimationFrame(() => {
        popup.classList.add('visible');
    });

    // Remove popup after delay
    setTimeout(() => {
        popup.classList.remove('visible');
        setTimeout(() => {
            popup.remove();
            style.remove();
        }, 300); // Wait for fade out animation
    }, 5000);


  }

  // Setup event listeners
  async function setupEventListeners( ) {
    const playbtn=  document.querySelector('tournament-map-component .players-bottom .start-btn');
    console.log("playbtn:", playbtn);
    if (playbtn) {
      playbtn.addEventListener('click', () => {
        console.log('playbtn clicked');
		webSocketService.sendMessage({ type: 'play_match', match_id: match_id, player: player, action: 'play' });
      }
      );
    }
  }

    
  try {
    await fetchTournamentData();
    updateRoundUI();
	await initializeWebSocket(round_url);
	setupEventListeners();
  } catch (error) {
    console.error('Tournament initialization failed:', error);
    window.history.pushState({}, '', `/game`);
    window.loadComponent2('game', document.querySelector('.container'));

  }




  //////////////////////////
  async function storeData( id, haveId ) {
    try {
        const data = await fetchDataplayer(id);
        console.log( "fetch data" , data )
        dataPlayer[haveId].username     =    data["username"];
        dataPlayer[haveId].profile_image    =    data["profile_image"]
        if ( haveId === "yourData" )
		    {
		    	const appContainer		 =	document.querySelector(".container")
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
  function versusContainer() {
    console.log("call versusContainer")
	const versusPlayer1 = document.querySelector(".versus-container .versus .player1");
	versusPlayer1.querySelector("img").src =  dataPlayer["myData"].profile_image
	versusPlayer1.querySelector(".player-name").textContent = dataPlayer["myData"].username

	const versusPlayer2 = document.querySelector(".versus-container .versus .player2");
	versusPlayer2.querySelector("img").src =  dataPlayer["yourData"].profile_image
	versusPlayer2.querySelector(".player-name").textContent = dataPlayer["yourData"].username
  }
}

function addGame() {
  console.log("addgame 1" + document.querySelector('.container .tournament-map-container'));
	const appContainer 		= 	document.querySelector('.container');
	const versusComponent	=	appContainer.querySelector("versus-component")
	if ( versusComponent != null)
		versusComponent.remove()
	window.loadComponent2('game-component-play', appContainer);
  console.log("addgame 2" + document.querySelector('.container .tournament-map-container'));
}
