// import { getWebsocket, closeWebsocket , tokenNotify } from "../components/matchMaking.js"


(async function initializeSidebarComponent(component) {
	const appContainer = document.querySelector(".container");

	const token = localStorage.getItem('accessToken');
	const response_friend_list = await fetch('/api/friends/list', {
	method: 'GET',
	headers: {
	  'Content-Type': 'application/json',
	  'Authorization': `Bearer ${token}`,
	},
	});

	if (!response_friend_list.ok) {
	throw new Error('Network response was not ok');
	}


	let friendList = await response_friend_list.json();
	console.log("friend list is " , friendList)
	window.friendListGlobal = friendList

	const response_block_list = await fetch('/api/friends/list/blocked', {
	method: 'GET',
	headers: {
	  'Content-Type': 'application/json',
	  'Authorization': `Bearer ${token}`,
	},
	});

	if (!response_block_list.ok) {
		throw new Error('Network response was not ok');
	}
	const BlockList = await response_block_list.json();
	


	const response_sent_request = await fetch('/api/friends/requests/list', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});

	if (!response_sent_request.ok) {
		throw new Error(`Failed to fetch pending requests. Status: ${response.status}`);
	}

	const SentRequestList = await response_sent_request.json();
	console.log(SentRequestList);

	const container = document.querySelector('.container');


	// when click on add friend button
	const addFriendBtn = document.querySelector('.sidebar .friends .nav .add-friend');
	addFriendBtn.addEventListener('click', ()=> {
		window.loadComponent(container, "add-friend", 0);
	})

	// try to open a select-box
	const select = document.querySelectorAll('.sidebar .friends .nav > .select-box');
	select.forEach(ele => {
		ele.addEventListener('click', () => {
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
			// console.log(ele);
		})
	})
		const blockBtnFriend =  document.querySelector('.sidebar .friends .nav .drop-down .my-friends');
	    blockBtnFriend.addEventListener('click', (e) =>{
	  const li = e.target.closest('li.select-box .actions a.first i');
	  
	  if (li) {

			li = e.target.closest('li.select-box .actions a.first i');
		  	
			if (confirm("ary you sure you want to do this ?"))
			{
				const nickname = li.parentElement.parentElement.previousElementSibling.children[0].children[1].textContent;
				const token = localStorage.getItem('accessToken');
				if (!token) {
					alert('Access token is missing. Please log in.');
					return;
				}
				
				fetch(`/api/friends/block/${nickname}`, {
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`,
					},
				})
				.then(response => {
					if (!response.ok) {
						throw new Error(`Failed to block user. Status: ${response.status}`);
					}
					return response.json();
				})
				.then(data => {
					window.loadComponentNotify('notification', appContainer, {message: `You blocked ${nickname} !!`, type: "warning"});
					// showNotification({
					// 	message: `You blocked ${nickname} !!`,
					// 	type: "warning",
					// 	icon: "fa-check-circle",
					// 	duration: 3000
					// });
					console.log(`User ${nickname} blocked successfully`);
					li.parentElement.parentElement.parentElement.remove();
					console.log(friendList);
					const user = friendList.find(friend => friend.friend_username === nickname);
					console.log(user);
					buildBlockedList(nickname,  user.profile_image);
					// fetchFriends();
				})
				.catch(error => {
					console.error('Error blocking user:', error);
				});


				li.parentElement.parentElement.parentElement.remove();
			}
	  }
	  })

	  // when click on unfriend button that exist in friends list
	  const unfriendBtnFriend =  document.querySelector('.sidebar .friends .nav .drop-down.my-friends');
	  unfriendBtnFriend.addEventListener('click', (e) =>{
		//   console.log(blockBtnFriend);
		// Check if the clicked element is an 'li' with the 'select-box' class
	  const li = e.target.closest('li.select-box .actions a.second i');
	  if (li) {
		  console.log("Delete button");
			const nickname = li.parentElement.parentElement.parentElement.children[0].children[0].children[1].textContent;

			const token = localStorage.getItem('accessToken');
			if (!token) {
				alert('Access token is missing. Please log in.');
				return;
			}
			fetch(`/api/friends/remove/${nickname}`, {
				method: 'DELETE',
				headers: {
					// 'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
			})
			.then(response => {
				if (!response.ok) {
					throw new Error(`Failed to remove user. Status: ${response.status}`);
				}
				return response.json();
			})
			.then(data => {
				window.loadComponentNotify('notification', appContainer, {message: `${nickname} has been removed from your friends list.`, type: "warning"});

				// showNotification({
				// 	message: `${nickname} has been removed from your friends list.`,
				// 	type: "warning",
				// 	icon: "fa-check-circle",
				// 	duration: 3000
				// });
				console.log(`User ${nickname} blocked successfully`);
				li.parentElement.parentElement.parentElement.remove();
				// buildBlockedList(nickname);
				// fetchFriends();
			})
			.catch(error => {
				console.error('Error blocking user:', error);
			});

			li.parentElement.parentElement.parentElement.remove();




	  }
	  })

	  // when click on accept button that exist in pending list
	  const acceptBtnFriend =  document.querySelector('.sidebar .friends .nav .drop-down .pending');
	  acceptBtnFriend.addEventListener('click', (e) =>{
		//   console.log(blockBtnFriend);
		// Check if the clicked element is an 'li' with the 'select-box' class
		const li = e.target.closest('li.select-box .actions a.first i');
		const li2 = e.target.closest('li.select-box .actions a.second i');
		if (li) {
			  console.log("Hello 123");
			
			// console.log(li);
			handleAcceptRequest(li);
			// buildFriendList(nickname);
		}
		if (li2) {
			const username = li2.parentElement.parentElement.previousElementSibling.children[0].children[1];
			let nickname = username.textContent;
			console.log(" test cancle player ")
			const token = localStorage.getItem('accessToken');
			if (!token) {
				alert('Access token is missing. Please log in.');
				return;
			}
			fetch(`/api/friends/remove/${nickname}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
			})
			.then(response => {
				if (!response.ok) {
					throw new Error(`Failed to remove user from pending requests. Status: ${response.status}`);
				}
				return response.json();
			})
			.then(data => {
				window.loadComponentNotify('notification', appContainer, {message: `${nickname} has been removed from your pending list.`, type: "warning"});

				// showNotification({
				// 	message: `${nickname} has been removed from your pending list.`,
				// 	type: "warning",
				// 	icon: "fa-check-circle",
				// 	duration: 3000
				// });
				console.log(`User ${nickname} blocked successfully`);
				li.parentElement.parentElement.parentElement.remove();
				buildBlockedList(nickname);
				// fetchFriends();
			})
			.catch(error => {
				console.error('Error blocking user:', error);
			});
			li2.parentElement.parentElement.parentElement.remove();
		}
	  })
	
	  // when click on deblock button that exist in blocked list
		const reblockBtnFriend =  document.querySelector('.sidebar .friends .nav .drop-down.blocked');
	    reblockBtnFriend.addEventListener('click', (e) =>{
		//   console.log(blockBtnFriend);
		// Check if the clicked element is an 'li' with the 'select-box' class
	  const li = e.target.closest('li.select-box .actions a i');
	  if (li) {
		  console.log("Hello");
		
		  
		  const nickname = li.parentElement.parentElement.previousElementSibling.children[0].children[1].textContent;
		  const token = localStorage.getItem('accessToken');
			if (!token) {
				alert('Access token is missing. Please log in.');
				return;
			}
			fetch(`/api/friends/unblock/${nickname}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
			})
			.then(response => {
				if (!response.ok) {
					throw new Error(`Failed to remove user from pending requests. Status: ${response.status}`);
				}
				return response.json();
			})
			.then(data => {
				window.loadComponentNotify('notification', appContainer, {message: `${nickname} has been removed from your block list.`, type: "warning"});

				// showNotification({
				// 	message: `${nickname} has been removed from your block list.`,
				// 	type: "warning",
				// 	icon: "fa-check-circle",
				// 	duration: 3000
				// });
				li.parentElement.parentElement.parentElement.remove();
			}) 
			.catch(error => {
				console.error('Error blocking user:', error);
			});
			
	  }
	  })


	// build friend list
	function buildFriendList(nickname, imgPath)  {
		const invitedFriends = document.querySelector('.sidebar .friends .nav .drop-down.my-friends');
	
		// Create the member-setting div
		const friend = document.createElement('li');
		friend.classList.add('select-box');
		friend.classList.add('close');
		// memberSetting.classList.add('selct-box close');
	
		// Example content (customize as needed)
		friend.innerHTML = `
		<div class="profile">
			<a>
				<img src="${imgPath}">
				<span class="nickname">${nickname}</span>
			</a>
		</div>
		<div class="actions">
			<a class="first"><i class="fa-solid fa-ban"></i></a>
			<a class="second"><i class="fa-solid fa-trash"></i></a>
			<a class="third"><i class="fa-solid fa-table-tennis-paddle-ball"></i></a>
		</div>
		`;
		invitedFriends.appendChild(friend);
	};


	function buildPendingList(nickname, imgPath) {
		const pendingRequests = document.querySelector('.drop-down.pending');
	
		if (!pendingRequests) {
			console.error("Pending requests container not found.");
			return;
		}
	
		const pendingRequest = document.createElement('li');
		pendingRequest.classList.add('select-box', 'close');
		
		pendingRequest.innerHTML = `
			<div class="profile">
				<a>
					<img src="${imgPath}" alt="${nickname}">
					<span class="nickname">${nickname}</span>
				</a>
			</div>
			<div class="actions">
				<a class="first"><i class="fa-solid fa-check"></i></a>
				<a class="second"><i class="fa-solid fa-circle-xmark"></i></a>
			</div>
		`;
		pendingRequests.appendChild(pendingRequest);
	}

	function buildBlockedList(nickname, imgPath)  {
		const blockedFriendsList = document.querySelector('.sidebar .friends .nav .drop-down.blocked');

		const blocked = document.createElement('li');
		
		blocked.classList.add('select-box');
		blocked.classList.add('close');
		
		blocked.innerHTML = 
		`	
			<div class="profile">
				<a>
					<img src="${imgPath}" alt="${nickname}">
					<span class="nickname">${nickname}</span>
				</a>
			</div>
			<div class="actions">
				<a><i class="fa-sharp fa-solid fa-trash-arrow-up"></i></a>
			</div>
		`;
		blockedFriendsList.appendChild(blocked);
	};


	// build blocked list
// 	function buildBlockedList(nickname, imgPath)
// 	{
// 	  const blockFriends = document.querySelector('.sidebar .friends .nav .drop-down.blocked');
// 	  const list = document.createElement('li');
	  
// 	  list.classList.add('select-box');
// 	  list.classList.add('close');
	  
// 	  list.innerHTML = 
// 	  `	
// 		<div class="profile">
// 			<a>
// 				<img src="${imgPath}">
// 				<span class="nickname">${nickname}</span>
// 			</a>
// 		</div>
// 		<div class="actions">
// 			<a><i class="fa-sharp fa-solid fa-trash-arrow-up"></i></a>
// 		</div>
// 	  `;
// 	  const profile = document.createElement('div');
// 	  profile.classList.add('profile');

// 	  const a = document.createElement('a');

// 	  const img = document.createElement('img');
// 	  img.src = "../assets/imgs/sidebar/ghost.jpeg";

// 	  const span = document.createElement('span');
// 	  span.classList.add('nickname');
// 	  span.textContent = nickname;

// 	  // append img and span to a
// 	  a.appendChild(img);
// 	  a.appendChild(span);
	  
// 	  // append a to profile
// 	  profile.appendChild(a);

// 	  const actions = document.createElement('div');
// 	  actions.classList.add('actions');
	  
// 	  const a2 = document.createElement('a');

// 	  const i = document.createElement('i');
// 	  i.classList.add('fa-sharp');
// 	  i.classList.add('fa-solid');
// 	  i.classList.add('fa-trash-arrow-up');

// 	  // append i to i
// 	  a2.appendChild(i);

// 	  // append a to actions div
// 	  actions.appendChild(a2);

// 	  list.appendChild(profile);
// 	  list.appendChild(actions);

// 	  // append li to ul
// 	  blockFriends.appendChild(list);
// 	  // console.log(invitedFriends);
//   }


	function checkWhichNavIsActive() {
		const activeNavBar = document.querySelector('.navbar .links a.active');
		if (activeNavBar.parentElement.className == 'game')
			return 'game';
		else if (activeNavBar.parentElement.className == 'profiles')
			return 'profiles';
		else if (activeNavBar.parentElement.className == 'chat')
			return 'chat';
		return 'undefined';
	}
	
		fetchFriends();
		fetchPendingRequests();
		fetchBlocks();
		fetchSentRequests();


	// // click on channel to view the members on right side bar
	// const clickOnChannel = document.querySelectorAll('.drop-down.my-friends li.select-box .profile a');
	// // const clickOnName = document.querySelectorAll('.drop-down.my-friends li.select-box .profile a .nickname');

	// clickOnChannel.forEach((li) => {
	// 	li.addEventListener('click', ()=>{
	// 		const navActive = checkWhichNavIsActive();
	// 		console.log("active: ", navActive);
	// 		if (navActive == 'game')
	// 		{
	// 			console.log(navActive);
	// 		}
	// 		else if (navActive == 'profiles'){
	// 			window.loadComponent3(container, 'profile', li.children[1].textContent);
	// 		}	
	// 		else if (navActive == 'chat'){
	// 			console.log(container);
	// 			console.log("name: ");
	// 			console.log(li.children[1].textContent);
	// 			// window.loadComponent3(container, 'right-sidebar2', li.children[1].textContent);
	// 		}
	// 		//console.log(clickOnName[i].textContent);
			
	// 		// before click on friend, should know what link is active
			
			
	// 	})
	// })

	async function fetchFriends() {
		try {
			const friend = document.createElement('li');
			friend.classList.add('select-box');
			friend.classList.add('close');
			friend.innerHTML = ``;
	  
		  friendList.forEach((friend) => {
			const imgPath =  friend.profile_image;
			buildFriendList(friend.friend_username, imgPath);
		  });
	  
		  // Add event listeners after the DOM is updated
		  attachClickListeners();
		} catch (error) {
		  console.error('Error fetching friends:', error);
		}
	  }


	  async function attachClickListeners() {
		const clickOnProfile = document.querySelectorAll('.drop-down.my-friends li.select-box .profile a');
	
		clickOnProfile.forEach((li) => {
			li.addEventListener('click', async () => {
				const navActive = checkWhichNavIsActive();
	
				if (navActive === 'game') {

				} else if (navActive === 'profiles') {
					try {




	
						const friendUsername = li.children[1].textContent;
						


						const user = friendList.find(friend => friend.friend_username === friendUsername);
						if (!user) {
							throw new Error(`Friend with username "${friendUsername}" not found in the friends list.`);
						}


						// console.log(user);
						



						
						window.loadComponent3(container, 'profile', user);









					} catch (error) {
						console.error('An error occurred:', error.message);
					}
				} else if (navActive === 'chat') {

					const friendUsername = li.children[1].textContent;
						


						const user = friendList.find(friend => friend.friend_username === friendUsername);
						if (!user) {
							throw new Error(`Friend with username "${friendUsername}" not found in the friends list.`);
						}
						console.log(user);
					console.log("friendTest: ", friendUsername);
					window.loadComponent3(container, 'right-sidebar', user);
					
				}
			});
		});
	}

	async function fetchPendingRequests() {
		try {
			const token = localStorage.getItem('accessToken');
			if (!token) {
				throw new Error('Access token is missing. Please log in.');
			}

			const response = await fetch('/api/friends/pending', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
			});
	
			if (!response.ok) {
				throw new Error(`Failed to fetch pending requests. Status: ${response.status}`);
			}
			const friendsData = await response.json();

			const friendsContainer = document.querySelector('.drop-down.pending');
			if (!friendsContainer) {
				throw new Error('Friends container not found in the DOM.');
			}

			friendsContainer.innerHTML = '';

			friendsData.forEach(friend => {
				const imgPath = friend.profile_image
					? friend.profile_image
					: '../assets/imgs/sidebar/default-profile.jpg';
	
				buildPendingList(friend.user_username, imgPath);
			});
		} catch (error) {
			console.error('Error fetching pending requests:', error);
		}
	}
	window.fetchPendingRequests = fetchPendingRequests();

	

	
	

	async function handleAcceptRequest(li) {
		try {
			const username = li.parentElement.parentElement.previousElementSibling.children[0].children[1].textContent;
			const token = localStorage.getItem('accessToken');
			if (!token) {
				throw new Error('Access token is missing. Please log in.');
			}
			const response = await fetch('/api/friends/pending', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
			});
			if (!response.ok) {
				throw new Error(`Failed to fetch pending requests. Status: ${response.status}`);
			}
			const pendingList = await response.json();
	
			const user = pendingList.find(friend => friend.user_username === username);
			if (!user) {
				window.loadComponentNotify('notification', appContainer, {message: `User with username "${username}" not found in the pending list.`, type: "error"});

				// showNotification({
				// 	message: `User with username "${username}" not found in the pending list.`,
				// 	type: "error",
				// 	icon: "fa-check-circle",
				// 	duration: 3000
				// });
				throw new Error(`User with username "${username}" not found in the pending list.`);
			}
			const userId = user.user;
			console.log('User ID to accept:', userId);
			const acceptResponse = await fetch(`/api/friends/accept/${userId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
			});
	
			if (!acceptResponse.ok) {
				window.loadComponentNotify('notification', appContainer, {message: `Failed to accept request. Status: ${acceptResponse.status}`, type: "error"});

				// showNotification({
				// 	message: `Failed to accept request. Status: ${acceptResponse.status}`,
				// 	type: "error",
				// 	icon: "fa-check-circle",
				// 	duration: 3000
				// });
				throw new Error(`Failed to accept request. Status: ${acceptResponse.status}`);
			}
			window.loadComponentNotify('notification', appContainer, {message: `Successfully accepted ${username}`, type: "success"});
			
			// showNotification({
			// 	message: `Successfully accepted ${username}`,
			// 	type: "success",
			// 	icon: "fa-check-circle",
			// 	duration: 3000
			// });
			fetchPendingRequests();
			console.log(`Successfully accepted friend request for user ID: ${userId}`);
			const imgPath =  user.profile_image;
			buildFriendList(user.user_username, imgPath);
		} catch (error) {
			console.error('Error handling accept request:', error);
		}
	}
	

	async function fetchBlocks() {
		try {
			const friend = document.createElement('li');
			friend.classList.add('select-box');
			friend.classList.add('close');
			friend.innerHTML = ``;
	  
		  BlockList.forEach((friend) => {
			const imgPath =  friend.friend_profile_image;
			buildBlockedList(friend.friend_username, imgPath);
		  });
	  
		//   attachClickListenersB();
		} catch (error) {
		  console.error('Error fetching friends:', error);
		}
	  }


	//   async function attachClickListenersB() {
	// 	const clickOnProfile = document.querySelectorAll('.drop-down.my-friends li.select-box .profile a');
	
	// 	clickOnProfile.forEach((li) => {
	// 		li.addEventListener('click', async () => {
	// 			const navActive = checkWhichNavIsActive();
	
	// 			if (navActive === 'game') {

	// 			} else if (navActive === 'profiles') {
	// 				try {
	// 					const friendUsername = li.children[1].textContent;
	// 					console.log("Name: " + friendUsername);

	// 					const user = BlockList.find(friend => friend.friend_username === friendUsername);
	// 					if (!user) {
	// 						throw new Error(`Friend with username "${friendUsername}" not found in the block list.`);
	// 					}
	// 					console.log(user);
	// 					const profileImageElement = document.getElementById('profile_image');
	// 					if (profileImageElement && user.profile_image) {
	// 						console.log("Image upated");
	// 						profileImageElement.src =  user.profile_image;
	// 						profileImageElement.alt = `${user.friend_username}'s profile picture`;
	// 					}
	// 					window.loadComponent3(container, 'profile', user);
	// 				} catch (error) {
	// 					console.error('An error occurred:', error.message);
	// 				}
	// 			} else if (navActive === 'chat') {
	// 				const friendUsername = li.children[1].textContent;
	// 				window.loadComponent3(container, 'right-sidebar', friendUsername);
	// 			}
	// 		});
	// 	});
	// }

	const deleteSendingReq = document.querySelector('.sidebar .friends .nav .drop-down.invited');

	deleteSendingReq.addEventListener('click', async (e) => { 
		const li = e.target.closest('li.select-box');

		const nickname = li.parentElement.children[0].children[0].children[0].children[1].textContent;
		console.log(nickname);

		const user = SentRequestList.find(friend => friend.friend_username === nickname);
		if (!user) {
			window.loadComponentNotify('notification', appContainer, {message: `User with username "${nickname}" not found in the sent request pending list.`, type: "error"});

			// showNotification({
			// 	message: `User with username "${nickname}" not found in the sent request pending list.`,
			// 	type: "error",
			// 	icon: "fa-check-circle",
			// 	duration: 3000
			// });
			throw new Error(`User with username "${nickname}" not found in the sent request pending list.`);
		}
		const userId = user.id;
		console.log('User ID to accept:', userId);

		const acceptResponse = await fetch(`/api/friends/requests/cancel/${userId}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`,
			},
		});
		window.loadComponentNotify('notification', appContainer, {message: `You canceled the request request sent to: ${nickname}`, type: "warning"});

		li.remove();
	});






	function buildSendingReqList(nickname, imgPath) {
		const pendingRequests = document.querySelector('.drop-down.invited');
	
		if (!pendingRequests) {
			console.error("Pending requests container not found.");
			return;
		}
	
		const pendingRequest = document.createElement('li');
		pendingRequest.classList.add('select-box', 'close');
		
		pendingRequest.innerHTML = `
			<div class="profile">
				<a>
					<img src="${imgPath}" alt="${nickname}">
					<span class="nickname">${nickname}</span>
				</a>
			</div>
			<div class="actions">
				<a><i class="fa-solid fa-trash"></i></a>
			</div>
		`;
		pendingRequests.appendChild(pendingRequest);
	}

	async function fetchSentRequests() {
		try {
	
			const SentRequestContainer = document.querySelector('.drop-down.invited');
			if (!SentRequestContainer) {
				throw new Error('Friends container not found in the DOM.');
			}
	
			SentRequestContainer.innerHTML = '';
	
			SentRequestList.forEach(request => {
				const imgPath = request.profile_image
					? request.profile_image
					: '../assets/imgs/sidebar/default-profile.jpg';
	
				buildSendingReqList(request.friend_username, imgPath);
			});
		} catch (error) {
			console.error('Error fetching pending requests:', error);
		}
	}
	

  })(this);



