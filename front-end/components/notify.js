import {notificationQueue, TournamentNotifSocket} from "../scripts/notification.js";
// import {TournamentNotifSocket} from "../scripts/notification.js";
let notifyEventListeners = [];
let isProcessingQueue = false;
class Notify extends HTMLElement {
    constructor() {
        super();
        this._style = null; // Reference to the dynamically added style
    }

    async connectedCallback() {
        // Fetch HTML
        const htmlResponse = await fetch('../views/notify.html');
        const htmlContent = await htmlResponse.text();

        // Fetch CSS
        const cssResponse = await fetch('../assets/css/notify.css');
        const cssContent = await cssResponse.text();

        // Append CSS to the shadow DOM
        this._style = document.createElement('style');
        this._style.textContent = cssContent;

        // Set inner HTML
        this.innerHTML = htmlContent;
        this.appendChild(this._style);
		// this.addEventListenerWithTracking()
		this.processNextNotification();
        // console.log( "notication loud")
		// addEventListenerWithTracking(acceptButton, "click", () => {
		// 	alert("You accepted the invite!");
		// });
		// addEventListenerWithTracking(declineButton, "click", () => {
		// 	alert("You declined the invite.");
		// });
        // Execute the JavaScript logic for the notifications
        // await import('../scripts/notify.js');

        // Dispatch an event to notify that the content is ready
        this.dispatchEvent(new CustomEvent('content-loaded', { bubbles: true, composed: true }));
    }
	processNextNotification() {
		const notifyContainer = document.querySelector('.notifications-container');
        if (notificationQueue.length > 0 && !isProcessingQueue) {
			isProcessingQueue = true;
			
            const info = notificationQueue.shift();
            if (info) {
				const creator = info["creator"];
				const invitation_id = info["invitation_id"];
                const message = info["message"];
                const type = info["type"];
				
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
				
				acceptButton.dataset.type = type;
				acceptButton.dataset.type = invitation_id;
				declineButton.dataset.type = invitation_id;
				declineButton.dataset.type = type;
                this.addEventListenerWithTracking(acceptButton, "click", () => {
					if (TournamentNotifSocket) {
						TournamentNotifSocket.send(JSON.stringify({
							"response": "accept",
							"invitation_id": info["invitation_id"],
						}));
					}
					// alert("You accepted the invite!");
                });
                this.addEventListenerWithTracking(declineButton, "click", () => {
					// alert("You declined the invite.");
					if (TournamentNotifSocket) {
						TournamentNotifSocket.send(JSON.stringify({
							"response": "decline",
							"invitation_id": info["invitation_id"],
						}));
					}
                });
            }
			
            setTimeout(() => {
				console.log("hello");
                isProcessingQueue = false;
                this.processNextNotification();
            }, 1000);
        }
    }
	addEventListenerWithTracking(element, event, handler) {
		element.addEventListener(event, handler);
		notifyEventListeners.push({ element, event, handler });
	}
    disconnectedCallback() {
        // Remove dynamic styles and other event listeners or resources
        if (this._style) {
            this._style.remove();
        }

        // Call cleanup method in the notification logic
        if (typeof cleanupNotifyComponent === 'function') {
            cleanupNotifyComponent();
        }
    }
}
customElements.define('notify-component', Notify);


// class Notify extends HTMLElement {
// 	constructor() {
// 	  super();
// 	}
// 	async connectedCallback() {
// 		// Fetch HTML
// 		const htmlResponse = await fetch('../views/notify.html');
// 		const htmlContent = await htmlResponse.text();
	
// 		// Fetch CSS
// 		const cssResponse = await fetch('../assets/css/notify.css');
// 		const cssContent = await cssResponse.text();

// 		// Fetch JavaScript
// 		// const jsResponse = await fetch('../scripts/notify.js');
// 		// const jsContent = await jsResponse.text();
	
// 		// Append CSS to the shadow DOM
// 		const style = document.createElement('style');
// 		style.textContent = cssContent;
	
// 		// Append JS to the shadow DOM
// 		// const script = document.createElement('script');
// 		// script.textContent = jsContent;

// 		// Set inner HTML
// 		this.innerHTML = htmlContent;
// 		this.appendChild(style);
// 		// this.appendChild(script);

// 		// Execute the JavaScript logic for the chat, passing `this` as the component
// 		// const scriptFunction = new Function('component', jsContent);
// 		// scriptFunction(this); // Pass the component instance to the script
// 		await import('../scripts/notify.js');
// 		// Dispatch an event to notify that the content is ready
// 		this.dispatchEvent(new CustomEvent('content-loaded', { bubbles: true, composed: true }));
		
// 	  }
//   }
//   customElements.define('notify-component', Notify);
  