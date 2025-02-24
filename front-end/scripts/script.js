const routes = {
    "/": "sign-component",
    "/chat": "chat-component",
    "/settings": "settings-component",
	"/profile": "profile-component",
	"/game": "game-component",
	"/profiles": "profiles-component",
	"/tournament": "tournament-component",
	"/tournament-map": "tournament-map-component",
	"/2fa": "twofa-component",
	"/aa": "find-match-component",
	"/notify": "notify-component"
};

// Check authentication before accessing /game
function isAuthenticated() {
    const accessToken = localStorage.getItem('accessToken');
    // Add further checks if needed, e.g., verify token expiry
    return accessToken !== null;
}

function router() {
    // const path = window.location.pathname; // Get current path
    // const componentName = routes[path] || "notfound-component"; // Default to "notfound-component"
	
	// // Check if the path matches the route pattern
	// 	const appContainer = document.querySelector(".container");
	// 	if (componentName == "notfound-component") {
	// 		// Create a "notfound-component" to show when the route is not found
	// 		const notFoundComponent = document.createElement("div");
	// 		notFoundComponent.innerHTML = "<h1>404 - Page Not Found</h1><p>The page you're looking for does not exist.</p>";
	// 		appContainer.textContent = "";
	// 		appContainer.appendChild(notFoundComponent); // Append the "not found" component to the container
	// 		return; // Stop the function execution here
	// 	}
	// 	//appContainer.innerHTML = ""; // Clear previous content
	
	// 	// const componentElement = document.createElement(componentName); // Create new component element
	// 	//appContainer.appendChild(componentElement);
		
	// 	if (componentName == "sign-component")
	// 	{
	// 		console.log('sss');
	// 		window.loadComponent2("sign-in", appContainer);
	// 	}
	// 	else if (componentName == "game-component")
	// 	{
	// 		console.log('sss');
	// 		window.loadComponent2("game", appContainer);
	// 	}
	// 	else if (componentName == "settings-component")
	// 	{
	// 		console.log("setting");
	// 		window.loadComponent2("settings", appContainer);
	
	// 	}
	// 	else if (componentName == "chat-component")
	// 	{
	// 		console.log('sss');
	// 		window.loadComponent2("chat", appContainer);
	// 	}
	// 	else if (componentName == "profile-component")
	// 	{
	// 		console.log('sss');
	// 		window.loadComponent2("profile", appContainer);
	// 	}
	// 	else if (componentName == "empty-profile-component")
	// 	{
	// 		console.log('sss');
	// 		window.loadComponent2("empty-profile", appContainer);
	// 	}
	// 	else if (componentName == "tournament-component")
	// 	{
	// 		console.log('tornou');
	// 		window.loadComponent2("tournament", appContainer);
	// 	}
	// 	else if (componentName == "tournament-map-component")
	// 	{
	// 		console.log('sss');
	// 		window.loadComponent2("tournament-map", appContainer);
	// 	}
	
	// 	else if (componentName == "twofa-component")
	// 	{
	// 		console.log('bb');
	// 		window.loadComponent2("2fa", appContainer);
	// 	}
	
	// 	else if (componentName == "find-match-component")
	// 	{
	// 		console.log('bb');
	// 		window.loadComponent2("find-match", appContainer);
	// 	}
	// 	else if ( componentName === "game-component-play" ) {
	// 		console.log( "test is correct ")
	// 	}



	const savedState = JSON.parse(localStorage.getItem('appState')) || { activeLink: "game", route: "/game" };
	console.log("from script ", savedState.activeLink);
    // Get the route from localStorage or fallback to "/"
    const path = window.location.pathname || savedState.route;
    const componentName = routes[path] || "notfound-component"; // Default to "notfound-component"

    const appContainer = document.querySelector(".container");

    // Handle 404 if no matching route
    if (componentName === "notfound-component") {
        const notFoundComponent = document.createElement("page-notfound-component");
        // notFoundComponent.innerHTML = "<h1>404 - Page Not Found</h1><p>The page you're looking for does not exist.</p>";
        // appContainer.textContent = "";
        appContainer.appendChild(notFoundComponent);
        return;
    }
	if (componentName == "sign-component" && isAuthenticated())
	{
		console.log("ee: ", savedState.activeLink);
		window.history.pushState({}, '', `/${savedState.activeLink}`);
		window.loadComponent2(savedState.activeLink, appContainer);
		return;
	}
	if (componentName == "sign-component" || !isAuthenticated())
	{
		if (componentName == "twofa-component")
		{
			window.history.pushState({}, '', `/2fa`);
			console.log('rca');
			window.loadComponent2("2fa", appContainer);
			return;
		}
		if (!isAuthenticated())
			window.history.pushState({}, '', `/`);
		console.log('sss');	
		window.loadComponent2("sign-in", appContainer);
		// document.getElementById("myVideo").style.display = 'none';
		// appContainer.style.backgroundImage = "url('../assets/imgs/bg1.v1.jpg')";
		return;
	}

	// Load the component based on the route
	if (componentName == 'game-component')
	{
		setTimeout(()=> {
			window.loadComponent2(componentName.replace("-component", ""), appContainer);
		}, 500)
	}
	else
		window.loadComponent2(componentName.replace("-component", ""), appContainer);
	// Set the active link based on saved data
	if (savedState.activeLink != '2fa')
	{

		const activeLink = document.querySelector(`.navbar .links-container .links li.${savedState.activeLink} a`);
		if (activeLink) {
			document.querySelectorAll('.navbar .links-container .links li a').forEach(link => link.classList.remove('active'));
			activeLink.classList.add('active');
		}
	}
		console.log("from script");
		console.log(savedState);
		// Save the current route and active link to localStorage
		localStorage.setItem('appState', JSON.stringify({ activeLink: path.replace("/",""), route: path }));
		
	}
	const appContainer = document.querySelector(".container");
	const leftBtn1 = document.querySelector('.container .left');
	leftBtn1.style.display = 'block';
	const rightBtn = document.querySelector('.container .right');
	rightBtn.style.display = 'block';
	console.log(document.querySelector("nav-component") , " script")
	if (isAuthenticated())
	{
		console.log("test component nav bar ")
		const newComponent = document.createElement('nav-component');
		appContainer.appendChild(newComponent);
		// appContainer.style.backgroundImage = "url('../assets/imgs/bg.png')";
	}
	console.log(document.querySelector("nav-component") , " script")

