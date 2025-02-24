import { getWebsocket, closeWebsocket , tokenNotify } from "./matchMaking.js"



class AddFriend extends HTMLElement {
	constructor() {
	  super();
	}
	async connectedCallback() {
		// Fetch HTML
		const htmlResponse = await fetch('../views/add-friend.html');
		const htmlContent = await htmlResponse.text();
	
		// Fetch CSS
		const cssResponse = await fetch('../assets/css/add-friend.css');
		const cssContent = await cssResponse.text();

		// Fetch JavaScript
		// const jsResponse = await fetch('../scripts/add-friend.js');
		// const jsContent = await jsResponse.text();
	
		// Append CSS to the shadow DOM
		const style = document.createElement('style');
		style.textContent = cssContent;
	
		// Append JS to the shadow DOM
		// const script = document.createElement('script');
		// script.textContent = jsContent;

		// Set inner HTML
		this.innerHTML = htmlContent;
		this.appendChild(style);
		// this.appendChild(script);

		// Execute the JavaScript logic for the chat, passing `this` as the component
		// const scriptFunction = new Function('component', jsContent);
		// scriptFunction(this); // Pass the component instance to the script


		// start js code 




		const appContainer = document.querySelector(".container");
		// click cancel button 
		const cancel  = document.querySelector('.add-friend-container .actions .cancel');
		cancel.addEventListener('click', ()=>{
			console.log(cancel.parentElement.parentElement.parentElement.remove());
		})
	
	
		const add = document.querySelector('.add-friend-container .actions .add');
	
		add.addEventListener('click', async () => {
			const fusernameInput = document.querySelector(".add-friend-container .input-msg #username");
			const fusername = fusernameInput.value;
	
			if (!fusername) {
				console.error("Username cannot be empty.");
				alert("Please enter a valid username.");
				return;
			}
	
			try {
				const response = await fetch("/api/friends/add/"+fusername, {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ username: fusername }),
				});
	
				if (response.ok) {
					const data = await response.json();
					console.log(data.message);
					window.loadComponentNotify('notification', appContainer, {message: `Friend request sent to: ${fusername}`, type: "info"});
					console.log(" test send request ")
					let URL      =   `wss://10.11.4.4:443/ws/notification/?token=${tokenNotify.notifyToken}`
					let socketNotify = getWebsocket( URL )
					let messageNotify = {
						"type"		: 	"friend",
						"name"		:	fusername,
						"typeNotify":	"send",
					}
					socketNotify.send( JSON.stringify(messageNotify) )
					const container = add.parentElement.parentElement.parentElement;
					container.remove();
					fusernameInput.value = '';
				} else {
					const detail = await response.json();
	
					window.loadComponentNotify('notification', appContainer, {message: detail.detail, type: "error"});
					console.log("test add friend ")
					// if ( !socket )
					// 	socket.send( {
					// 		"type"	:	"test is correct "
					// })
	
					// showNotification({
					// 	message: detail.detail,
					// 	type: "error",
					// 	icon: "fa-check-circle",
					// 	duration: 3000
					// });
				}
			} catch (error) {
				console.error("Network or server error:", error);
				window.loadComponentNotify('notification', appContainer, {message: "An error occurred while sending the friend request. Please try again.", type: "error"});
	
			}
		});



		//  end js code
		// Dispatch an event to notify that the content is ready
		this.dispatchEvent(new CustomEvent('content-loaded', { bubbles: true, composed: true }));
		
	  }
  }
  customElements.define('add-friend-component', AddFriend);
  