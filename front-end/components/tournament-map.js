class TournamentMap extends HTMLElement {
	constructor() {
	  super();
	}
	async connectedCallback() {
		// Fetch HTML
		const htmlResponse = await fetch('../views/tournament-map.html');
		const htmlContent = await htmlResponse.text();
	
		// Fetch CSS
		const cssResponse = await fetch('../assets/css/tournament-map.css');
		const cssContent = await cssResponse.text();

		// Fetch JavaScript
		const jsResponse = await fetch('../scripts/tournament-map.js');
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

		// Import and initialize tournament-map functionality
		const { initializeTournamentRounds } = await import('../scripts/tournament-map.js');
		await initializeTournamentRounds(this);


		// Execute the JavaScript in the context of the component
		// const scriptFunction = new Function(jsContent).bind(this);
		// scriptFunction();

		// Dispatch an event to notify that the content is ready
		this.dispatchEvent(new CustomEvent('content-loaded', { bubbles: true, composed: true }));

	  }
  }
  customElements.define('tournament-map-component', TournamentMap);
  