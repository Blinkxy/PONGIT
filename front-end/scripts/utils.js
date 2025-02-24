window.Chatsocket = null;

function loadMessageFriend(newComponent, user) {
	const invitedFriends = newComponent.querySelector('.sidebar-right .friends .nav .drop-down');
	
	invitedFriends.innerHTML = '';
	
	const list = document.createElement('li');
		
		list.classList.add('select-box');
		
		const profile = document.createElement('div');
		profile.classList.add('profile');

		const a = document.createElement('a');

		const img = document.createElement('img');
		img.src =  user.profile_image;

		list.dataset.username = user.friend_username
		list.dataset.id = user.id

		const span = document.createElement('span');
		span.classList.add('nickname');
		// console.log(user)
		span.textContent = user.friend_username;

		// append img and span to a
		a.appendChild(img);
		a.appendChild(span);
		
		// append a to profile
		profile.appendChild(a);

		const actions = document.createElement('div');
		actions.classList.add('actions');
		
		const a2 = document.createElement('a');

		const i = document.createElement('i');
		i.classList.add('fa-solid');
		i.classList.add('fa-table-tennis-paddle-ball');

		// append i to i
		a2.appendChild(i);

		// append a to actions div
		actions.appendChild(a2);

		list.appendChild(profile);
		list.appendChild(actions);

		// append li to ul
		invitedFriends.appendChild(list);
}


function loadChat(newComponent, containerName, user)
{
	// Access the HTML inside the component
	const chat = newComponent.querySelector(containerName);
	console.log(chat);
	const friend_name = newComponent.children[0].children[0].children[0];
	// const body_first_msg = newComponent.querySelector(`${containerName} .body-msg span.first-msg`);
	// body_first_msg.remove();
	// console.log(body_first_msg);
	const input1 = friend_name.parentElement.nextElementSibling.nextElementSibling;
	const input2 = friend_name.parentElement.nextElementSibling.nextElementSibling.nextElementSibling;
	friend_name.innerHTML = user;
	select_friend = newComponent.querySelector(`${containerName} .body-msg span.first-msg`);
	if (select_friend)
		select_friend.remove();
	input1.style.display = 'none';
	input2.style.display = 'block';
	input2.children[1].innerHTML = 'Messaging ' + user;
	if (!chat.classList.contains('active'))
		chat.classList.add('active');

	
};

