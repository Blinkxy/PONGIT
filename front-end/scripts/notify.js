
// import {notificationQueue} from "./notification.js";
// let notifyEventListeners = [];
// let isProcessingQueue = false;
(function initializeNotifyComponent(component) {
    console.log("Initializing notify component...");
    const notifyContainer = document.querySelector('.notifications-container');
    const notifyGame = document.createElement('div');
    notifyGame.classList.add('notification', 'game-invite');
    notifyGame.innerHTML = `
        <p><strong>${creator}:</strong> ${message} (${type}).</p>
        <div class="actions">
            <button class="accept">✔ Accept</button>
            <button class="decline">✖ Decline</button>
        </div>
        <span class="time">7 minutes ago</span>
    `;
    notifyContainer.appendChild(notifyGame);
    const acceptButton = notifyGame.querySelector(".accept");
    const declineButton = notifyGame.querySelector(".decline");
    // function addEventListenerWithTracking(element, event, handler) {
    //     element.addEventListener(event, handler);
    //     notifyEventListeners.push({ element, event, handler });
    // }

    // function processNextNotification() {
    //     const notifyContainer = document.querySelector('.notifications-container');
    //     if (notificationQueue.length > 0 && !isProcessingQueue) {
    //         isProcessingQueue = true;

    //         const info = notificationQueue.shift();
    //         if (info) {
    //             const creator = info["creator"];
    //             const message = info["message"];
    //             const type = info["type"];

    //             const notifyGame = document.createElement('div');
    //             notifyGame.classList.add('notification', 'game-invite');
    //             notifyGame.innerHTML = `
    //                 <p><strong>${creator}:</strong> ${message} (${type}).</p>
    //                 <div class="actions">
    //                     <button class="accept">✔ Accept</button>
    //                     <button class="decline">✖ Decline</button>
    //                 </div>
    //                 <span class="time">7 minutes ago</span>
    //             `;
    //             notifyContainer.appendChild(notifyGame);

    //             const acceptButton = notifyGame.querySelector(".accept");
    //             const declineButton = notifyGame.querySelector(".decline");

    //             addEventListenerWithTracking(acceptButton, "click", () => {
    //                 alert("You accepted the invite!");
    //             });
    //             addEventListenerWithTracking(declineButton, "click", () => {
    //                 alert("You declined the invite.");
    //             });
    //         }

    //         setTimeout(() => {
    //             isProcessingQueue = false;
    //             processNextNotification();
    //         }, 2000);
    //     }
    // }

    // processNextNotification();

    // // Global cleanup function to remove listeners and notifications
    // window.cleanupNotifyComponent = () => {
	// 		notifyEventListeners.forEach(({ element, event, handler }) => {
	// 			element.removeEventListener(event, handler);
	// 		});
	// 		notifyEventListeners = [];
	// 		console.log("Cleaned up notify component.");
	// 	};
})(this);



// import { initializeSockets } from "./notification.js";
// import {notificationQueue} from "./notification.js";
// let isProcessingQueue = false;
// (function initializeNotifyComponent(component) {
// 	// initializeSockets();
// 	// build notification for game
// 	// function buildGameNotify(nickname)  {
// 		// 	const notifyContainer = document.querySelector('.notifications-container');
		
// 		// 	// Create the member-setting div
// 		// 	const notifyGame = document.createElement('div');
// 		// 	notifyGame.classList.add('notification');
// 		// 	notifyGame.classList.add('game-invite');
// 		// 	// memberSetting.classList.add('selct-box close');
		
// 		// 	// Example content (customize as needed)
// 		// 	notifyGame.innerHTML = `
// 		// 		<p><strong>Alex:</strong> Invited you to play a game.</p>
// 		// 		<div class="actions">
// 		// 			<button class="accept">✔ Accept</button>
// 		// 			<button class="decline">✖ Decline</button>
// 		// 		</div>
// 		// 		<span class="time">7 minutes ago</span>
// 		// 	`;
// 		// 	notifyContainer.appendChild(notifyGame);
// 		// };
		
// 		// start
// 		console.log("hello notifynotif ynotifyn otifyno tifynotif ynotify");
// 		function processNextNotification() {
// 			const notifyContainer = document.querySelector('.notifications-container');
// 			if (notificationQueue.length > 0 && !isProcessingQueue) {
// 				isProcessingQueue = true;
//     	    // const { message, type } = notificationTour.shift(); // Dequeue message
// 			const info = notificationQueue.shift();
// 			if (info) {
// 				const appContainer = document.querySelector('.container');
// 				const message = info["message"];
// 				const type = info["type"];
// 				const creator = info["creator"];
// 				const notifyGame = document.createElement('div');
// 				notifyGame.classList.add('notification');
// 				notifyGame.classList.add('game-invite');
// 				// memberSetting.classList.add('selct-box close');

// 				// Example content (customize as needed)
// 				notifyGame.innerHTML = `
// 					<p><strong>${creator}:</strong> ${message} a ${type}.</p>
// 					<div class="actions">
// 						<button class="accept">✔ Accept</button>
// 						<button class="decline">✖ Decline</button>
// 					</div>
// 					<span class="time">7 minutes ago</span>
// 				`;
// 				notifyContainer.appendChild(notifyGame);
// 				// console.log('message', typeof(message));
// 				// console.log('type', type);
// 				// if (appContainer) {
// 				// 	window.loadComponentNotify('notification', appContainer,  { message, type });
// 				// } else {
// 				// 	console.error("App container not found. Notification skipped.");
// 				// }
// 			}

//     	    // Delay for a short time before processing the next notification
//     	    setTimeout(() => {
//     	        isProcessingQueue = false;
//     	        processNextNotification();
//     	    }, 2000); // Adjust delay based on how long you want the notification to remain visible
//     	} 
// 	}
// 	processNextNotification()
// 	// end
// 	// console.log("hello notify");
// 	const acceptButtons = document.querySelectorAll(".notifications-container .accept");
//     const declineButtons = document.querySelectorAll(".notifications-container .decline");

//     acceptButtons.forEach(button => {
//         button.addEventListener("click", () => {
//             alert("You accepted the game invite!");
//         });
//     });

//     declineButtons.forEach(button => {
//         button.addEventListener("click", () => {
//             alert("You declined the game invite.");
//         });
//     });

// })(this);
