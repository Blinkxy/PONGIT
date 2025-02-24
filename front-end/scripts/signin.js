
const appContainer = document.querySelector('.container');

const alertStyles = `
.custom-alert {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #4a90e2, #9b51e0);
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  transform: translateX(120%);
  transition: transform 0.3s ease-in-out;
  z-index: 1000;
}

.custom-alert.show {
  transform: translateX(0);
}

.close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 20px;
  padding: 0;
  margin-left: 8px;
}`;

// Function to initialize the alert system
function initializeCustomAlert() {
  // Add styles to the document
  const styleSheet = document.createElement("style");
  styleSheet.textContent = alertStyles;
  document.head.appendChild(styleSheet);
}


(function initializeChatComponent(component) {

const active = document.querySelector('.sign .sign-in .links .active');
const inactive = document.querySelector('.sign .sign-in .links .inactive');
const form1 = document.querySelector('.sign .sign-in .show');
const form2 = document.querySelector('.sign .sign-in .hidden');

inactive.addEventListener('click', ()=> {
	inactive.classList.replace('inactive', 'active');
	active.classList.replace('active', 'inactive');
	form1.classList.replace('show', 'hidden');
	form2.classList.replace('hidden', 'show');
})

active.addEventListener('click', ()=> {
	inactive.classList.replace('active', 'inactive');
	active.classList.replace('inactive', 'active');
	form1.classList.replace('hidden', 'show');
	form2.classList.replace('show', 'hidden');
})

const btnContinue = document.getElementsByClassName('btn-continue')[0];
const email = document.getElementById('email');
const pwd = document.getElementById('pwd');

// for testing
// btnContinue.addEventListener('click', ()=>{
// 	if (email.value == 'brahim' && pwd.value == '123')
// 	{
// 		// window.location.host += "/home";
// 		console.log(window.location.host);
// 		const container = document.querySelector('.container');
// 		// Remove any existing component
// 		const existingComponent = container.querySelector('sign-component');
// 		if (existingComponent) {
// 		existingComponent.remove();
// 		}

// 		// Create a new game component and add it to the container
// 		const navComponent = document.createElement('nav-component');
// 		container.appendChild(navComponent);
// 	}
// })

// const passwords = document.querySelectorAll
const eye_icon = document.querySelectorAll('input + i'); 
eye_icon.forEach(li => {
	li.addEventListener('click', (e)=> {
		const input = e.target.closest('.show-pwd').children[0];
		if (li.className == "fa-solid fa-eye")
		{
			li.className = "fa-solid fa-eye-slash";
			input.type = "password";
		}
		else 
		{
			li.className = "fa-solid fa-eye";
			input.type = "text";
		}
	})
})

// when click on forget password link
const forgot_pwd = document.querySelector('.sign-in .form-signin .forgot a');
const sign = document.querySelector('.sign');
const forget = document.querySelector('.forget-pwd');
forgot_pwd.addEventListener('click', ()=>{
	forget.classList.remove('hidden');
	forget.classList.add('show');
	sign.classList.remove('show');
	sign.classList.add('hidden');
    

    console.log('forget password clicked');



})




// start including 2fa
document.querySelector('.btn-signin').addEventListener('click', async function(event) {
    event.preventDefault();
    const username = document.getElementById('email').value.trim();
    const password = document.getElementById('pwd').value.trim();
    if (!username || !password) {
        window.loadComponentNotify('notification', appContainer, {
            message: "Please fill in both username and password.", 
            type: "error"
        });
        return;
    }
    try {
        const loginResponse = await fetch('/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const loginData = await loginResponse.json();

        if (!loginResponse.ok) {
            throw new Error(loginData.error || "Login failed");
        }

        if (loginData.requires_2fa) {
            const setupResponse = await fetch('/api/validating-2fa/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const setupData = await setupResponse.json();

            if (!setupResponse.ok) {
                throw new Error(setupData.error || "Failed to setup 2FA");
            }

            // console.log(loginData);
            localStorage.setItem('temp_username', username);
            localStorage.setItem('temp_password', password);
            localStorage.setItem('qr_code_url', setupData.qr_code_url);
            localStorage.setItem('totp_secret', setupData.totp_secret);
            


            window.history.pushState({}, '', `/2fa`);
			window.loadComponent2('2fa', appContainer);
			localStorage.setItem('appState', JSON.stringify({ activeLink: '2fa', route: '/2fa' }));
            return;
        }

        if (loginData.tokens && loginData.tokens.access) {
            handleSuccessfulLogin(loginData);
        }

    } catch (error) {
        window.loadComponentNotify('notification', appContainer, {
            message: "Login failed. Please try again.", 
            type: "error"
        });
    }
});
function handleSuccessfulLogin(loginData) {
    if (loginData.tokens && loginData.tokens.access) {
        localStorage.setItem('accessToken', loginData.tokens.access);
        localStorage.setItem('refreshToken', loginData.tokens.refresh);
        localStorage.setItem('id', loginData.user.id);
        localStorage.setItem('username', loginData.user.username);
        localStorage.setItem('profile_image', loginData.user.profile.profile_image);
        localStorage.setItem('2fa_status', loginData.user.profile.is_2fa_enabled);
        console.log(loginData.user.profile.is_2fa_enabled);
        // window.socket();
        window.loadComponentNotify('notification', appContainer, {
            message: "Login successful!", 
            type: "success"
        });

		// Redirect to /game after successful Login ...
		setTimeout(() => {
			// const canvas = document.getElementById('canvas');
			// canvas.remove();
			const leftBtn = document.querySelector('.container .left');
			leftBtn.style.display = 'block';

			const rightBtn = document.querySelector('.container .right');
			rightBtn.style.display = 'block';

			// create navbar
	        // console.log(document.querySelector("nav-component") , " signin")

            if (!document.querySelector("nav-component")) {
			    const newComponent = document.createElement('nav-component');
			    appContainer.appendChild(newComponent);
            }

			window.history.pushState({}, '', `/profile`);
			window.loadComponent2('profile', appContainer);
			localStorage.setItem('appState', JSON.stringify({ activeLink: 'profile', route: '/profile' }));
			
		}, 2000); // Delay for 1.5 seconds
		// setTimeout(()=> {
		// 	window.history.pushState({}, '', `/profile`);
		// 	window.loadComponent2('profile', appContainer);
		// }, 2000)

    } else {
        window.loadComponentNotify('notification', appContainer, {
            message: "Login failed: No token returned", 
            type: "error"
        });
    }
}



document.querySelector('.btn-42').addEventListener('click', async function(event) {
    OpenPopUp();
});

document.querySelector('.btn-gmail').addEventListener('click', async function(event) {
    OpenPopUpG();
});





// 42 API

function OpenPopUp() {
    const SERVER_CONFIG = {
        auth_url: '/api/intra-login/',
        status_url: '/api/auth-status/',
    };

    console.log('Starting authentication request to:', SERVER_CONFIG.auth_url);

    fetch(SERVER_CONFIG.auth_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        credentials: 'include',
    })
        .then(async (response) => {
            if (!response.ok) {
                const data = await response.json();
                throw new Error(`Server responded with status: ${response.status} - ${data.message}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log('Storing auth URL:', data.auth_url);
            const popup = openPopup(data.auth_url);

            // Check the status URL to confirm authentication
            const checkAuthStatus = setInterval(() => {
                fetch(SERVER_CONFIG.status_url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    credentials: 'include',
                })
                    .then(async (response) => {
                        if (!response.ok) {
                            const data = await response.json();
                            throw new Error(`Server responded with status: ${response.status} - ${data.message}`);
                        }
                        return response.json();
                    })
                    .then((data) => {
                        if (data.status === 'success') {
                            clearInterval(checkAuthStatus);
                            // alert(`Authenticated as ${data.username}`);
                            // console.log('User authenticated:', data);
                            console.log(data);
                            
                            // Store tokens in localStorage
                            localStorage.setItem('accessToken', data.token.access);
                            localStorage.setItem('refreshToken', data.token.refresh);
                            localStorage.setItem('id', data.id);
                            localStorage.setItem('username', data.username);
                            localStorage.setItem('profile_image',  data.profile_image);

                            popup.close();
                            if (!document.querySelector("nav-component")) {
                                const newComponent = document.createElement('nav-component');
                                appContainer.appendChild(newComponent);
                            }
                
                            window.history.pushState({}, '', `/profile`);
                            window.loadComponent2('profile', appContainer);
                            localStorage.setItem('appState', JSON.stringify({ activeLink: 'profile', route: '/profile' }));

                            window.loadComponentNotify('notification', appContainer, {
                                message: "Login successful!",
                                type: "success"
                            });

                        } else if (data.status === 'pending') {
                            console.log('Authentication pending...');
                        }
                    })
                    .catch((error) => {
                        console.error('Error during the auth status check:', error);
                    });
            }, 1000); // Check every second
        })
        .catch((error) => {
            console.error('Error during the initial auth fetch:', error);
            alert(`Auth failed: ${error.message}`);
        });
}



function openPopup(authUrl) {
    const popupWidth = 800;
    const popupHeight = 800;
    const left = window.screen.width / 2 - popupWidth / 2;
    const top = window.screen.height / 2 - popupHeight / 2;
    const params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
        width=${popupWidth},height=${popupHeight},left=${left},top=${top}`;

    return window.open(authUrl, 'IntraAuth', params);
}










// document.querySelector('.btn-signup').addEventListener('click', function(event) {
//     event.preventDefault();

//     const fname = document.getElementById('fname').value.trim();
//     const lname = document.getElementById('lname').value.trim();
//     const username = document.getElementById('username').value.trim();
//     const email_signup = document.getElementById('email_signup').value.trim();
//     const password = document.getElementById('password').value;
//     const confirm_password = document.getElementById('confirm-password').value;

//     let errors = [];
//     if (fname === '') {
//         errors.push('First name cannot be empty');
//     } else if (fname.length < 2) {
//         errors.push('First name must be at least 2 characters long');
//     } else if (!/^[A-Za-z]+$/.test(fname)) {
//         errors.push('First name can only contain letters');
//     }

//     if (lname === '') {
//         errors.push('Last name cannot be empty');
//     } else if (lname.length < 2) {
//         errors.push('Last name must be at least 2 characters long');
//     } else if (!/^[A-Za-z]+$/.test(lname)) {
//         errors.push('Last name can only contain letters');
//     }

//     if (username === '') {
//         errors.push('Username cannot be empty');
//     } else if (username.length < 4) {
//         errors.push('Username must be at least 4 characters long');
//     } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
//         errors.push('Username can only contain letters, numbers, and underscores');
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (email_signup === '') {
//         errors.push('Email cannot be empty');
//     } else if (!emailRegex.test(email_signup)) {
//         errors.push('Please enter a valid email address');
//     }

//     if (password === '') {
//         errors.push('Password cannot be empty');
//     } else if (password.length < 8) {
//         errors.push('Password must be at least 8 characters long');
//     }

//     if (confirm_password === '') {
//         errors.push('Confirm password cannot be empty');
//     } else if (password !== confirm_password) {
//         errors.push('Passwords do not match');
//     }

//     if (errors.length > 0) {
//         const errorMessage = errors.join('\n');
//         window.loadComponentNotify('notification', appContainer, {
//             message: errorMessage, 
//             type: "error"
//         });
//         return false;
//     }

//     const formData = {
//         first_name: fname,
//         last_name: lname,
//         username: username,
//         email: email_signup,
//         password: password,
//     };

//     console.log(formData)


//     fetch('/api/signup/', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData)
//     })
//     .then(response => {
//         if (!response.ok) {
//             return response.json().then(errorData => {
//                 throw new Error(errorData.error || 'Failed to sign up');
//             });
//         }
//         return response.json();
//     })
//     .then(data => {
//         console.log(data);
//         window.loadComponentNotify('notification', appContainer, {
//             message: "Sign up successful! Please check your email", 
//             type: "success"
//         });
//     })
//     .catch(error => {
//         console.error('Error:', error);
//         window.loadComponentNotify('notification', appContainer, {
//             message: error.message || 'An error occurred while processing your request.', 
//             type: "error"
//         });
//     });


// });





document.querySelector('.btn-signup').addEventListener('click', function(event) {
    event.preventDefault();

    // Show loading state
    const button = this;
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Signing up...';

    const fname = document.getElementById('fname').value.trim();
    const lname = document.getElementById('lname').value.trim();
    const username = document.getElementById('username').value.trim();
    const email_signup = document.getElementById('email_signup').value.trim();
    const password = document.getElementById('password').value;
    const confirm_password = document.getElementById('confirm-password').value;

    let errors = [];
    
    // Client-side validations
    if (fname === '') {
        errors.push('First name cannot be empty');
    } else if (fname.length < 2) {
        errors.push('First name must be at least 2 characters long');
    } else if (!/^[A-Za-z]+$/.test(fname)) {
        errors.push('First name can only contain letters');
    }

    if (lname === '') {
        errors.push('Last name cannot be empty');
    } else if (lname.length < 2) {
        errors.push('Last name must be at least 2 characters long');
    } else if (!/^[A-Za-z]+$/.test(lname)) {
        errors.push('Last name can only contain letters');
    }

    if (username === '') {
        errors.push('Username cannot be empty');
    } else if (username.length < 4) {
        errors.push('Username must be at least 4 characters long');
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.push('Username can only contain letters, numbers, and underscores');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email_signup === '') {
        errors.push('Email cannot be empty');
    } else if (!emailRegex.test(email_signup)) {
        errors.push('Please enter a valid email address');
    }

    if (password === '') {
        errors.push('Password cannot be empty');
    } else if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (confirm_password === '') {
        errors.push('Confirm password cannot be empty');
    } else if (password !== confirm_password) {
        errors.push('Passwords do not match');
    }

    if (errors.length > 0) {
        const errorMessage = errors.join('\n');
        window.loadComponentNotify('notification', appContainer, {
            message: errorMessage, 
            type: "error"
        });
        // Reset button state
        button.disabled = false;
        button.textContent = originalText;
        return false;
    }

    const formData = {
        first_name: fname,
        last_name: lname,
        username: username,
        email: email_signup,
        password: password,
    };

    // Show loading message
    // window.loadComponentNotify('notification', appContainer, {
    //     message: "Creating your account...", 
    //     type: "info"
    // });

    fetch('/api/signup/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                // Check if the error is a string or an object
                const errorMessage = typeof errorData.error === 'string' 
                    ? errorData.error 
                    : Object.values(errorData).flat().join('\n');
                throw new Error(errorMessage);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        
        // Clear the form
        document.getElementById('fname').value = '';
        document.getElementById('lname').value = '';
        document.getElementById('username').value = '';
        document.getElementById('email_signup').value = '';
        document.getElementById('password').value = '';
        document.getElementById('confirm-password').value = '';

        // Show success message
        window.loadComponentNotify('notification', appContainer, {
            message: "Sign up successful! Please check your email for verification link. The link will expire in 2 minutes.", 
            type: "success"
        });

        // Optional: Show a modal or additional information about email verification
        if (typeof showVerificationModal === 'function') {
            showVerificationModal(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // window.loadComponentNotify('notification', appContainer, {
        //     message: error.message || 'An error occurred while processing your request.', 
        //     type: "error"
        // });
    })
    .finally(() => {
        // Reset button state
        button.disabled = false;
        button.textContent = originalText;
    });
});

// Optional: Add a function to show a modal with verification instructions
function showVerificationModal(message) {
    // If you have a modal component
    window.loadComponent('modal', appContainer, {
        title: 'Email Verification Required',
        content: `
            <div class="text-center">
                <p>${message}</p>
                <p>Please check your email and click the verification link to complete your registration.</p>
                <p>Note: The verification link will expire in 2 minutes.</p>
            </div>
        `
    });
}









function OpenPopUpG() {
    const SERVER_CONFIG = {
        auth_url: '/api/auth/google/',
        status_url: '/api/auth/google/callback/',
    };

    console.log('Starting authentication request to:', SERVER_CONFIG.auth_url);

    fetch(SERVER_CONFIG.auth_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        credentials: 'include',
    })
        .then(async (response) => {
            if (!response.ok) {
                const data = await response.json();
                throw new Error(`Server responded with status: ${response.status} - ${data.message}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log('Storing auth URL:', data.auth_url);
            const popup = openPopup(data.auth_url);

            const checkAuthStatus = setInterval(() => {
                fetch(SERVER_CONFIG.status_url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    credentials: 'include',
                })
                    .then(async (response) => {
                        if (!response.ok) {
                            const data = await response.json();
                            throw new Error(`Server responded with status: ${response.status} - ${data.message}`);
                        }
                        return response.json();
                    })
                    .then((data) => {
                        if (data.status === 'success') {
                            clearInterval(checkAuthStatus);
                            alert(`Authenticated as ${data.username}`);
                            console.log('User authenticated:', data);
                            
                            localStorage.setItem('id', data.id);
                            localStorage.setItem('username', data.username);
                            localStorage.setItem('profile_image',  data.profile_image);
                            localStorage.setItem('accessToken', data.token.access);
                            localStorage.setItem('refreshToken', data.token.refresh);

                        } else if (data.status === 'pending') {
                            console.log('Authentication pending...');
                        }
                    })
                    .catch((error) => {
                        console.error('Error during the auth status check:', error);
                    });
            }, 1000); // Check every second
        })
        .catch((error) => {
            console.error('Error during the initial auth fetch:', error);
            alert(`Auth failed: ${error.message}`);
        });
}



function openPopupG(authUrl) {
    const popupWidth = 800;
    const popupHeight = 800;
    const left = window.screen.width / 2 - popupWidth / 2;
    const top = window.screen.height / 2 - popupHeight / 2;
    const params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
        width=${popupWidth},height=${popupHeight},left=${left},top=${top}`;

    return window.open(authUrl, 'IntraAuth', params);
}



document.querySelector('.btn-forget-pwd').addEventListener('click', async function(event) {
    event.preventDefault();
    console.log("Forget password button clicked");

    const Email = document.getElementById('email_forget').value.trim();
    console.log(Email);

    if (Email === '') {
        alert('Email cannot be empty');
        return false;
    }

    try {
        const response = await fetch('/api/user/request-reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: Email })
        });

        const data = await response.json();
        
        if (response.ok) {
            window.loadComponentNotify('notification', appContainer, {
                message: data.message || 'Reset email sent successfully',
                type: "success"
            });

            const forget = document.querySelector('.forget-pwd');
            forget.classList.remove('show');
            forget.classList.add('hidden');
            const sign = document.querySelector('.sign');
            sign.classList.remove('hidden');
            sign.classList.add('show');



        } else {
            window.loadComponentNotify('notification', appContainer, {
                message: data.error || 'Failed to send reset email', 
                type: "error"
            });
        }
    } catch (error) {
        console.error('Error:', error);
        window.loadComponentNotify('notification', appContainer, {
            message: error.message || 'An error occurred while processing your request.', 
            type: "error"
        });
    }
});



// const canvas = document.getElementById('canvas');
//         const ctx = canvas.getContext('2d');
//         const leftPaddle = document.querySelector('.left');
//         const rightPaddle = document.querySelector('.right');

//         function resizeCanvas() {
//             canvas.width = window.innerWidth;
//             canvas.height = window.innerHeight;
//         }
//         resizeCanvas();
//         window.addEventListener('resize', resizeCanvas);

//        class Ball {
//     constructor() {
//         this.reset();
//     }

//     reset() {
//         this.size = 13; // Ball size
//         this.x = canvas.width / 2;
//         this.y = canvas.height / 2;
//         this.speed = 5; // Set the same speed for all balls
//         this.dx = (Math.random() - 0.5) * this.speed;
//         this.dy = (Math.random() - 0.5) * this.speed;
//         this.trail = [];
//         this.trailLength = 10;
//         this.color = '#C3C2C2'; // Light cyan color
//     }

//     update() {
//         this.trail.push({ x: this.x, y: this.y });
//         if (this.trail.length > this.trailLength) {
//             this.trail.shift();
//         }

//         this.x += this.dx;
//         this.y += this.dy;

//         if (this.x - this.size < 0 || this.x + this.size > canvas.width) {
//             this.dx = -this.dx;
//         }
//         if (this.y - this.size < 0 || this.y + this.size > canvas.height) {
//             this.dy = -this.dy;
//         }
//     }

//     draw() {
//         this.trail.forEach((pos, index) => {
//             const alpha = index / this.trail.length;
//             ctx.beginPath();
//             //ctx.fillStyle = `rgba(0, 255, 255, ${alpha * 1})`; // Trail is light cyan with fading alpha
//             ctx.arc(pos.x, pos.y, this.size * (index / this.trail.length), 0, Math.PI * 2);
//             ctx.fill();
//         });

//         ctx.beginPath();
//         ctx.fillStyle = this.color; // Ball color is light cyan
//         ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
//         ctx.fill();
//     }
// }

//         // Paddle movement
//         let paddleSpeed = 2;
//         let leftDirection = 1;
//         let rightDirection = -1;

//         function movePaddles() {
// 			if (isAuthenticated())
// 			{
// 				// Apply new positions
// 				leftPaddle.style.top = `calc(50% - 75px)`;
// 				rightPaddle.style.top = `calc(50% - 75px)`;
// 				return;
// 			}
//             // Get current positions
//             let leftTop = parseFloat(leftPaddle.style.top) || (window.innerHeight / 2 - 75);
//             let rightTop = parseFloat(rightPaddle.style.top) || (window.innerHeight / 2 - 75);

//             // Update positions
//             leftTop += paddleSpeed * leftDirection;
//             rightTop += paddleSpeed * rightDirection;

//             // Check boundaries and reverse direction
//             if (leftTop <= 0 || leftTop + 150 >= window.innerHeight) {
//                 leftDirection *= -1;
//             }
//             if (rightTop <= 0 || rightTop + 150 >= window.innerHeight) {
//                 rightDirection *= -1;
//             }

//             // Apply new positions
// 				leftPaddle.style.top = `${leftTop}px`;
// 				rightPaddle.style.top = `${rightTop}px`;
//         }

//         const balls = Array(3).fill().map(() => new Ball());

//         function animate() {
//             // ctx.fillStyle = 'rgba(26, 26, 46, 0.2)';
//             // ctx.fillRect(0, 0, canvas.width, canvas.height);

//             // balls.forEach(ball => {
//             //     ball.update();
//             //     ball.draw();
//             // });

//             // movePaddles();

//             // requestAnimationFrame(animate);

// 			// Clear the canvas to remove previous frames
// 			ctx.clearRect(0, 0, canvas.width, canvas.height);

// 			setInterval(() => {
// 				if (!isAuthenticated())
// 				{
// 				}
				
// 			}, 100);
// 			balls.forEach(ball => {
// 				if (!isAuthenticated())
// 				{
// 					ball.update();
// 					ball.draw();

// 				}
// 			});
		
// 			movePaddles();
		
// 			requestAnimationFrame(animate);
//         }
// 		function isAuthenticated() {
// 			const accessToken = localStorage.getItem('accessToken');
// 			// Add further checks if needed, e.g., verify token expiry
// 			return accessToken !== null;
// 		}

// 		// if (window.location.pathname == '/')
// 		// 	animate();
// 		animate();
	})(this);