// function showNotification({ message, type = 'info', icon = 'fa-info-circle', duration = 4000 }) {
//     // Create or get container
//     let container = document.getElementById('notification-container');
//     if (!container) {
//         container = document.createElement('div');
//         container.id = 'notification-container';
//         container.style.cssText = `
//             position: fixed;
//             top: 20px;
//             right: 20px;
//             z-index: 1000;
//         `;
//         document.body.appendChild(container);
//     }

//     // Create notification element
//     const notification = document.createElement('div');
//     notification.style.cssText = `
//         position: relative;
//         display: flex;
//         align-items: center;
//         gap: 12px;
//         padding: 16px 24px;
//         margin-bottom: 10px;
//         border-radius: 12px;
//         color: white;
//         font-family: 'Segoe UI', sans-serif;
//         min-width: 300px;
//         box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3),
//                    0 4px 8px rgba(0, 0, 0, 0.2),
//                    0 2px 4px rgba(0, 0, 0, 0.1);
//         animation: slideIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
//         backdrop-filter: blur(10px);
//         border: 1px solid rgba(255, 255, 255, 0.18);
//         overflow: hidden;
//     `;

//     // Set notification type styles
//     const types = {
//         success: 'linear-gradient(45deg, #4caf50, #45d987)',
//         error: 'linear-gradient(45deg, #f44336, #ff5252)',
//         warning: 'linear-gradient(45deg, #ff9800, #ffb74d)',
//         info: 'linear-gradient(45deg, #2196f3, #21cbf3)'
//     };
//     notification.style.background = types[type] || types.info;

//     // Add icon
//     const iconElement = document.createElement('i');
//     iconElement.className = `fas ${icon}`;
//     iconElement.style.fontSize = '20px';

//     // Add text
//     const textElement = document.createElement('span');
//     textElement.textContent = message;
//     textElement.style.fontWeight = '500';

//     // Add close button
//     const closeButton = document.createElement('i');
//     closeButton.className = 'fas fa-times';
//     closeButton.style.cssText = `
//         margin-left: auto;
//         cursor: pointer;
//         opacity: 0.7;
//         transition: opacity 0.3s;
//     `;
//     closeButton.addEventListener('mouseover', () => closeButton.style.opacity = '1');
//     closeButton.addEventListener('mouseout', () => closeButton.style.opacity = '0.7');
//     closeButton.onclick = () => removeNotification(notification);

//     // Add progress bar
//     const progressBar = document.createElement('div');
//     progressBar.style.cssText = `
//         position: absolute;
//         bottom: 0;
//         left: 0;
//         height: 4px;
//         background: rgba(255, 255, 255, 0.7);
//         width: 100%;
//         animation: progress ${duration}ms linear;
//     `;

//     // Assemble notification
//     notification.appendChild(iconElement);
//     notification.appendChild(textElement);
//     notification.appendChild(closeButton);
//     notification.appendChild(progressBar);

//     // Add hover effects
//     notification.addEventListener('mouseenter', () => {
//         notification.style.transform = 'translateY(-2px)';
//         notification.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.4), 0 6px 10px rgba(0, 0, 0, 0.3), 0 3px 6px rgba(0, 0, 0, 0.2)';
//     });
//     notification.addEventListener('mouseleave', () => {
//         notification.style.transform = 'translateY(0)';
//         notification.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)';
//     });

//     container.appendChild(notification);

//     // Add shake animation for error type
//     if (type === 'error') {
//         notification.style.animation = 'slideIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55), shake 0.5s ease 0.7s';
//     }

//     // Remove notification after duration
//     setTimeout(() => removeNotification(notification), duration);
// }

// // Function to remove notification with animation
// function removeNotification(notification) {
//     notification.style.animation = 'slideOut 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
//     setTimeout(() => {
//         const container = document.getElementById('notification-container');
//         if (container && notification.parentElement) {
//             container.removeChild(notification);
//             if (container.children.length === 0) {
//                 document.body.removeChild(container);
//             }
//         }
//     }, 500);
// }

// Required CSS animations (add these to your stylesheet)
/*
@keyframes slideIn {
    from {
        transform: translateX(100%) scale(0.5);
        opacity: 0;
    }
    to {
        transform: translateX(0) scale(1);
        opacity: 1;
    }
}

@keyframes slideOut {
    to {
        transform: translateX(100%) scale(0.5);
        opacity: 0;
    }
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

@keyframes progress {
    from { width: 100%; }
    to { width: 0%; }
}
*/
(function initializeChatComponent(component) {

	const appContainer = document.querySelector(".container");
	// click cancel button 
	const cancel  = component.document.querySelector('.add-friend-container .actions .cancel');
	cancel.addEventListener('click', ()=>{
		console.log(cancel.parentElement.parentElement.parentElement.remove());
	})


    const add = document.querySelector('.add-friend-container .actions .add');

	add.addEventListener('click', async () => {
		const fusernameInput = document.querySelector(".add-friend-container .input-msg #username");
		const fusername = fusernameInput.value;

		if (!fusername) {
			console.error("Username cannot be empty.");
			alert("Please enter a valid username.");
			return;
		}

		try {
			const response = await fetch("/api/friends/add/"+fusername, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username: fusername }),
			});

			if (response.ok) {
				const data = await response.json();
				console.log(data.message);
				window.loadComponentNotify('notification', appContainer, {message: `Friend request sent to: ${fusername}`, type: "info"});
				


				const container = add.parentElement.parentElement.parentElement;
				container.remove();
				fusernameInput.value = '';
			} else {
				const detail = await response.json();

				window.loadComponentNotify('notification', appContainer, {message: detail.detail, type: "error"});


				// showNotification({
				// 	message: detail.detail,
				// 	type: "error",
				// 	icon: "fa-check-circle",
				// 	duration: 3000
				// });
			}
		} catch (error) {
			console.error("Network or server error:", error);
			window.loadComponentNotify('notification', appContainer, {message: "An error occurred while sending the friend request. Please try again.", type: "error"});

		}
	});
	

})(this);