function navigateTo(path) {
    history.pushState({}, "", path); // Update the browser's URL
    router(); // Rerun the router to update content
}

window.addEventListener("popstate", router); // Handle browser back/forward buttons

document.addEventListener("DOMContentLoaded", () => {
    // Attach event listener to capture link clicks and use client-side routing
    document.body.addEventListener("click", (e) => {
        if (e.target.tagName === "A" && e.target.dataset.link === "true") {
            e.preventDefault(); // Prevent default browser navigation
            navigateTo(e.target.pathname); // Use the pathname for routing
        }
    });

    router(); // Run the router on page load to display the correct component
});



// when the mouse hover on left div 


	

// Code for the Left Sidebar
const leftBtn = document.querySelector('.left');
const container = document.querySelector('.container');
const leftHideTimeout = { current: null };

if (leftBtn)
{
	leftBtn.addEventListener('mouseover', () => {
	  clearTimeout(leftHideTimeout.current); // Clear any existing timeout
	  window.showSidebar(container, 'left-sidebar-component', 'sidebar-container', leftHideTimeout, null, 500);
	});

}

if (leftBtn)
{
	leftBtn.addEventListener('mouseleave', () => {
	  window.startHideTimer(leftHideTimeout, () => {
		const sidebarComponent = container.querySelector('left-sidebar-component');
		hideSidebar(sidebarComponent, 'sidebar-container');
	  });
	});

}

window.addEventListener('load', () => {
    // document.querySelector('.container').style.backgroundImage = "url('../assets/imgs/bg.png')";
});

















// Unique ID for each tab (player)
const playerId = Math.random().toString(36).substr(2, 9);

// DOM Elements
const playersDiv = document.getElementById("player");

// Notify other tabs when a player joins
localStorage.setItem("player-joined", playerId);

// Track active players
const players = new Set();

// Listen for other players joining or leaving
window.addEventListener("storage", (event) => {
  if (event.key === "player-joined") {
    players.add(event.newValue);
    // updatePlayers();
  }
  if (event.key === "player-left") {
    players.delete(event.newValue);
    // updatePlayers();
  }
});

// Add current player to the list
players.add(playerId);
// updatePlayers();

// Notify other tabs when this tab is closed
window.addEventListener("beforeunload", () => {
  localStorage.setItem("player-left", playerId);
});

// Function to update the players display
function updatePlayers() {
//   playersDiv.innerHTML = "Players: " + Array.from(players).join(", ");
  playersDiv.innerHTML = "Plyers ID: " + playerId;
}

// // Ping Pong Game Logic
// let ball = { x: canvas.width / 2, y: canvas.height / 2, dx: 2, dy: 2, radius: 10 };

// // Game Loop
// function gameLoop() {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
  
//   // Draw Ball
//   ctx.beginPath();
//   ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
//   ctx.fillStyle = "#0095DD";
//   ctx.fill();
//   ctx.closePath();
  
//   // Ball Movement
//   ball.x += ball.dx;
//   ball.y += ball.dy;
  
//   // Ball Collision with walls
//   if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
//     ball.dx *= -1;
//   }
//   if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
//     ball.dy *= -1;
//   }

//   requestAnimationFrame(gameLoop);
// }
// gameLoop();


// document.querySelector("button.test").addEventListener('click', ()=> {
// 	console.log("ffff")
// 	const appContainer = document.querySelector(".container");
// 	// create the notification component if not exist before
// 	window.loadComponentNotify('notification', appContainer, {message:"Login failed. Please try again.", type: "info"});

// 	// // console.error('Error:', error);
// 	// window.showNotification({
// 	// 	message: "Login failed. Please try again.",
// 	// 	type: "success",
// 	// 	icon: "fa-check-circle", 
// 	// 	duration: 3000
// 	// });
// })


window.addEventListener('load', () => {
    // document.querySelector('.container').style.backgroundImage = "url('../assets/imgs/bg.png')";
});
