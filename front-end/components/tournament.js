class Tournament extends HTMLElement {
	constructor() {
	  super();
	  this.listeners = new Map();
	  this.webSocketInstance = null;
	}
  
	removeAllListeners() {
	  this.listeners.forEach((cleanup, element) => {
		if (element && cleanup) {
		  cleanup();
		}
	  });
	  this.listeners.clear();
	}
  
	disconnectedCallback() {
	  this.removeAllListeners();
	  if (this.webSocketInstance && this.webSocketInstance.socket) {
		this.webSocketInstance.socket.close();
		this.webSocketInstance = null;
	  }
	  this.leftHideTimeout	= null; // clean up the leftHideTimeout
	}
  
	addListener(element, eventType, handler) {
	  if (!element) return;
	  
	  element.addEventListener(eventType, handler);
	  const cleanup = () => element.removeEventListener(eventType, handler);
	  console.log("element:", element);
	  this.listeners.set(element, cleanup);
	}
  
	async connectedCallback() {
	  // Fetch HTML
	  const htmlResponse = await fetch('../views/tournament.html');
	  const htmlContent = await htmlResponse.text();
  
	  // Fetch CSS
	  const cssResponse = await fetch('../assets/css/tournament.css');
	  const cssContent = await cssResponse.text();
  
	  // Append CSS to the shadow DOM
	  const style = document.createElement('style');
	  style.textContent = cssContent;
  
	  // Set inner HTML
	  this.innerHTML = htmlContent;
	  this.appendChild(style);
  
	  // Import and initialize tournament functionality
	  const { initializeTournament } = await import('../scripts/tournament.js');
	  await initializeTournament(this);

  
	  // Dispatch an event to notify that the content is ready
	  this.dispatchEvent(new CustomEvent('content-loaded', { bubbles: true, composed: true }));
	}
  }
  
  customElements.define('tournament-component', Tournament);