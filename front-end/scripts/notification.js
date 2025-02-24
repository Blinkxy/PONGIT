export let TournamentNotifSocket = null;

(function initializeSidebarComponent(component) {
	
	function showNotification({ message, type = 'info', icon = 'fa-info-circle', duration = 4000 }) {
		console.log('\nshowNotification\n');
		var audio = new Audio('../assets/notif.mp3');
		
		const container = document.getElementById('notification-container');
		
		// Create notification element
		const notification = document.createElement('div');
		notification.className = `notification ${type}`;
		
		// Add icon
		const iconElement = document.createElement('i');
		iconElement.className = `fas ${icon}`;
		
		// Add text
		const textElement = document.createElement('span');
		textElement.textContent = message;
		
		
		// Add close button
		const closeButton = document.createElement('i');
		closeButton.className = 'fas fa-times close-button';
		closeButton.onclick = () => removeNotification(notification);
		
		// Add progress bar
		const progressBar = document.createElement('div');
		progressBar.className = 'progress-bar';
		progressBar.style.animationDuration = `${duration}ms`;
		
		// Assemble notification
		notification.appendChild(iconElement);
		notification.appendChild(textElement);
		notification.appendChild(closeButton);
		notification.appendChild(progressBar);
		
		container.appendChild(notification);
		
		// Remove notification after duration
		
		// audio.play();
		setTimeout(() => removeNotification(notification), duration);
	}
	
	function removeNotification(notification) {
		notification.classList.add('slide-out');
		setTimeout(() => {
			if (notification.parentElement) {
				notification.parentElement.removeChild(notification);
			}
		}, 500);
	}
	
	// Expose showNotification globally
	window.showNotification = showNotification;
	
	// import the tournament notification socket to handle the on message event
	// const { TournamentNotifSocket } = initializeSockets();
	// TournamentNotifSocket.onmessage = (event) => {
		// 	const data = JSON.parse(event.data);
		// };
		
		// Expose showNotification on the component
		// component.showNotification = showNotification;
		
	})(this);
	
	// Global Socket function
	// let GameNotifSocket = null;
	// let NotifSocket = null;

	// Declare the function first
	export const notificationQueue = [];
	const notificationTour = [];
	let isProcessingQueue = false;

function processNextNotification() {
	// for (let i = 0; i < notificationQueue.length; i++) {
	// 	const info = notificationQueue[i];
	// 	// console.log('info', info);
	// }
    if (notificationTour.length > 0 && !isProcessingQueue) {
        isProcessingQueue = true;
        // const { message, type } = notificationTour.shift(); // Dequeue message
		const info = notificationTour.shift();
		if (info) {
			const appContainer = document.querySelector('.container');
			const message = info["message"];
			const type = info["type"];
			console.log('message', typeof(message));
			console.log('type', type);
			if (appContainer) {
				window.loadComponentNotify('notification', appContainer,  { message, type });
			} else {
				console.error("App container not found. Notification skipped.");
			}
		}

        // Delay for a short time before processing the next notification
        setTimeout(() => {
            isProcessingQueue = false;
            processNextNotification();
        }, 2000); // Adjust delay based on how long you want the notification to remain visible
    }
}


	export function initializeSockets() {
		const token = localStorage.getItem('accessToken');
		if (!token) {
			console.error('No token found. Cannot establish WebSocket connection.');
			return { TournamentNotifSocket }//, GameNotifSocket };
		}
		const wsUrl1 = `wss://10.11.4.4:443/ws/tournament/notifications/?token=${token}`;
		// const wsUrl2 = `wss://10.11.4.4:443/ws/game/notifications/?token=${token}`;
		// const wsUrl3 = `wss://10.11.4.4:443/ws/notification/?token=${token}`;
	
		// if (!TournamentNotifSocket) {
			if (!TournamentNotifSocket)
			{
				TournamentNotifSocket = new WebSocket(wsUrl1);
				TournamentNotifSocket.onopen = () => console.log('Tournament WebSocket open TournamentNotifSocket');
				TournamentNotifSocket.onmessage = (event) => {
					const data = JSON.parse(event.data);
					if (data.type === "send_invitation") {
					console.log('data', data);
					const message = `${data.message}`;
					const creator = `${data.tournament.creator}`;
					const type = "success";
					// Enqueue the notification
					// console.log('data', data);	
					notificationQueue.push({
						"invitation_id": data.invitation_id,
						"message": message,
						"creator": creator,
						"type": "Tournament",
					})
					notificationTour.push({
						"invitation_id": data.invitation_id,
						"message": message,
						"creator": creator,
						"type": "success",
					});
					processNextNotification(); // Start processing if not already in progress
				}
				else if (data.action === "redirect") {
					// redirect to the lobby
					window.history.pushState({}, '', "/tournament");
					window.loadComponent2('tournament', document.querySelector('.container'));

				}
				else if (data.type === undefined)
					console.log('data', data);


				}
				TournamentNotifSocket.onerror = (error) => console.error('Tournament error:', error);
				TournamentNotifSocket.onclose = () => {
					console.log('notification Tournament WebSocket closed.');
				};
		}
		// }
	
		// if (!GameNotifSocket) {
		// 	GameNotifSocket = new WebSocket(wsUrl2);
		// 	GameNotifSocket.onopen = () => console.log('Game WebSocket open');
		// 	GameNotifSocket.onmessage = (event) => console.log('Game message:', event.data);
		// 	GameNotifSocket.onerror = (error) => console.error('Game error:', error);
		// 	GameNotifSocket.onclose = () => console.log('Game WebSocket closed');
		// }
	
		// if (!NotifSocket) {
		//     GameNotifSocket = new WebSocket(wsUrl3);
		//     GameNotifSocket.onopen = () => console.log('notif WebSocket open');
		//     GameNotifSocket.onmessage = (event) => console.log('notif message:', event.data);
		//     GameNotifSocket.onerror = (error) => console.error('notif error:', error);
		//     GameNotifSocket.onclose = () => console.log('notif WebSocket closed');
		// }
		return { TournamentNotifSocket }//, GameNotifSocket };
	
	}
	
	
	




