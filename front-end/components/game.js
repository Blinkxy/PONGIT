// import { testInstance } from '../scripts/test.js';

class Game extends HTMLElement {
	constructor() {
		console.log("game is here")
	  super();
	}
	async connectedCallback() {
		// Fetch HTML
		const htmlResponse = await fetch('../views/game.html');
		const htmlContent = await htmlResponse.text();
	
		// Fetch CSS
		const cssResponse = await fetch('../assets/css/game.css');
		const cssContent = await cssResponse.text();

		// Fetch JavaScript 
		// const jsResponse = await fetch('../scripts/game.js');
		// const jsContent = await jsResponse.text();
	
		// Append CSS to the shadow DOM
		const style = document.createElement('style');
		style.textContent = cssContent;
	
		// Append JS to the shadow DOM
		// const script = document.createElement('script');
		// script.type = 'module';
		// script.textContent = jsContent;

		// Set inner HTML
		this.innerHTML = htmlContent;
		this.appendChild(style);
		// this.appendChild(script);

		// Execute the JavaScript logic for the chat, passing `this` as the component
		// const scriptFunction = new Function('component', jsContent);
		// scriptFunction(this); // Pass the component instance to the script

			//  change fetch data from import script js 
		const gameModule = await import('../scripts/game.js');

		// Log the variable before passing it
		//console.log('Component Variable (myVariable):', myVariable); // Ensure it's correct here

		// Log the instance to verify
		//console.log('Instance from test.js:', testInstance); // Ensure the instance is correct


		// // Execute the JavaScript logic, passing `this` and the variable
		// const scriptFunction = new Function('component', 'instance', jsContent);
		// scriptFunction(this, testInstance); // Pass the component and the variable

		// Pass `myVariable` to the script
		// const scriptFunction = new Function('component', 'instance', `
		// 	console.log('Inside Dynamic Function - Variable:', variable); // Debugging
		// 	${jsContent}
		// `);

		// scriptFunction(this, testInstance); // Pass the component and variable


		// Dispatch an event to notify that the content is ready
		this.dispatchEvent(new CustomEvent('content-loaded', { bubbles: true, composed: true }));

	  }
  }
  customElements.define('game-component', Game);
  