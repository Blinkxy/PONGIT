(function initializeChatComponent(component) {
    

    // Setting 2fa variables
    console.log(localStorage);
    const QrCodeElement = document.getElementById('qr-code-img');
    const MessageElement = document.getElementById('message-2fa');


    if (localStorage.getItem("qr_code_url") != "null") {
        MessageElement.value = "Scan the QR code with your authenticator app";
        console.log(localStorage.getItem("qr_code_url"));
        const qrimg = '/api/media/' + localStorage.getItem("qr_code_url");
        QrCodeElement.src = qrimg;
    } else {
        QrCodeElement.src = "../assets/imgs/qr_code.png";
        MessageElement.value = "Please enter the code in your authenticator app";

    }

    QrCodeElement.alt = `Qr code`;

	
	document.addEventListener('DOMContentLoaded', function() {

		
	});

	const closeBtn = document.querySelector('.twofa-container .close-btn');
	const verifyBtn = document.querySelector('.twofa-container .verify-btn');
	const input = document.querySelector('.twofa-container .verification-input');
	const errorMessage = document.querySelector('.twofa-container .error-message');

	closeBtn.addEventListener('click', function() {
		console.log('Popup closed');
	});

	input.addEventListener('input', function(e) {
		this.value = this.value.replace(/[^0-9]/g, '');
	});

	verifyBtn.addEventListener('click', function() {
		const code = input.value;
		
		if (code.length !== 6) {
			errorMessage.style.display = 'block';
			return;
		}

		errorMessage.style.display = 'none';
		
		
		input.disabled = true;
		verifyBtn.disabled = true;
		
		setTimeout(() => {
			console.log('Verification successful, popup closing');
		}, 2000);
	});




	


})(this);

// const appContainer = document.querySelector("container"); 



document.querySelector('.verify-btn').addEventListener('click', async function(event) {
    
    event.preventDefault();
    const verificationCode = document.querySelector('.verification-input').value;
    
    const username = localStorage.getItem("temp_username");
    const password = localStorage.getItem("temp_password");

    if (!username || !password || verificationCode.length !== 6) {
        // window.loadComponentNotify('notification', appContainer, {
        //     message: 'Please enter a valid username, password, and 6-digit verification code', 
        //     type: "error"
        // });
        return;
    }

    try {
        const response = await fetch('/api/validating-2fa/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
                totp_code: verificationCode,
            })
        });

        const result = await response.json();

        if (response.ok) {
            
            localStorage.setItem('accessToken', result.tokens.access);
            localStorage.setItem('refreshToken', result.tokens.refresh);
            localStorage.setItem('id', result.user.id);
            localStorage.setItem('username', result.user.username);
            localStorage.setItem('profile_image',  result.user.profile.profile_image);

            window.loadComponentNotify('notification', appContainer, {
                message: "2FA verification successful!", 
                type: "success"
            });
            localStorage.removeItem('temp_username');
            localStorage.removeItem('temp_password');
            localStorage.removeItem('user_id');
            localStorage.removeItem('qr_code_url');
            localStorage.removeItem('totp_secret');

            
            window.history.pushState({}, '', `/profile`);
			window.loadComponent2('profile', appContainer);
			localStorage.setItem('appState', JSON.stringify({ activeLink: 'profile', route: '/profile' }));
            if (!document.querySelector("nav-component")) {
			    const newComponent = document.createElement('nav-component');
				// appContainer.style.backgroundImage = "url('../assets/imgs/bg.png')";
			    appContainer.appendChild(newComponent);
            }
            
        } else {

            const twofainput = document.getElementById('twofa-input');
            const twofabtn = document.getElementById('twofa-valid');
            twofainput.value = "";
            twofainput.placeholder = "000000";
            twofainput.disabled = false;
            twofabtn.disabled = false;
            twofainput.focus();


            window.loadComponentNotify('notification', appContainer, {
                message: "Wrong verification code, please try again", 
                type: "error"
            });
        }
    } catch (error) {
        window.loadComponentNotify('notification', appContainer, {
            message: "An error occurred while verifying 2FA", 
            type: "error"
        });

        console.error('Error during 2FA validation:', error);
        // window.loadComponentNotify('notification', appContainer, {
        //     message: 'An error occurred while verifying 2FA', 
        //     type: "error"
        // });
    }
});
