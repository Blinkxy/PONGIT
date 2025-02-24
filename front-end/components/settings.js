// import { getWebsocket, closeWebsocket } from "../components/matchMaking.js"

class Settings extends HTMLElement {
	constructor() {
	  super();
	}
	async connectedCallback() {
		// Fetch HTML
		const htmlResponse = await fetch('../views/settings.html');
		const htmlContent = await htmlResponse.text();
	
		// Fetch CSS
		const cssResponse = await fetch('../assets/css/settings.css');
		const cssContent = await cssResponse.text();

		// Fetch JavaScript
		const jsResponse = await fetch('../scripts/settings.js');
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

		// Execute the JavaScript logic for the settings, passing `this` as the component
		const scriptFunction = new Function('component', jsContent);
		scriptFunction(this); // Pass the component instance to the script
		
		// Dispatch an event to notify that the content is ready
		this.dispatchEvent(new CustomEvent('content-loaded', { bubbles: true, composed: true }));

		// Listen for the 'friend-selected' event and handle it in the separate script
		// document.addEventListener('friend-selected', (event) => {
		// 	const friendName = event.detail.nickname;
		// 	console.log(friendName)
		// 	this.updatesettingsUI(friendName);
		// });
	  }
  }
  customElements.define('settings-component', Settings);
  


// async function logout() {
//     try {
//         const response = await fetch("/api/logout", {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
//                 'Content-Type': 'application/json',
//             },
//         });

//         if (response.ok) {
			
//             localStorage.removeItem('accessToken');
//             localStorage.removeItem('refreshToken');

//         } else {
//             const errorData = await response.json();
//             alert(`Error: ${errorData.error || 'Logout failed.'}`);
//         }
//     } catch (error) {
//         console.error('Logout failed:', error);
//         alert('Something went wrong. Please try again later.');
//     }
// }


// async function logout() {
//     const confirmation = confirm("Are you sure you want to log out?");
    
//     if (!confirmation) {
//         alert("Logout cancelled.");
//         return;
//     }
//     try {
//         const response = await fetch("/api/logout", {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
//                 'Content-Type': 'application/json',
//             },
//         });

//         if (response.ok) {
//             localStorage.removeItem('accessToken');
//             localStorage.removeItem('refreshToken');
//             alert("You have logged out successfully.");
//         } else {
//             const errorData = await response.json();
//             alert(`Error: ${errorData.error || 'Logout failed.'}`);
//         }
//     } catch (error) {
//         console.error('Logout failed:', error);
//         alert('Something went wrong. Please try again later.');
//     }
// }