// load chat component
window.loadComponent3 = function(container, componentName, user) {
	
	// Remove any existing component
	//const existingComponent = container.querySelector('right-sidebar-component');
	//if (componentName == 'right-sidebar')
	// console.log("curva", existingComponent)
	// if (existingComponent) {
	// 	existingComponent.remove();
	// }

	// const existingComponent = container.querySelector('game-component, sign-component, settings-component, match-history-component, profile-component, empty-profile-component');
	
	
	const existingComponent = container.querySelector(`game-component, sign-component, settings-component, match-history-component, profile-component, 
                                                        profiles-component, players-rank-component, 
                                                                twofa-Component, find-match-component, game-component-play, versus-component, notify-component`);
	
	
	// if (existingComponent && componentName != "match-history" && componentName != "players-ranking" && componentName != 'game-component-play' && componentName != 'versus-component' ) {
	// 	existingComponent.remove();
	// }
	
	console.log(existingComponent);
	if (existingComponent && componentName != "match-history" ) {
		// console.log("yes");
		existingComponent.remove();
	}
	
	console.log(existingComponent);
	// if (existingComponent && componentName != "match-history" ) {
	// 	// console.log("yes");
	// 	existingComponent.remove();
	// }

	const chatComponent = container.querySelector('chat-component');
	if (chatComponent && componentName != 'right-sidebar')
	{
		chatComponent.remove();
	}
	const rightComponent = container.querySelector('right-sidebar-component');
	if (rightComponent && componentName != 'chat')
	{
		rightComponent.remove();
	}
  
	// Create a new component based on the componentName
	let newComponent;
	let containerName;
	switch (componentName) {
		case 'chat':
			containerName = ".chat-container";
			// if (!existingComponent)
			newComponent = document.createElement('chat-component');
			// else
			// {
			// 	newComponent = document.getElementsByTagName('chat-component')[0];
			// 	loadChat(newComponent, containerName, user.friend_username);
			// }
			break;
		case 'right-sidebar':
			// if (!existingComponent)

			// if (newComponent)
			// 	newComponent.remove();
			// newComponent = document.createElement('right-sidebar-component');
			const leftBtn = document.querySelector('.left');
			const container = document.querySelector('.container');
			const leftHideTimeout = { current: null };
			clearTimeout(leftHideTimeout.current); // Clear any existing timeout
			window.showSidebar(container, 'right-sidebar-component', 'sidebar-right', leftHideTimeout, null, 5000);
			
			if (leftBtn)
			{
				leftBtn.addEventListener('mouseover', () => {
				});
				
			}
			newComponent = document.getElementsByTagName('right-sidebar-component')[0];
				// return;
				// else
		// {
		// 	// loadMessageFriend(newComponent, user.friend_username);
		// }
			containerName = "message-friend";
		console.log("test", newComponent)
			break;
		case 'profile':
			containerName = ".profile-container";
			newComponent = document.createElement('profile-component');
			break;
		default:
		// return;
	}	
  
	//Append the new component to the container

	if (newComponent)
	container.appendChild(newComponent);
	newComponent.addEventListener('content-loaded', () => {
		if (containerName == ".chat-container")
			loadChat(newComponent, containerName, user);
		else if (containerName == "message-friend")
		{
			const chat = newComponent.querySelector('.sidebar-right');
			chat.classList.add('hover');
			loadMessageFriend(newComponent, user);
		}
		else if (containerName == ".profile-container")
		{
			changeDataForProfile(newComponent, user);
		}
		const chat = newComponent.querySelector(containerName);
			if (chat)
			chat.classList.add('active');
	})
  };
  function fetchMatchHistory(userId, userProfileImage) {
    // Fetch last 2 matches
    fetch(`/api/playerHistory/${userId}/last2matches/`, { 
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
		'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        const resultsContainer = document.querySelector('.results');
        resultsContainer.innerHTML = '';

        if (data.length === 0) {
            resultsContainer.innerHTML = '<li>No matches found yet</li>';
            return;
        }

        data.forEach(match => {
            const matchDate = new Date(match.date);
            const formattedDate = matchDate
            const matchHtml = `
                <li class="match ${match.result.toLowerCase()}">
                    <span class="date">${formattedDate}</span>
                    <span class="result">
                        <span class="profile1 profile">
                            <img src="${userProfileImage || '../assets/imgs/sidebar/ghost.jpeg'}" alt="Profile">
                        </span>
                        <span class="score">${match.playerScore} : ${match.opponentScore}</span>
                        <span class="profile2 profile">
                            <img src="${match.opponent_image ?  match.opponent_image : '../assets/imgs/sidebar/ghost.jpeg'}" alt="Profile">
                        </span>
                    </span>
                    <span class="status">${match.result}</span>
                </li>
            `;
            
            resultsContainer.innerHTML += matchHtml;
        });
    })
    .catch(error => {
        console.error('Error:', error);
        const resultsContainer = document.querySelector('.results');
        resultsContainer.innerHTML = '<li>Failed to load match data</li>';
    });

    // Fetch last win
    fetch(`/api/playerHistory/${userId}/lastwin/`, { 
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        return response.json();
    })
    .then(match => {
        console.log(match);
        const resultsContainer = document.querySelector('.result-last-win');
        
        if (match.playerScore === 0 && match.opponentScore === 0) {
            resultsContainer.innerHTML = '<li>No wins found yet</li>';
            return;
        }

        const matchDate = new Date(match.date);
        const formattedDate = matchDate

        const matchHtml = `
            <li class="match win">
                <span class="date">${formattedDate}</span>
                <span class="result">
                    <span class="profile1 profile">
                        <img src="${userProfileImage || '../assets/imgs/sidebar/ghost.jpeg'}" alt="Profile">
                    </span>
                    <span class="score">${match.playerScore} : ${match.opponentScore}</span>
                    <span class="profile2 profile">
                        <img src="${match.opponent_image ?  match.opponent_image : '../assets/imgs/sidebar/ghost.jpeg'}" alt="Profile">
                    </span>
                </span>
                <span class="status">Win</span>
            </li>
        `;
        
        resultsContainer.innerHTML = matchHtml;
    })
    .catch(error => {
        console.error('Error:', error);
        const resultsContainer = document.querySelector('.result-last-win');
        resultsContainer.innerHTML = '<li>Failed to load match data</li>';
    });
}







  function changeDataForProfile(component, user) {
	console.log("user", user.joined_at);	
	const dateJoinedElement = document.getElementById('date-joined');
     if (dateJoinedElement && user.joined_at) {
         dateJoinedElement.textContent = user.joined_at;
     }
    if (!component || !user || !user.id) {
        console.error('Invalid component or user data');
        return;
    }

    try {
        localStorage.setItem('friend_id', user.id);
        localStorage.setItem('friend_image', user.profile_image || '');
    } catch (error) {
        console.error('Error setting localStorage:', error);
    }

    const circle = component.querySelector('.progress-bar');
    const name = component.querySelector("#username");
    const profileImageElement = component.querySelector('#profile_image');

    if (!circle || !name) {
        console.error('Required DOM elements not found');
        return;
    }

    // Setup circle progress
    const radius = circle.getAttribute('r');
    const circumference = 2 * Math.PI * radius;
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = circumference;

    function setProgress(percent) {
        if (typeof percent !== 'number' || percent < 0 || percent > 100) return;
        const offset = circumference - (percent / 100 * circumference);
        circle.style.strokeDashoffset = offset;
    }

    // Update basic user info
    name.textContent = user.friend_username || 'Unknown User';
    if (profileImageElement && user.profile_image) {
        profileImageElement.src = user.profile_image;
        profileImageElement.alt = `${user.friend_username}'s profile picture`;
    }

    // Create headers object once
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
    };

    
    function fetchData(endpoint) {
        return fetch(`/api/playerHistory/${user.id}/${endpoint}`, {
            method: 'GET',
            headers
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
    }

    function updateElement(id, value, suffix = '') {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = `${value}${suffix}`;
        }
    }

    Promise.all([
        fetchData(''),
        fetchData('stats/'),
        fetchData('my_rank/'),
        fetchData('top-ranks/')
    ])
    .then(([matchHistory, stats, rankData, topRanks]) => {
		fetchMatchHistory(user.id, user.profile_image ? user.profile_image : null);
        // Update match history
        if (matchHistory) {
            // Store match history data if needed
            window.matchHistory = matchHistory;
        }

        // Update stats
        if (stats) {
            updateElement('total-losses', stats.losses);
            updateElement('total-wins', stats.wins);
            updateElement('total-rate', stats.total_games, ' MT');
            updateElement('win-rate', stats.win_rate, '%');
            updateElement('total-set', stats.total_games);
			if (stats.wins >= 0) {
				updateElement('achivement-set', '--');
			}
			if (stats.wins >= 1) {
				updateElement('achivement-set', 'Novice 🎯');
			}
			if (stats.wins >= 3) {
				updateElement('achivement-set', 'Beginner ⭐');
			}
			if (stats.wins >= 20) {
				updateElement('achivement-set', 'Intermediate 🌟');
			}
			if (stats.wins >= 30) {
				updateElement('achivement-set', 'Advanced 🎖️');
			}
			if (stats.wins >= 40) {
				updateElement('achivement-set', 'Expert 🏆');
			}
			if (stats.wins >= 50) {
				updateElement('achivement-set', 'Master 🚀');
			}

            setProgress(stats.win_rate);
        }

        if (rankData) {
            updateElement('rank-set', rankData.rank);
        }

        if (topRanks && Array.isArray(topRanks)) {
            const classementList = component.querySelector('.classement');
            if (classementList) {
                classementList.innerHTML = ''; // Clear existing items
                const currentUserId = parseInt(user.id);

                topRanks.forEach(player => {
                    const listItem = document.createElement('li');
                    listItem.className = 'player';
                    
                    if (player.user_id === currentUserId) {
                        listItem.classList.add('you');
                    }

                    // Create and append rank number
                    const rankSpan = document.createElement('span');
                    rankSpan.className = 'num';
                    rankSpan.textContent = player.rank;
                    
                    // Create and append username
                    const nameSpan = document.createElement('span');
                    nameSpan.className = 'name';
                    nameSpan.textContent = player.username;

                    listItem.appendChild(rankSpan);
                    listItem.appendChild(nameSpan);

                    // Add "you" indicator if current user
                    if (player.user_id === currentUserId) {
                        const youSpan = document.createElement('span');
                        youSpan.className = 'you';
                        youSpan.textContent = '(you)';
                        listItem.appendChild(youSpan);
                    }
                    
                    classementList.appendChild(listItem);
                });
            }
        }
    })
    .catch(error => {
        console.error('Error fetching profile data:', error);
        const errorMessage = error.message || 'Failed to load profile data';
    });
}

  function listeningForAction(newComponent, containerName, input, option) {
		
	if (containerName == ".add-friend-container")
		buildInviteList(input.value);
	else
	{
		const list = document.querySelector("li.select-box .profile a.active");
		if (option == 1)
			buildChannelsList(input.value);
		else if (option == 2)
		{
			console.log(list.children[1]);
			list.children[1].innerHTML = input.value;
		}
		else if (option == 3)
		{
			if (input.value == list.children[1].textContent)
				list.parentElement.parentElement.remove();
			else
			{
				alert("unmatch");
				return;
			}
		}
	}
	newComponent.remove();
}

