(function initializeSidebarComponent(component) {
	const cancelBtn = document.querySelector('.players-container .header .close-btn');
	const history = document.querySelector('.players-container');
	cancelBtn.addEventListener('click', () => {
		history.remove();
	})

	
	let user_id = 0;
	if(window.location.pathname === '/profiles') {
		user_id = localStorage.getItem('friend_id');
	}
	else {
		user_id = localStorage.getItem('id');
	}


	fetch(`/api/playerHistory/${user_id}/ranks/`, { 
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
		const classementList = document.querySelector('.full-classement');
        classementList.innerHTML = '';
        
        const currentUserId = parseInt(user_id);
        
        data.forEach((player) => {



            const listItem = document.createElement('li');
            listItem.className = 'player';

            if (player.user_id === currentUserId) {
                listItem.classList.add('you');
            }

            const rankSpan = document.createElement('span');
            rankSpan.className = 'num';
            rankSpan.textContent = player.rank;
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'name';
            nameSpan.textContent = player.username;
        
            listItem.appendChild(rankSpan);
            listItem.appendChild(nameSpan);
 
            if (player.user_id === currentUserId) {
                const youSpan = document.createElement('span');
                youSpan.className = 'you';
                youSpan.textContent = '(you)';
                listItem.appendChild(youSpan);
            }
            
            classementList.appendChild(listItem);
        });
        
    })



  })(this);
