// Import the shared function(s) at the top of your component file
// import { loadComponent2, loadChat } from '../scripts/utils.js';


class RightSideBar extends HTMLElement {
	constructor() {
		super();
		// Attach shadow root
		//   this.attachShadow({ mode: 'open' });
	}
	async connectedCallback() {
		
		// Fetch HTML
		const htmlResponse = await fetch('../views/right-sidebar.html');
		const htmlContent = await htmlResponse.text();
	
		// Fetch CSS
		const cssResponse = await fetch('../assets/css/right-sidebar.css');
		const cssContent = await cssResponse.text();

		// Fetch JavaScript
		const jsResponse = await fetch('../scripts/right-sidebar.js');
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
		const scriptFunction = new Function(jsContent).bind(this);
		scriptFunction();

		// Dispatch an event to notify that the content is ready
		this.dispatchEvent(new CustomEvent('content-loaded', { bubbles: true, composed: true }));
		

		 // Dispatch a custom event specifically for the right sidebar being loaded
		//  this.dispatchEvent(new CustomEvent('right-sidebar-loaded', {
        //     bubbles: true,
        //     composed: true,
        //     detail: { message: "Right sidebar has loaded" }
        // }));


	  }
  }
  customElements.define('right-sidebar-component', RightSideBar);
  