(function initializeChatComponent(component) {

    const appContainer = document.querySelector('.container');
	// click on enter that exist in keyboard
	const input = document.querySelector(`.add-channel-container .input-msg input`);
	input.addEventListener('keypress', (e) => {
		if (e.key == 'Enter')
		{
			console.log('hello from keyboard');
		}
	});

	// click on change username button
    const add = document.querySelector('.add-channel-container .actions a.add');
    add.addEventListener('click', async () => {
        const new_username = input.value;
        if (!new_username) {
            console.error("Username cannot be empty.");
            window.loadComponentNotify('notification', appContainer, {
                message: "Please enter a valid username.", 
                type: "error"
            });
            return;
        }
        try {
            const response = await fetch("/api/user/change/username", {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ new_username: new_username }),
            });
            if (response.ok) {
                const data = await response.json();
                console.log(data.message);
                window.loadComponentNotify('notification', appContainer, {
                    message: `Username successfully updated. to ${data.new_username}`,
                    type: "info"
                });
				localStorage.setItem('username', new_username);
				const usernameElement = document.getElementById('username');
				if (usernameElement) {
					usernameElement.textContent = new_username;
				}
				const container = cancel.parentElement.parentElement.parentElement;
				container.remove();
                input.value = '';
            } else {
                const errorData = await response.json();
                console.error(errorData.error);
                window.loadComponentNotify('notification', appContainer, {
                    message: `Error: ${errorData.error}`,
                    type: "error"
                });
                
            }
        } catch (error) {
            console.error("Network or server error:", error);
            window.loadComponentNotify('notification', appContainer, {
                message: "An error occurred while updating the username. Please try again.",
                type: "error"
            });
        }
    });

	// click on cancel button
    const cancel = component.document.querySelector('.add-channel-container .actions .cancel');
    cancel.addEventListener('click', () => {
        const container = cancel.parentElement.parentElement.parentElement;
        console.log('Removing chat component:', container);
        container.remove();
    });
})(this);