function getFriends() {
	const friends = document.querySelectorAll('.sidebar .friends .drop-down.my-friends li.select-box .profile a span');
	friends.forEach(li => {
		window.buildMemberList(li.textContent);
		// console.log(li.textContent);
	})
}

function changeOption(newComponent, containerName, option) {
	const options = newComponent.querySelectorAll(`${containerName} .option`);
	options.forEach((opt, i) => {
		console.log(i);
		opt.style.display = 'none';
		if (i == option)
		{
			opt.style.display = 'block';
			if (containerName == ".add-friend-container" && option == 1)
			{
				getFriends();
			}
		}
	})
}

window.loadComponent = function(container, componentName) {
	// Remove any existing component
	const existingComponent = container.querySelector('add-friend-component, add-channel-component');
	
	if (existingComponent) {
	  existingComponent.remove();
	//return;
	}
  
	// Create a new component based on the componentName
	let newComponent;
	let containerName;
	switch (componentName) {
		case 'add-friend':
			// if (!existingComponent)
				newComponent = document.createElement('add-friend-component');
				// console.log(newComponent);
				containerName = ".add-friend-container";
				// else
			// newComponent = document.getElementsByTagName('add-friend-component')[0];
				break;
		case 'add-channel':
			// if (!existingComponent)
				newComponent = document.createElement('add-channel-component');
				console.log(newComponent);
				containerName = ".add-channel-container";
				// else
			// newComponent = document.getElementsByTagName('add-friend-component')[0];
				break;
		default:
		return;
	}
  
	// Append the new component to the container
	if (!existingComponent)
	{
		
	}
	container.appendChild(newComponent);
	newComponent.addEventListener('content-loaded', () => {
		
	})
  };

  // Function to load the specified component
  window.loadComponent2 = function(componentName, container, round_url, data) {
    
    // pass data to function initializeChatComponent(component, data)
    
    // Remove any existing component
    // const existingComponent = container.querySelector('game-component, sign-component, chat-component, settings-component, match-history-component');
    const existingComponents = container.querySelectorAll(`game-component, sign-component, chat-component, settings-component, match-history-component, profile-component, 
                                                        profiles-component, players-rank-component, tournament-component, tournament-map-component, 
                                                                twofa-Component, find-match-component, game-component-play, versus-component, notify-component, game-component-locale`);
    
    console.log( "ERROR IN LOAD COPONONENT 'tournament-map-component1'")
                                                                // Loop through each component using forEach
    existingComponents.forEach(component => {
        console.log(component); // Perform actions on each component
        if (componentName != "match-history" && componentName != "players-ranking")
        {
            if (!(componentName == "game" && component == "game-component") && componentName != 'versus-component' && componentName != 'game-component-play')
            {
                    console.log(componentName)
                    component.remove(); // Example: Remove the component
                    console.log( "ERROR IN LOAD COPONONENT 'tournament-map-component2'")
            }
        }
    });

	// if (existingComponent && componentName != "match-history" && componentName != "players-ranking" && componentName != 'game-component-play' && componentName != 'versus-component' ) {
	// 	existingComponent.remove();
	// }

	// if (existingComponent)
	
	// Create a new component based on the componentName
	let newComponent;
	let containerName;
	switch (componentName) {
		case 'match-history':
			containerName = ".match-history-container";
			newComponent = document.createElement('match-history-component');
			break;
		case 'players-ranking':
			containerName = ".players-container";
			newComponent = document.createElement('players-rank-component');
			break;
		case 'sign-in':
			containerName = ".sign-container";
			newComponent = document.createElement('sign-component');
			break;
	    case 'game':
			// if (!existingComponent)
			const existGame = document.querySelector('game-component');
			if (!existGame)
				newComponent = document.createElement('game-component');
			containerName = ".game-container";
			break;
		case 'game2':
			newComponent = document.createElement('game-component');
			containerName = ".tournament";
			break;
		case 'settings':
			newComponent = document.createElement('settings-component');
			containerName = ".settings-container";
			break;
		case 'chat':
			newComponent = document.createElement('chat-component');
			containerName = ".chat-container";
			break;
		case 'profile':
			containerName = ".profile-container";
			newComponent = document.createElement('profile-component');
			break;
		case 'profiles':
			containerName = ".empty-profile-container";
			newComponent = document.createElement('profiles-component');
			break;
		case 'tournament':
			containerName = ".tournament-container";
			newComponent = document.createElement('tournament-component');
			break;
		case 'tournament-map':
			containerName = ".tournament-map-container";
			newComponent = document.createElement('tournament-map-component');
			newComponent.setAttribute('round-url', round_url);
			break;
		case '2fa':
			containerName = ".twofa-container";
			newComponent = document.createElement('twofa-component');
			break;
		case 'find-match':
			containerName = ".find-match-container";
			newComponent = document.createElement('find-match-component');
			break;
		case 'game-component-play':
			console.log("gameplay ...");
			containerName = ".allElement";
			newComponent = document.createElement('game-component-play');
			break;
		case 'versus-component':
			containerName = '.versus-container'
			newComponent = document.createElement('versus-component')
			break;
		case 'notify':
			containerName = ".notifications-container";
			// const exist = document.querySelector('notify-component');
			// if (!exist)
				newComponent = document.createElement('notify-component');
			// else
			// 	newComponent = document.getElementsByTagName('notify-component')[0];	
			break;
		case 'game-component-locale':
			containerName = ".allElementLocale"
			console.log("test loaded game locale")
			newComponent = document.createElement('game-component-locale');
			break;
		default:
			return;
	}
	// If newComponent is defined, append it to the container
    if (newComponent) {
		container.appendChild(newComponent);
	}
	if ( newComponent ) {
		newComponent.addEventListener('content-loaded', () => {
			console.log("test loaded game locale")
			console.log("here test new component " , componentName);
			// Access the HTML inside the component
			//console.log(containerName);
			if (containerName == ".tournament")
			{
				// hide the game and show the tournament interface
				const game = newComponent.querySelector('.game-container');
				game.style.display = 'none';
				const tournament = newComponent.querySelector('.tournament');
				tournament.style.display = 'block';
			}
			if (containerName == '.tournament-container')
			{
				const tournament =  newComponent.querySelector(containerName);
				
				//const tname = document.querySelector('.tournament-container .tournament-name .name');
				// tname.textContent = data.name;
			}
			if (componentName == "game")
			{
				window.initializeGameComponent(newComponent);
			}
			const chat = newComponent.querySelector(containerName);
			if (chat)
			chat.classList.add('active');
			// console.log(sidebar); // This will log the <div class="sidebar"> element
		})
		 // Call initializeChatComponent for the new component
		//  window.initializeChatComponent(newComponent);
	}
	else {
		console.log("no new component");
	}
}

