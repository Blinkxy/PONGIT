// import { closeWebsocket } from "../components/matchMaking";

class Sign extends HTMLElement {
	constructor() {
	  super();
	}
	async connectedCallback() {
		// Fetch HTML
		const htmlResponse = await fetch('../views/sign.html');
		const htmlContent = await htmlResponse.text();
	
		// Fetch CSS
		const cssResponse = await fetch('../assets/css/sign.css');
		const cssContent = await cssResponse.text();

		// Fetch JavaScript
		const jsResponse = await fetch('../scripts/signin.js');
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
		// let token    =   localStorage.getItem("accessToken");
    	// let URL      =   `wss://10.11.4.4:443/ws/notification/?token=${token}`
		// closeWebsocket( URL )
		// Execute the JavaScript logic for the chat, passing `this` as the component
		const scriptFunction = new Function('component', jsContent);
		scriptFunction(this); // Pass the component instance to the script

		// Dispatch an event to notify that the content is ready~
		this.dispatchEvent(new CustomEvent('content-loaded', { bubbles: true, composed: true }));

	  }
	
  }
  customElements.define('sign-component', Sign);
  


  