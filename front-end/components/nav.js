// import { initializeSockets } from "../scripts/notification.js";
import { getWebsocket, closeWebsocket , tokenNotify } from "../components/matchMaking.js"
// import { }
// class Nav extends HTMLElement {
// 	constructor() {
// 	  super();
// 	}
// 	async connectedCallback() {
// 		// Fetch HTML
// 		const htmlResponse = await fetch('../views/nav.html');
// 		const htmlContent = await htmlResponse.text();
	
// 		// Fetch CSS
// 		const cssResponse = await fetch('../assets/css/nav.css');
// 		const cssContent = await cssResponse.text();

// 		// Fetch JavaScript
// 		const jsResponse = await fetch('../scripts/nav.js');
// 		const jsContent = await jsResponse.text();
	
// 		// Append CSS to the shadow DOM
// 		const style = document.createElement('style');
// 		style.textContent = cssContent;
	
// 		// Append JS to the shadow DOM
// 		const script = document.createElement('script');
// 		script.textContent = jsContent;

// 		// Set inner HTML
// 		this.innerHTML = htmlContent;
// 		this.appendChild(style);
// 		this.appendChild(script);

// 	  }
//   }
//   customElements.define('nav-component', Nav);
  


class Nav extends HTMLElement {
	constructor() {
	  super();
	}
	async connectedCallback() {
		// Fetch HTML
		const htmlResponse = await fetch('../views/nav.html');
		const htmlContent = await htmlResponse.text();
	
		// Fetch CSS
		const cssResponse = await fetch('../assets/css/nav.css');
		const cssContent = await cssResponse.text();

		// Fetch JavaScript
		// const jsResponse = await fetch('../scripts/nav.js');
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
		const { initializeSidebarComponent } = await import('../scripts/nav.js');
	 	await initializeSidebarComponent(this);
		// Dispatch an event to notify that the content is ready
		this.dispatchEvent(new CustomEvent('content-loaded', { bubbles: true, composed: true }));
	  }
	  disconnectedCallback() {
		// let token    =   localStorage.getItem("accessToken");
    	let URL      =   `wss://10.11.4.4:443/ws/notification/?token=${tokenNotify.notifyToken}`
		tokenNotify.notifyToken = null
		closeWebsocket( URL )
	}
  }
  customElements.define('nav-component', Nav);
  