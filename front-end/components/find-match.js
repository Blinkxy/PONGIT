import { getWebsocket, closeWebsocket }  from "../components/matchMaking.js";

class FindMatch extends HTMLElement {
	constructor() {
		console.log("12356")
	  super();
	}
	async connectedCallback() {
		const token = localStorage.getItem('accessToken');
		const socketUrl = `wss://10.11.4.4:443/ws/matchmaking/random/?token=${token}`;
		this.socket = getWebsocket(socketUrl)
		// Fetch HTML
		console.log("findMatch Connected")
		const htmlResponse = await fetch('../views/find-match.html');
		const htmlContent = await htmlResponse.text();
	
		// Fetch CSS
		const cssResponse = await fetch('../assets/css/find-match.css');
		const cssContent = await cssResponse.text();

		// Fetch JavaScript
		// const jsResponse = await fetch('../scripts/find-match.js');
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

		// Execute the JavaScript in the context of the component
		// const scriptFunction = new Function(jsContent).bind(this);
		// scriptFunction();

		// Execute the JavaScript logic for the find-match, passing `this` as the component
		const findMatchModule = await import('../scripts/find-match.js')
		// const scriptFunction = new Function('component', jsContent);
		// scriptFunction(this); // Pass the component instance to the script

		// Dispatch an event to notify that the content is ready
		this.dispatchEvent(new CustomEvent('content-loaded', { bubbles: true, composed: true }));

		const dots = document.querySelector('.dots');
	
		const container = document.querySelector('.container');
		const button = document.querySelector('.cancel-btn');

		button.addEventListener('click', () => {
			console.log( "match making2 ")
				let message = {
					"type"	:	"cancel",
					"code"	:	4500
				}
				// window.socket.send(JSON.stringify(message));
				this.socket.send(JSON.stringify(message));
				// socket.addEventListener = function ( event )  {
					
				// }
				this.socket.addEventListener( "message", ( event ) => {
					console.log( "cancel btn --->", event.data )
					const findMatchComponent = container.querySelector('find-match-component')
					if ( findMatchComponent !== null ) {
						findMatchComponent.remove();
						window.loadComponent2("game", document.querySelector(".container"))
					}
				})
				console.log('Search cancelled');
		});
		
		// Listen for the 'friend-selected' event and handle it in the separate script
		// document.addEventListener('friend-selected', (event) => {
			// 	const friendName = event.detail.nickname;
			// 	console.log(friendName)
			// 	this.updatefind-matchUI(friendName);
			// });
			
		}
		disconnectedCallback( ) {
			console.log("socket match making" , this.socket)
			if ( this.socket !== null ) {
				console.log("test test game friend match making")
				let message = {
					"type"	:	"cancel",
					"code"	:	4500
				}
				// window.socket.send(JSON.stringify(message));
				this.socket.send( JSON.stringify(message) );
				// socket.addEventListener = function ( event )  {
					
				// }
			}
		}
	  
  }
  customElements.define('find-match-component', FindMatch);
  