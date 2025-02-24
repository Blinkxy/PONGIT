
import { initializeSockets } from "./notification.js";
import { getWebsocket, closeWebsocket , tokenNotify } from "../components/matchMaking.js"

// import { initializeSockets } from "./notification.js";
// export async function initializeSidebarComponent(component) {

// 	initializeSockets();

// 	const links = document.querySelectorAll('.navbar .links-container .links li a');
// 	const container = document.querySelector('.container');
	

// 	// Load the active link from localStorage and apply the active class
// 	// const activeLinkFromStorage = localStorage.getItem('activeLink');
// 	// if (activeLinkFromStorage) 
// 	// {
// 	// 	const activeLink = document.querySelector(`.navbar .links-container .links li.${activeLinkFromStorage} a`);
// 	// 	if (activeLink) {
// 	// 		activeLink.classList.add('active');
			
// 	// 		const activeLinkName = activeLink.parentElement.classList[0];
// 	// 		// console.log("ee");
// 	// 		// console.log(activeLinkName);
// 	// 		window.loadComponent2(activeLinkName, container);
// 	// 	}
// 	// 	console.log("active link: ", activeLink);
// 	// }
// 	// else 
// 	// {
// 	// 	const gameLink = document.querySelector('.navbar .links-container .links li.game a');
// 	// 	gameLink.classList.add('active');
// 	// 	localStorage.setItem('activeLink', gameLink.parentElement.classList[0]);
// 	// 	window.loadComponent2('game', container);
// 	// }

// 	// when click on link
// 	links.forEach(element => {
// 		element.addEventListener('click', (event) => {
			
// 			// Prevent the default link behavior
// 			event.preventDefault(); 
	
// 			console.log("element: " + element);
// 			const active = document.querySelector('.navbar .links-container a.active');
// 			// console.log(element);
// 			// if (element.classList.contains('active'))
// 			// 	element.classList.remove('active');
// 			active.classList.remove('active');
// 			element.classList.add('active');
			
// 			// Save the active link's class in localStorage
//             localStorage.setItem('activeLink', element.parentElement.classList[0]);
	
// 			// Check if the clicked link is the "Game" link
// 			if (element.parentElement.getAttribute('class') === 'game') {
// 				console.log('Game component will be added');
// 				console.log("hello from game");
// 				// Change the URL to /game without reloading the page
// 				history.pushState({ page: 'game' }, 'Game', '/game');
	
// 				// Load the game component
// 				window.loadComponent2('game', container);
// 			  }
// 			  else if (element.parentElement.getAttribute('class') === 'chat') {
// 				// Check if the clicked link is the "Game" link  
// 				console.log('Chat component will be added');
				  
// 				  // Change the URL to /game without reloading the page
// 				history.pushState({ page: 'chat' }, 'Chat', '/chat');
	  
// 				  // Load the game component
// 				 window.loadComponent2('chat', container);
// 				}
// 				else if (element.parentElement.getAttribute('class') === 'settings') {
// 					// Check if the clicked link is the "Game" link  
// 					console.log('Settings component will be added');
					  
// 					  // Change the URL to /game without reloading the page
// 					history.pushState({ page: 'settings' }, 'Settings', '/settings');
		  
// 					  // Load the game component
// 					 window.loadComponent2('settings', container);
// 				}
// 				else if (element.parentElement.getAttribute('class') === 'profile') {
// 					// Check if the clicked link is the "Game" link  
// 					console.log('Profile component will be added');
						
// 						// Change the URL to /game without reloading the page
// 					history.pushState({ page: 'profile' }, 'Profile', '/profile');
			
// 						// Load the game component
// 						window.loadComponent2('profile', container);
// 				}
// 				else if (element.parentElement.getAttribute('class') === 'profiles') {
// 					// Check if the clicked link is the "Game" link  
// 					console.log('Profile component will be added');
						
// 						// Change the URL to /profile-friend without reloading the page
// 					history.pushState({ page: 'profiles' }, 'Profiles', '/profiles');
			
// 						// Load the game component
// 						window.loadComponent2('empty-profile', container);
// 				}

// 				else if (element.parentElement.getAttribute('class') === 'notify') {
// 					// Check if the clicked link is the "Game" link  
// 					console.log('notify component will be added');
						
// 						// Change the URL to /profile-friend without reloading the page
// 					history.pushState({ page: 'notify' }, 'Notification', '/notify');
			
// 						// Load the game component
// 						window.loadComponent2('notify', container);
// 				}
// 		})
// 	});
	
// 	//   // Listen for popstate events to handle back/forward navigation
// 	// window.addEventListener('popstate', (event) => {
// 	// 	const componentName = event.state ? event.state.page : null;
// 	// 	if (componentName) {
// 	// 	  loadComponent(componentName);
// 	// 	}
// 	//   });
	
	
// 	// Handle browser back/forward navigation
// 	window.addEventListener('popstate', (event) => {
// 		const componentName = event.state ? event.state.page : 'home'; // Default to home if no state
// 		console.log(`Navigating to: ${componentName}`);
// 		window.loadComponent2(componentName, container); // Load the appropriate component
// 	});