// build an invited list
function buildInviteList(nickname)
{
  const invitedFriends = document.querySelector('.sidebar .friends .nav .drop-down.invited');
	
  const list = document.createElement('li');
  list.classList.add('select-box');
  list.classList.add('close');

  list.innerHTML = 
  `
	<div class="profile">
		<a>
			<img src="../assets/imgs/sidebar/profile.jpg">
			<span class="nickname">${nickname}</span>
		</a>
	</div>
	<div class="actions">
		<a><i class="fa-solid fa-trash"></i></a>
	</div>
  `;
  
  // append li to ul
  invitedFriends.appendChild(list);
  // console.log(invitedFriends);
}


window.loadComponentNotify = function(componentName, container, data) {
	
	// pass data to function initializeChatComponent(component, data)

	// Remove any existing component
	// const existingComponent = container.querySelector('game-component, sign-component, chat-component, settings-component, match-history-component');
	const existingComponent = container.querySelector('notification-component');
	
	// if (existingComponent && componentName != "match-history" && componentName != "players-ranking" && componentName != 'find-match') {
	// 		existingComponent.remove();
	// }
	
	// Create a new component based on the componentName
	let newComponent;
	let containerName;
	switch (componentName) {
		case 'notification':
			containerName = ".notification-container";
			if (!existingComponent)
				newComponent = document.createElement('notification-component');
			else
			{
				newComponent = document.getElementsByTagName('notification-component')[0];
				window.showNotification({
					message: data.message,
					type: data.type,
					icon: "fa-check-circle", 
					duration: 3000
				});
			}
				break;
		default:
			return;
	}
  
	// If newComponent is defined, append it to the container
    if (!existingComponent) {
		container.appendChild(newComponent);
	}
	newComponent.addEventListener('content-loaded', () => {
		// Access the HTML inside the component
		const chat = newComponent.querySelector(containerName);
		chat.classList.add('active');
		// console.log(sidebar); // This will log the <div class="sidebar"> element
		window.showNotification({
			message: data.message,
			type: data.type,
			icon: "fa-check-circle", 
			duration: 3000
		});
		// console.error('Error:', error);
	// window.showNotification({
	// 	message: "Login failed. Please try again.",
	// 	type: "success", 
	// 	icon: "fa-check-circle", 
	// 	duration: 3000
	// });
	
	
	})
  };