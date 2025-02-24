class PlayersRank extends HTMLElement {
	constructor() {
	  super();
	}
	async connectedCallback() {
		// Fetch HTML
		const htmlResponse = await fetch('../views/players-rank.html');
		const htmlContent = await htmlResponse.text();
	
		// Fetch CSS
		const cssResponse = await fetch('../assets/css/players-rank.css');
		const cssContent = await cssResponse.text();

		// Fetch JavaScript
		const jsResponse = await fetch('../scripts/players-rank.js');
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

	  }
  }
  customElements.define('players-rank-component', PlayersRank);
  