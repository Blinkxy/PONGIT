// Function to show the sidebar
window.showSidebar =  function(container, componentName, sidebarName, hideTimeout, option, duration = 1000) {
    // Remove any existing sidebar component with the same type
    const existingComponent = container.querySelector(componentName);
    if (existingComponent) {
        existingComponent.remove();
    }

    // Create a new sidebar component and add it to the container
    const sidebarComponent = document.createElement(componentName);
    container.appendChild(sidebarComponent);

    // Listen for when the content inside the component is fully loaded
    sidebarComponent.addEventListener('content-loaded', () => {
        const sidebar = sidebarComponent.querySelector('.' + sidebarName);

	if (option)
	{
		const ele = document.querySelector('.sidebar-container .friends .nav > .select-box');
		if (ele.classList.contains('close'))
		{
			ele.classList.replace('close', 'open');
			ele.children[0].children[2].setAttribute('class', 'i-right fa-solid fa-angle-up');
			//ele.children[0].children[2].className = 'i-right fa-solid fa-angle-up';
			ele.nextElementSibling.style.display = 'block';
		}
		else
		{
			ele.classList.replace('open', 'close');
			ele.children[0].children[2].setAttribute('class', 'i-right fa-solid fa-angle-down');
			ele.nextElementSibling.style.display = 'none';
		}
	}
	

        // Apply the hover effect
        // sidebar.classList.add('hover');
        // sidebar.classList.remove('leave');

        // Trigger hover effect with a delay
        setTimeout(() => {
            sidebar.classList.add('hover');
       		sidebar.classList.remove('leave');
			if (option)
			{
				sidebar.classList.add('borderAnimation');
				const paddleIcon = document.querySelectorAll('.sidebar-container .friends .nav .drop-down.my-friends .select-box .actions a.third');
				paddleIcon.forEach(li => {
					li.classList.add('iconAnimation');
					li.addEventListener('click', ()=> {
						// use fetch request to get the clicked friend data

						// get the name of the friend that the owner click on
						const friendName = li.parentElement.parentElement.children[0].children[0].children[2].textContent;
						window.friendListGlobal.forEach(async friend => {
							if (friend.friend_username === friendName)
							{
								try {
									const response = await fetch('/api/tournament/invitation/', {
										method: 'POST',
										headers: {
											'Content-Type': 'application/json',
											'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
										},
										body: JSON.stringify({ invite_recipient: friend.id }),
									});
									if (response.ok) {
										alert('Invitation sent successfully');
									} else {
										const errorData = await response.json();
										console.error("Error sending invitation:", errorData);
								
										// Extract a meaningful error message
										let errorMessage = "An error occurred while sending the invitation.";
								
										if (errorData.non_field_errors) {
											errorMessage = errorData.non_field_errors.join(", ");
										} else if (errorData.error) {
											errorMessage = errorData.error; // Handle specific error field
										} else if (errorData.detail) {
											errorMessage = errorData.detail; // Handle DRF's default "detail" field
										}
								
										// Display the error message
										alert(`Failed to send invitation: ${errorMessage}`);
									}
								} catch (error) {
									console.error("Unexpected error:", error);
									alert(`An unexpected error occurred: ${error.message}`);
								}
								return;

								
							}
						})

						// when the owner click on paddle icon
						li.children[0].style.color = "#63E6BE";
						li.classList.remove('iconAnimation');


					})
				})
				// when click on paddle icon that exist in friends list
				// const paddleBtn = document.querySelectorAll('.sidebar-container .my-friends .actions a.third');
				// paddleBtn.forEach(li => {
				// 	li.addEventListener('click', ()=> {
				// 		li.children[0].style.color = "#63E6BE";
				// 	})
				// })
			}
        }, 100);

        // Start the timer to hide the sidebar if no interaction
        window.startHideTimer(hideTimeout, duration, () => hideSidebar(sidebarComponent, sidebarName, option, duration));

        // Clear the hide timer on mouse enter
        sidebar.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout.current);
        });

        // Restart the hide timer on mouse leave
        sidebar.addEventListener('mouseleave', () => {
            window.startHideTimer(hideTimeout, duration, () => hideSidebar(sidebarComponent, sidebarName));
        });
    });

    // Reset the hide timer whenever the sidebar is shown
    window.startHideTimer(hideTimeout, duration, () => hideSidebar(sidebarComponent, sidebarName));
};

// Function to hide the sidebar
function hideSidebar(sidebarComponent, sidebarName, option) {	
    if (!sidebarComponent) return;

    const sidebar = sidebarComponent.querySelector('.' + sidebarName);
    if (!sidebar) return;

    // Add the leave effect
    sidebar.classList.add('leave');
    sidebar.classList.remove('hover');
	if (option)
	{
		sidebar.classList.remove('borderAnimation');
		const paddleIcon = document.querySelectorAll('.sidebar-container .friends .nav .drop-down.my-friends .select-box .actions a.third');
		paddleIcon.forEach(li => {
			li.classList.remove('iconAnimation');
		})
	}
	// Remove the sidebar component after the leave animation
    setTimeout(() => {
        sidebarComponent.remove();
    }, 300); // Adjust timeout to match the CSS animation duration
}

// Function to start the timeout
window.startHideTimer = function (hideTimeout,duration, callback) {
    // Clear any existing timeout
    clearTimeout(hideTimeout.current);

    // Start a new timeout
    hideTimeout.current = setTimeout(callback, duration); // 10 seconds
};

