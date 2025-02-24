import webSocketService from "../components/websocketService.js";

export async function initializeTournament(component) {
  const tournamentContainer = document.querySelector('.tournament-container');
  
  if (tournamentContainer.classList.contains('owner')) {
    console.log("This is owner");
  }

function buildPlayer(nickname, currentUser) {
  const playersList = document.querySelector('.tournament-container .players');

  if (!playersList) {
      console.error('Error: Players list container not found.');
      return;
  }

  const player = document.createElement('li');
  player.classList.add('player', 'regular');

  // Creative nickname display
  const displayName = nickname === currentUser ? `${nickname} (You)` : nickname;

  player.innerHTML = `
      <div class="player-name">${displayName}</div>
      <a class="exit"><i class="fa-solid fa-arrow-right-from-bracket"></i></a>
      <a class="cancel"><i class="fa-regular fa-circle-xmark"></i></a>
  `;
  playersList.appendChild(player);
}


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
        throw new Error(errorData.error);
      }else{
      const data = await response.json();
      return data;
      }
    } catch (error) {
      component.disconnectedCallback();
      window.history.pushState({}, '', `/game`);
      window.loadComponent2('game', document.querySelector('.container'));
    }
  }

  async function initializeWebSocket(data) {
    try {
      const token = localStorage.getItem('accessToken');
      const socketUrl = `wss://10.11.4.4:443/ws/tournament/lobby/${data.id}/`;

      // Store the webSocketService instance
      webSocketService.connect(socketUrl, token);

      webSocketService.setCallbacks({
        onOpen: () => {
          console.log('Lobby WebSocket connection opened.');
        },
        onMessage: (messageData) => {
          handleSocketMessage(messageData, data);
        },
        onError: (error) => {
          console.error('WebSocket Error:', error);
        },
        onClose: () => {
          console.log('Lobby WebSocket connection closed.');
        },
      });

      return webSocketService;
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      throw error;
    }
  }

function handleSocketMessage(messageData, data) {
  const currentUser = localStorage.getItem('username');
  const owner = data.players.find(player => player.player === data.created_by);

  if (messageData.type === 'player_joined') {
      const playerCount = messageData.player_count;
      const joinsSpan = document.querySelector('.tournament-name .joins');
      if (joinsSpan) {
          joinsSpan.textContent = `${playerCount}`;
      }

      const playerListContainer = document.querySelector('.tournament-container .players');
      if (playerListContainer) {
          // Clear only non-owner players
          Array.from(playerListContainer.querySelectorAll('li.player.regular')).forEach(el => el.remove());

          // Rebuild non-owner players
          messageData.players.forEach(player => {
              if (player !== owner.player_identifier) {
                  buildPlayer(player, currentUser); // Reuse the `buildPlayer` function for non-owner players
              }
          });
      }
  }
  if (messageData.type === 'player_left') {
    const username = localStorage.getItem('username');
    console.log('Player left the tournament');
      const playerCount = messageData.player_count;
      const joinsSpan = document.querySelector('.tournament-name .joins');
      if (joinsSpan) {
          joinsSpan.textContent = `${playerCount}`;
      }

      const playerListContainer = document.querySelector('.tournament-container .players');
      if (playerListContainer) {
          // Clear only non-owner players
          Array.from(playerListContainer.querySelectorAll('li.player.regular')).forEach(el => el.remove());

          // Rebuild non-owner players
          messageData.players.forEach(player => {
              if (player !== owner.player_identifier) {
                  buildPlayer(player, currentUser);
              }
          });
      }
      // check if username is in the list of players
      const nickname = messageData.players.find(player => player === username);
      if (messageData.players.length === 0 || !nickname) {
        console.log('left the tournament');
        window.history.pushState({}, '', `/game`);
        window.loadComponent2('game', document.querySelector('.container'));
    }
  }
  if (messageData.type === 'start_tournament') {
      const appContainer = document.querySelector('.container');
      window.history.pushState({}, '', `/tournament-map`);
      localStorage.setItem('round_url', messageData.round_url);
      window.loadComponent2("tournament-map", appContainer);
  }
  if (messageData.type === 'confirm_disconnect') {
    console.log('Owner left the tournament');
    component.disconnectedCallback();
    window.history.pushState({}, '', `/game`);
    window.loadComponent2('game', document.querySelector('.container'));
  }
  if (messageData.type === 'error') {
    alert(messageData.message);
  }

}



