class Chat extends HTMLElement {
	constructor() {
	  super();
	}
	async connectedCallback() {
		// Fetch HTML
		const htmlResponse = await fetch('../views/chat.html');
		const htmlContent = await htmlResponse.text();
	
		// Fetch CSS
		const cssResponse = await fetch('../assets/css/chat.css');
		const cssContent = await cssResponse.text();

		// Fetch JavaScript
		const jsResponse = await fetch('../scripts/chat.js');
		const jsContent = await jsResponse.text();
		
		// Append CSS to the shadow DOM
		const style = document.createElement('style');
		style.textContent = cssContent;
		// Append JS to the shadow DOM
		const script = document.createElement('script');
		script.textContent = jsContent;

		// Set inner HTML
		this.innerHTML = htmlContent;
		this.appendChild(style);
		// this.appendChild(script);

		// Execute the JavaScript in the context of the component
		// const scriptFunction = new Function(jsContent).bind(this);
		// scriptFunction();

		// Execute the JavaScript logic for the chat, passing `this` as the component
		const scriptFunction = new Function('component', jsContent);
		scriptFunction(this); // Pass the component instance to the script

		// Dispatch an event to notify that the content is ready~
		this.dispatchEvent(new CustomEvent('content-loaded', { bubbles: true, composed: true }));

		// Listen for the 'friend-selected' event and handle it in the separate script
		// document.addEventListener('friend-selected', (event) => {
		// 	const friendName = event.detail.nickname;
		// 	console.log(friendName)
		// 	this.updateChatUI(friendName);
		// });

	  }
  }
  customElements.define('chat-component', Chat);
  