
(function initializeSidebarComponent(component) 
{
	
	// const sidebar = component.querySelector('.sidebar-right');
	const friends = component.querySelector('.sidebar-right .friends .nav .drop-down');
	// console.log("br", friends);
	


	// Select the button and container

	// Code for the Right Sidebar
	const rightSide = document.querySelector('.sidebar-right');
	const rightHideTimeout = { current: null };

	// rightSide.addEventListener('mouseover', () => {
	// clearTimeout(rightHideTimeout.current); // Clear any existing timeout
	// window.showSidebar(container, 'right-sidebar-component', 'sidebar-right', rightHideTimeout);
	// });

	// rightSide.addEventListener('mouseleave', () => {
	// console.log("Right sidebar mouseleave");
	// window.startHideTimer(rightHideTimeout, () => {
	// 	const sidebarComponent = container.querySelector('right-sidebar-component');
	// 	hideSidebar(sidebarComponent, 'sidebar-right');
	// });
	// });

	// Function to reset the hide timer
	window.resetHideTimer = function(){
		clearTimeout(rightHideTimeout.current); // Clear any existing timeout
		window.startHideTimer(rightHideTimeout, () => {
			const sidebarComponent = document.querySelector('right-sidebar-component');
			hideSidebar(sidebarComponent, 'sidebar-right');
		});
	}

	// Clear the hide timer when mouse enters the sidebar
	rightSide.addEventListener('mouseover', () => {
		clearTimeout(rightHideTimeout.current);
	});

	// Restart the hide timer when mouse leaves the sidebar
	rightSide.addEventListener('mouseleave', resetHideTimer);

	// Start the timer initially (when the sidebar is shown)
	resetHideTimer();

	// when the user clicks on the profile or the paddle ...
	friends.addEventListener('click', async (e) =>
	{
		const hh = e.target.closest(".select-box .profile a");
		const hh2 = e.target.closest(".select-box .actions a");
		
        if (hh)
            await window.loadComponent3(container, 'chat', hh.children[1].textContent);
		else if (hh2)
		{
			console.log("paddle clicked");
			return; // Exit the function if recipient is not found
		}
		if (window.Chatsocket)
		{
			console.log('SOCKET STILL OPEN !!!');
			window.Chatsocket.close();
			window.Chatsocket = null;
		}
		const recipient = hh.children[1].textContent;
		console.log("Recipient: ", recipient);
		const user = window.friendListGlobal.find(friend => friend.friend_username === recipient);
        const sender = await getUserData();
		chat_history = await fetchChatHistory(sender.username, recipient);
		if (chat_history)
		{
			for ( var i = 0; i < chat_history.length; i++ )
			{
				if (chat_history[i].sender === recipient)
					await renderMessage(chat_history[i].sender, chat_history[i].content, user);
				else
					await renderMessage("You", chat_history[i].content, sender);
			}
			scrollToBottom(); // Scroll to the bottom after rendering the chat history
		}
		
		// Create a new WebSocket connection
		const token = localStorage.getItem('accessToken');
		const socketUrl = `wss://10.11.4.4:443/ws/chat/${recipient}/?token=${token}`;
	
		window.Chatsocket = new WebSocket(socketUrl);

		window.Chatsocket.onmessage =  async function (event)
        {
            console.log("Chatsocket onmessage");

            const data = JSON.parse(event.data);
		    
            // console.log("USER DATA: ", user);
            if (data.sender !== recipient)
                renderMessage("You", data.message, sender);
            else
                renderMessage(data.sender, data.message, user);
            
            scrollToBottom();
		}
		window.Chatsocket.onopen = function ()	
		{	
			console.log('WebSocket connected for', recipient);
		};
	
		window.Chatsocket.onerror = function (error) {
			console.error('WebSocket error:', error);	
			if (window.Chatsocket)
				window.Chatsocket.close();
		};
	
		window.Chatsocket.onclose = function () {
			console.log('WebSocket connection closed for', recipient);
			if (window.Chatsocket)
				window.Chatsocket.close();
		};
    });
	})(this);

	async function getUserData()
	{
	  const token = localStorage.getItem('accessToken');
	  if (!token)
		  throw new Error('No access token found in localStorage');
	  try
	  {
		  const response = await fetch(`/api/profile` , {
			  method: 'GET',
			  headers:
			  {
				  'Content-Type': 'application/json',
				  'Authorization': `Bearer ${token}`
			  }
		  })
		  if ( !response.ok ) 
			  throw new Error(`HTTP error! status: ${response.status}`);
		  else
		  {
			  const data = await response.json();
			  return data;
		  }
	  }
	  catch( error ) {
		  console.error("fetch error" , error )
		  throw error
	  }
	}
async function fetchChatHistory(senderUsername, recipientUsername)
{
	const token = localStorage.getItem('accessToken');
	if (!token)
		throw new Error('No access token found in localStorage');
	try {
	const response = await fetch(
		`/api/chat/${senderUsername}/${recipientUsername}`, // Ensure the trailing slash
		{
		  method: "GET",
		  headers: {
			"Authorization": `Bearer ${token}`,
			"Content-Type": "application/json",
		  },
		}
	  );
  
	  if (response.status === 200)
	  {
		const data = await response.json();
		if(data.chat_history)
		{
			if (data.chat_history.length > 0)
			return data.chat_history;
		}
		else
		  console.log("No chat history available.");
	  }
	  else if (response.status === 404)
		console.error("Recipient not found.");
	  else 
		console.error("Failed to fetch chat history:", response.status);
	}
	catch (error)
	{
	  console.error("Error:", error);
	}
  }
  
  async function renderMessage(sender, message, user)
  {
	const msg = document.createElement('li');
	msg.classList.add('message');

	// Add sent/received class based on sender
	msg.classList.add(sender === "You" ? 'sent' : 'received');

	const name = document.createElement('h4');
	name.classList.add('name');
	name.textContent = sender;

	const content1 = document.createElement('div');
	content1.classList.add('content1');

	const img = document.createElement('div');
	img.classList.add('image');

	const image = document.createElement('img');
	image.src =  user.profile_image;
	img.appendChild(image);

	const content2 = document.createElement('div');
	content2.classList.add('content2');

	const messageContent = document.createElement('span');
	messageContent.classList.add('msg');
	messageContent.textContent = message;

	const messageDate = document.createElement('span');
	messageDate.classList.add('date');
	messageDate.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

	content2.appendChild(messageContent);
	content2.appendChild(document.createElement('br'));
	content2.appendChild(messageDate);

	content1.appendChild(img);
	content1.appendChild(content2);

	msg.appendChild(name);
	msg.appendChild(content1);

	window.ChatMsgContainer.appendChild(msg);
}


/**
 * Scroll to the bottom of the message container.
 */
function scrollToBottom() {
	window.ChatBody.scrollTop = window.ChatBody.scrollHeight;
}