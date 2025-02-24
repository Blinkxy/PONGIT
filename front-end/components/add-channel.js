class AddChannel extends HTMLElement {
	constructor() {
	  super();
	}
	async connectedCallback() {
		// Fetch HTML
		const htmlResponse = await fetch('../views/add-channel.html');
		const htmlContent = await htmlResponse.text();
	
		// Fetch CSS
		const cssResponse = await fetch('../assets/css/add-channel.css');
		const cssContent = await cssResponse.text();

		// Fetch JavaScript
		const jsResponse = await fetch('../scripts/add-channel.js');
		const jsContent = await jsResponse.text();
	
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
		const scriptFunction = new Function('component', jsContent);
		scriptFunction(this); // Pass the component instance to the script

		// Dispatch an event to notify that the content is ready
		this.dispatchEvent(new CustomEvent('content-loaded', { bubbles: true, composed: true }));
		
	  }
  }
  customElements.define('add-channel-component', AddChannel);
  

//   class AddChannel extends HTMLElement {
// 	constructor() {
// 	  super();
// 	}
  
// 	async connectedCallback() {
// 	  // Fetch HTML
// 	  const htmlResponse = await fetch('../views/add-channel.html');
// 	  const htmlContent = await htmlResponse.text();
  
// 	  // Fetch CSS
// 	  const cssResponse = await fetch('../assets/css/add-channel.css');
// 	  const cssContent = await cssResponse.text();
  
// 	  // Fetch JavaScript
// 	  const jsResponse = await fetch('../scripts/add-channel.js');
// 	  const jsContent = await jsResponse.text();
  
// 	  // Append Bootstrap CSS to the shadow DOM
// 	  const bootstrapLink = document.createElement('link');
// 	  bootstrapLink.rel = 'stylesheet';
// 	  bootstrapLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css';
  
// 	  // Append custom CSS to the shadow DOM
// 	  const style = document.createElement('style');
// 	  style.textContent = cssContent;
  
// 	  // Set inner HTML
// 	  this.innerHTML = htmlContent;
// 	  this.appendChild(bootstrapLink);
// 	  this.appendChild(style);
  
// 	  // Execute the JavaScript logic for the chat, passing `this` as the component
// 	  const scriptFunction = new Function('component', jsContent);
// 	  scriptFunction(this); // Pass the component instance to the script
  
// 	  // Dispatch an event to notify that the content is ready
// 	  this.dispatchEvent(new CustomEvent('content-loaded', { bubbles: true, composed: true }));
// 	}
//   }
//   customElements.define('add-channel-component', AddChannel);