function toggleOwnerControls(data) {
  const owner = data.players.find(player => player.player === data.created_by);
  const isOwner = owner && owner.player_identifier === localStorage.getItem('username');

  const startButton = document.querySelector('.btn-start-container');
  const inviteFriends = document.querySelector('.invite-friends');
  const deleteButton = document.querySelector('.btn-delete');
  const kickButton = document.querySelector('.btn-kick');

  if (startButton) {
      startButton.style.display = isOwner ? 'block' : 'none';
  }

  if (inviteFriends) {
      inviteFriends.style.display = isOwner ? 'block' : 'none';
  }
  if (deleteButton) {
    deleteButton.style.display = isOwner ? 'block' : 'none';
  }
  if (kickButton){
    kickButton.style.display = isOwner ? 'block' : 'none';
  }
}
  function updateTournamentUI(data) {
    const tournamentName = document.querySelector('.tournament-container .tournament-name .name');
    if (tournamentName) {
        tournamentName.textContent = data.name;
    }
    const owner = data.players.find(player => player.player === data.created_by);
    const ownerNameElement = document.querySelector('.tournament-container .player.owner .player-name');
    if (ownerNameElement && owner) {
        ownerNameElement.textContent = `${owner.player_identifier} (Owner)`;
    }

    // toggle owner controls
    toggleOwnerControls(data);
}


  function setupEventListeners(data) {
    const playersList = document.querySelector('.tournament-container .players');
    const startBtn = document.querySelector('.tournament-container .btn-start');
    const inviteFriends = document.querySelector('.tournament-container .invite-friends');
    const deleteButton = document.querySelector('.tournament-container .btn-delete');
	const kickButton = document.querySelector('.tournament-container .btn-kick');
  const exitButton = document.querySelector('.tournament-container .tournament-name i');




    // handle player exit
    // if (playersList) {

      // kick user clicked button
	    if (kickButton)
	    {
	    	component.addListener(kickButton, 'click', async () => {
	    		const kickInputContainer = document.querySelector('.kick-user-input');
	    		kickInputContainer.style.display = 'flex';
	    	});
	    	// Handle the "Cancel" button to hide the input field
	    	document.querySelector('.btn-cancel').addEventListener('click', function () {
	    		const kickInputContainer = document.querySelector('.kick-user-input');
	    		kickInputContainer.style.display = 'none'; // Hide the input field
	    		document.querySelector('.kick-input').value = ''; // Clear the input field
	    	  });
	    	  document.querySelector('.btn-go').addEventListener('click', function () {
	    		const username = document.querySelector('.kick-input').value.trim(); // Get the entered username
	    		if (username === '') {
	    		  alert('Please enter a username to kick!');
	    		  return;
	    		}
          // check if username is in the list of players and is not the owner
          const players = playersList.querySelectorAll('li.player');
          const localUsername = localStorage.getItem('username');
          const isKicked = false;
          
          for (let i = 0; i < players.length; i++) {
              const player = players[i];
              const playerNameElement = player.querySelector('.player-name');

              if (playerNameElement && playerNameElement.textContent === username) {
                  console.log('Player found:', username);

                  if (username) {
                      const message = {
                          action: 'kick_player',
                          player: username,
                      };
                      component.webSocketInstance.socket.send(JSON.stringify(message));
                      alert(`User "${username}" has been kicked from the tournament.`);
                      isKicked = true;
                      break;
                  }
              }

          }
          if (!isKicked) {
            if (username === localUsername) {
              alert('You cannot kick yourself from the tournament.');
            } else {
              alert('Please enter a valid username.');
            }
          }
	    		document.querySelector('.kick-input').value = ''; // Clear the input
	    		document.querySelector('.kick-user-input').style.display = 'none'; // Hide the input field
	    	  });
	    }
      // click on exit button
      if (exitButton) {
      exitButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to leave the tournament?')) {
          const message = { action: 'leave_tournament' };
          component.webSocketInstance.socket.send(JSON.stringify(message));
        }
      });
      }

    if (startBtn) {
      component.addListener(startBtn, 'click', () => {
        try {
          console.log('startBtn button found!');
          const message = { action: 'start_tournament' };
          if (component.webSocketInstance?.socket) {
            component.webSocketInstance.socket.send(JSON.stringify(message));
          }
        } catch (error) {
          console.error('Error starting tournament:', error);
        }
      });
    }

    // Update only this part in the setupEventListeners function
	if (inviteFriends) {
    const leftHideTimeout = { current: null };
		component.addListener(inviteFriends, 'click', () => {
		  if (window.leftHideTimeout?.current) {
			clearTimeout(window.leftHideTimeout.current);
		  }
		  window.showSidebar(component, 'left-sidebar-component', 'sidebar-container', leftHideTimeout, 1);
		});
  }
  
    if (deleteButton) {
      component.addListener(deleteButton, 'click', async () => {
        if (confirm('Are you sure you want to delete this tournament?')) {
          const ownerId = data.created_by.toString();
          if (ownerId !== localStorage.getItem('id')) {
            alert('You are not the owner of this tournament.');
            return;
          }
          const message = { action: 'leave_tournament' };
          component.webSocketInstance.socket.send(JSON.stringify(message));
        }
      });
    }


  }

  try {
    const data = await fetchTournamentData();
    updateTournamentUI(data);
    component.webSocketInstance = await initializeWebSocket(data);
    setupEventListeners(data);
  } catch (error) {
    component.disconnectedCallback();
    window.history.pushState({}, '', `/game`);
    window.loadComponent2('game', document.querySelector('.container'));
  }
}

