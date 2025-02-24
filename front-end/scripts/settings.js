// import { closeWebsocket } from "../components/matchMaking";

(function initializeChatComponent(component) {

	const status_2faElement = document.querySelector('.twofa-status');
	const status_2fabtnElement = document.querySelector('.enable-btn');


	if (localStorage.getItem('is_2fa_enabled') === 'true') {
		status_2faElement.textContent = 'Enabled';
		status_2fabtnElement.textContent = 'Disable';
	} else {
		status_2faElement.textContent = 'Disabled';
		status_2fabtnElement.textContent = 'Enable';
		
	}

	

	const container = document.querySelector('.container');
	const appContainer = document.querySelector('.container');
	// change username
	const changeUsername = document.querySelector(".settings-container .body-msg .profile-container .user .username a.changeUsername");
	changeUsername.addEventListener('click', ()=>{
		//console.log(changeUsername);
		window.loadComponent(container, "add-channel");
	})


	// change profile picture
	const changeProfilePic = document.querySelector(".profile-img .add-profile");
	const fileInput = document.getElementById("fileInput");

	changeProfilePic.addEventListener('click', () => {
		// Trigger the file input click
		fileInput.click();
	});


	fileInput.addEventListener('change', async (event) => {
		const file = event.target.files[0];

		if (file) {
			if (file.type.startsWith('image/')) {
				console.log(`Selected file: ${file.name}`);
				const formData = new FormData();
				formData.append('image', file);
				try {
					const response = await fetch('/api/user/change/image', {
						method: 'PUT',
						headers: {
							'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
						},
						body: formData
					});
					const result = await response.json();
					if (response.ok) {
						console.log(result);

						window.loadComponentNotify('notification', appContainer, {
							message: 'Profile image successfully updated.', 
							type: "success"
						});

						localStorage.setItem('profile_image', result.profile_image);
						const profileImg = document.querySelector(".profile-img img");
						const profileNavbar = document.querySelector('.navbar .links-container .profile a img');
		
						if (profileImg) profileImg.src = result.profile_image;
						if (profileNavbar) profileNavbar.src = result.profile_image;
					} else {
						window.loadComponentNotify('notification', appContainer, {
							message: `Error: ${result.error || 'Failed to upload image.'}`, 
							type: "error"
						});
		
					}
				} catch (error) {
					console.error('Network/Server error:', error);
					window.loadComponentNotify('notification', appContainer, {
						message: 'An unexpected error occurred., 4G mchat a m3elem', 
						type: "error"
					});
				}
			} else {
				window.loadComponentNotify('notification', appContainer, {
					message: 'Please upload a valid image file.', 
					type: "error"
				});
				fileInput.value = '';
			}
		}
		
});




	document.querySelector('.btn-logout').addEventListener('click',
		logout
	);

	document.querySelector('.btn-delete').addEventListener('click',
		delete_account
	);

	async function logout() {
		const confirmation = confirm("Are you sure you want to log out?");
		
		if (!confirmation) {
			alert("Logout cancelled.");
			return;
		}
		try {
			const response = await fetch("/api/logout", {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
					'Content-Type': 'application/json',
				},
			});
			if (response.ok) {
				localStorage.removeItem('accessToken');
				localStorage.removeItem('refreshToken');
				localStorage.removeItem('id');
				localStorage.removeItem('username');
				localStorage.removeItem('profile_image');
				document.cookie = "sessionid"+'=; Max-Age=-99999999;'

				// alert("You have logged out successfully.");
				console.log("test test nav bar")

				// direct to login 
			// Redirect to / after successful logout ...
			// const leftBtn = document.querySelector('.container .left');
			// leftBtn.style.display = 'block';

			// const rightBtn = document.querySelector('.container .left');
			// rightBtn.style.display = 'block';

			// create navbar
			// const newComponent = document.createElement('nav-component');
			// appContainer.appendChild(newComponent);
			// window.location.href = '/game';
			window.history.pushState({}, '', `/`);
			document.querySelector('nav-component').remove();
			localStorage.removeItem('appState');
			
			// const leftBtn = document.querySelector('.container .left');
			// leftBtn.style.display = 'none';

			// const rightBtn = document.querySelector('.container .right');
			// rightBtn.style.display = 'none';

			window.loadComponent2('sign-in', appContainer);
			
			//appContainer.style.backgroundImage = "url('../assets/imgs/bg.png')";
				console.log("de ",window.location.pathname);

			} else {
				const errorData = await response.json();
				alert(`Error: ${errorData.error || 'Logout failed.'}`);
			}
		} catch (error) {
			console.error('Logout failed:', error);
			alert('Internal server error, or something went wrong, please try later');
		}
	};


	async function delete_account(){
		alert("Warning: This action cannot be canceled. Proceed with caution!");
		const confirmation = confirm("Are you sure you want to delete you account?");
		
		if (!confirmation) {
			alert("Logout cancelled.");
			return;
		}
	
		try {
			const response = await fetch("/api/user/delete/account", {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
					'Content-Type': 'application/json',
				},
			});
	
			if (response.ok) {
				localStorage.removeItem('accessToken');
				localStorage.removeItem('refreshToken');
				localStorage.removeItem('id');
				localStorage.removeItem('username');
				localStorage.removeItem('profile_image');
				document.cookie = "sessionid=; Max-Age=-99999999;";
	
				// alert("You have deleted the account successfully.");

				// direct the user to the sign-in page ...
				window.history.pushState({}, '', `/`);
				document.querySelector('nav-component').remove();
				localStorage.removeItem('appState');
				
				window.loadComponent2('sign-in', appContainer);


			} else {
				const errorData = await response.json();
				alert(`Error: ${errorData.error || 'Deleting the account failed.'}`);
			}
		} catch (error) {
			console.error('Logout failed:', error);
			alert('Internal server error, or something went wrong, please try later');
		}
	};

	username = localStorage.getItem("username");
	console.log(username);
	const usernameElement = document.getElementById('username');
    if (usernameElement && username) {
        usernameElement.textContent = username;
    }

	profile_image = localStorage.getItem("profile_image");

	const profileImageElement = document.getElementById('profile_image_settings');
	const profileNavbar = document.querySelector('.navbar .links-container .profile a img')
    if (profileImageElement && profile_image ) {
          profileImageElement.src = profile_image;
          profileImageElement.alt = `${username}'s profile picture`;
		  profileNavbar.src = profile_image;
		  
    }

	document.querySelector('.enable-btn').addEventListener('click', async function(event) {
		try {
			// First check current 2FA status
			const statusResponse = await fetch('/api/2fa/status', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
				},
			});
			
			if (!statusResponse.ok) {
				throw new Error('Failed to fetch 2FA status');
			}
	
			const statusResult = await statusResponse.json();
			const is2FAEnabled = statusResult.is_2fa_enabled;

	
	
			if (is2FAEnabled) {
				const verificationResponse = await fetch('/api/2fa/request-verification', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
					}
				});
	
				if (!verificationResponse.ok) {
					throw new Error('Failed to request verification code');
				}
	
				window.loadComponentNotify('notification', appContainer, {
					message: 'A verification code has been sent to your email. Please check your inbox.',
					type: "info"
				});
				await new Promise(resolve => setTimeout(resolve, 5000));
				const verificationCode = prompt(
					'Please enter the 6-digit verification code sent to your email to disable two-factor authentication. ' +
					'The code will expire in 2 minutes.'
				);
	
				if (!verificationCode) {
					return; 
				}
	
				const manageResponse = await fetch('/api/2fa/manage', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
					},
					body: JSON.stringify({ code: verificationCode })
				});
	
				const manageResult = await manageResponse.json();
	
				if (manageResponse.ok) {
					window.loadComponentNotify('notification', appContainer, {
						message: manageResult.message,
						type: "info"
					});
					localStorage.setItem('is_2fa_enabled', 'false');
					status_2faElement.textContent = 'Disabled';
					status_2fabtnElement.textContent = 'Enable';
				} else {
					window.loadComponentNotify('notification', appContainer, {
						message: manageResult.error || 'Failed to disable two-factor authentication.',
						type: "error"
					});
				}
			} else {
				// Directly enable 2FA without verification code
				const manageResponse = await fetch('/api/2fa/manage', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
					},
					body: JSON.stringify({ enable: true })
				});
	
				const manageResult = await manageResponse.json();
	
				if (manageResponse.ok) {
					localStorage.setItem('is_2fa_enabled', 'false');
					window.loadComponentNotify('notification', appContainer, {
						message: 'Two-factor authentication has been enabled successfully.',
						type: "info"
					});
					window.loadComponentNotify('notification', appContainer, {
						message: 'Please make sure third-party users cannot use 2fa option',
						type: "waring"
					});


					status_2faElement.textContent = 'Enabled';
					status_2fabtnElement.textContent = 'Disable';
				} else {
					window.loadComponentNotify('notification', appContainer, {
						message: manageResult.error || 'Failed to enable two-factor authentication.',
						type: "error"
					});
				}
			}
		} catch (error) {
			window.loadComponentNotify('notification', appContainer, {
				message: "An unexpected error occurred. Please try again later.",
				type: "error"
			});
			console.error('2FA management error:', error);
		}
	});


})(this);