// }




export async function initializeSidebarComponent(component)
{
    initializeSockets();
    if ( tokenNotify.notifyToken == null ) console.log(" token is not fond ")
    tokenNotify.notifyToken    =   localStorage.getItem("accessToken");
    console.log( tokenNotify.notifyToken )
    let URL      =   `wss://10.11.4.4:443/ws/notification/?token=${tokenNotify.notifyToken}`
    const socket =    getWebsocket(URL)
    socket.addEventListener("message" , ( event )=> {
        	const messageData = JSON.parse(event.data);
        	console.log( messageData )
            const appContainer = document.querySelector(".container");
        	window.loadComponentNotify('notification', appContainer, {message: messageData.message, type: "success"});
        })
    socket.onopen = () => console.log(`WebSocket connected to notifactions test is correct `);
    if (window.Chatsocket)
    {
        window.Chatsocket.close();
        window.Chatsocket = null;
    }
    window.Chatsocket = null;
    const links = document.querySelectorAll('.navbar .links-container .links li a');
    const container = document.querySelector('.container');
    
    // Load the active link from localStorage and apply the active class
    const savedState = JSON.parse(localStorage.getItem('appState')) || { activeLink: "game", route: "/game" };
    if (savedState.activeLink != "2fa")
	{
		const activeLink = document.querySelector(`.navbar .links-container .links li.${savedState.activeLink} a`);
		if (activeLink) {
			activeLink.classList.add('active');
		}

	}

    // when click on link
    links.forEach(element => {
        element.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent the default link behavior

            const active = document.querySelector('.navbar .links-container a.active');
            if (active) {
                active.classList.remove('active');
            }
            element.classList.add('active');

            // Save the active link's class and the current route in localStorage
            const route = element.parentElement.classList[0]; // Use the link class for the route
			localStorage.setItem('appState', JSON.stringify({ activeLink: route, route: `/${route}` }));

            // Change the URL and load the correct component
            history.pushState({ page: route }, route, `/${route}`);
			console.log('from nav');
			console.log(route);
            if (route != 'chat') {
                if (window.Chatsocket !== null && window.Chatsocket  !== WebSocket.CLOSED)
                {
                    console.log("Closing chat socket from nav.js");
                    window.Chatsocket.close();
                    window.Chatsocket = null;
                }
            }
			console.log('route:',route);
			if (route == 'game')
			{
                console.log("from nav" , window.location.href, document.querySelector("game-component"))
                if ( document.querySelector("game-component") == null ) {
                    console.log("test load component 2")
                    setTimeout(()=> {
                        window.loadComponent2(route, container);
                    }, 200)
                }
			}
			else
            	window.loadComponent2(route, container);  // Load the corresponding component
        });
    });

    // Handle browser back/forward navigation
    window.addEventListener('popstate', (event) => {
        const route = event.state ? event.state.page : 'home';
        const appContainer = document.querySelector('.container');
        window.loadComponent2(route, appContainer); // Load the appropriate component
    });
}


// import { initializeSockets } from "./notification.js";

// export async function initializeSidebarComponent(component) {
//     initializeSockets();

//     const links = document.querySelectorAll('.navbar .links-container .links li a');
//     const container = document.querySelector('.container');

//     // Load the saved state from localStorage
//     const savedState = JSON.parse(localStorage.getItem('appState')) || { activeLink: "game", route: "/" };
    
//     // Apply the active class to the correct link based on saved state
//     const activeLink = document.querySelector(`.navbar .links-container .links li.${savedState.activeLink} a`);
//     if (activeLink) {
//         activeLink.classList.add('active');
//     }

//     // When a link is clicked
//     links.forEach(element => {
//         element.addEventListener('click', (event) => {
//             event.preventDefault(); // Prevent the default link behavior

//             // Remove the active class from any currently active link
//             const active = document.querySelector('.navbar .links-container a.active');
//             if (active) {
//                 active.classList.remove('active');
//             }
//             // Add the active class to the clicked link
//             element.classList.add('active');

//             // Get the route (class of the parent <li>)
//             const route = element.parentElement.classList[0]; // 'game', 'chat', etc.
            
//             // Save the active link class and the route in localStorage
//             localStorage.setItem('appState', JSON.stringify({ activeLink: route, route: `/${route}` }));

//             // Change the URL and load the corresponding component
//             history.pushState({ page: route }, route, `/${route}`);
//             window.loadComponent2(route, container);  // Load the corresponding component
//         });
//     });

//     // Handle browser back/forward navigation
//     window.addEventListener('popstate', (event) => {
//         const route = event.state ? event.state.page : 'home';
//         const appContainer = document.querySelector('.container');
//         window.loadComponent2(route, appContainer); // Load the appropriate component
//     });
// }

