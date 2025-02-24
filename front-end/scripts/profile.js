(function initializeSidebarComponent(component) {
    const profileNavbar = document.querySelector('.navbar .links-container .profile a img')
    profile_image = localStorage.getItem("profile_image");
    if (profileNavbar && profile_image ) {
		  profileNavbar.src = profile_image;
		  
    }
    const circle = document.querySelector('.progress-bar');
    const percentText = document.querySelector('.percentage');
    const winsText = document.querySelector('.wins');
    const radius = circle.getAttribute('r');
    const circumference = 2 * Math.PI * radius;

    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = circumference;

    function setProgress(percent) {
        const offset = circumference - (percent / 100 * circumference);
        circle.style.strokeDashoffset = offset;
    }
    

    fetch(`/api/playerHistory/${localStorage.getItem('id')}/`, { 
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
        matchHistory = data;
        // console.log(data);
    })




    // fetch(`/api/user/2`, { 
    //     method: 'GET',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    //     }
    // })
    // .then(response => {
    //     if (!response.ok) {
    //         throw new Error('Failed to fetch user data');
    //     }
    //     return response.json();
    // })
    // .then(data => {
    //     console.log(data);
    // })






    fetch(`/api/playerHistory/${localStorage.getItem('id')}/last2matches/`, { 
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
        const resultsContainer = document.querySelector('.results');
        resultsContainer.innerHTML = '';


        data.forEach(match => {
            const matchDate = new Date(match.date);
            const formattedDate = matchDate.toLocaleString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            });
            
            const matchHtml = `
                <li class="match ${match.result.toLowerCase()}">
                    <span class="date">${formattedDate}</span>
                    <span class="result">
                        <span class="profile1 profile">
                            <img src="${localStorage.getItem("profile_image") || '../assets/imgs/sidebar/ghost.jpeg'}" alt="Profile">
                        </span>
                        <span class="score">${match.playerScore} : ${match.opponentScore}</span>
                        <span class="profile2 profile">
                            <img src="${ match.opponent_image || '../assets/imgs/sidebar/ghost.jpeg'}" alt="Profile">
                        </span>
                    </span>
                    <span class="status">${match.result}</span>
                </li>
            `;
            

            console.log(data.length);
            if (data.length == 0) {
                resultsContainer.innerHTML = '<li>No matches found yet</li>';
            }
            resultsContainer.innerHTML += matchHtml;
        });
    })
    .catch(error => {
        console.error('Error:', error);
        
        const resultsContainer = document.querySelector('.results');
        if (error.message === 'No wins found') {
            resultsContainer.innerHTML = '<li>No matches found yet</li>';
        } else {
            resultsContainer.innerHTML = '<li>Failed to load match data</li>';
        }
    });



    fetch(`/api/playerHistory/${localStorage.getItem('id')}/lastwin/`, { 
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('No wins found');
            }
            throw new Error('Failed to fetch user data');
        }
        return response.json();
    })
    .then(match => {
        console.log(match);
        const resultsContainer = document.querySelector('.result-last-win');
        
        // Format the date
        const matchDate = new Date(match.date);
        const formattedDate = matchDate.toLocaleString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        });

        const matchHtml = `
            <li class="match win">
                <span class="date">${formattedDate}</span>
                <span class="result">
                    <span class="profile1 profile">
                        <img src="${localStorage.getItem("profile_image") || '../assets/imgs/sidebar/ghost.jpeg'}" alt="Profile">
                    </span>
                    <span class="score">${match.playerScore} : ${match.opponentScore}</span>
                    <span class="profile2 profile">
                        <img src="${ match.opponent_image || '../assets/imgs/sidebar/ghost.jpeg'}" alt="Profile">
                    </span>
                </span>
                <span class="status">Win</span>
            </li>
        `;
        
        resultsContainer.innerHTML = matchHtml;
    })
    .catch(error => {
        console.error('Error:', error);
        const resultsContainer = document.querySelector('.result-last-win');
        if (error.message === 'No wins found') {
            resultsContainer.innerHTML = '<li>No wins found yet</li>';
        } else {
            resultsContainer.innerHTML = '<li>Failed to load match data</li>';
        }
    });




    const userMatchStat = {};
    fetch(`/api/playerHistory/${localStorage.getItem('id')}/stats/`, { 
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
        // console.log(data);
        const lossesElement = document.getElementById('total-losses');
        if (lossesElement)
            lossesElement.textContent = data.losses;

        const winsElement = document.getElementById('total-wins');
        if (winsElement)
            winsElement.textContent = data.wins;
        setProgress(data.win_rate);

        const totalMatchesElement = document.getElementById('total-rate');
        if (totalMatchesElement)
            totalMatchesElement.textContent = `${data.total_games} MT`;

        const winRateElement = document.getElementById('win-rate');
        if (winRateElement)
            winRateElement.textContent = `${data.win_rate}%`;

        const totalSetElement = document.getElementById('total-set');
        if (totalSetElement)
            totalSetElement.textContent = `${data.total_games}`;


        const achivementElement = document.getElementById('achivement-set');
        if (achivementElement)
        {
            if (data.wins >= 1) {
                achivementElement.textContent = 'Novice 🎯';
            }
            if (data.wins >= 3) {
                achivementElement.textContent = 'Beginner ⭐';
            }
            if (data.wins >= 20) {
                achivementElement.textContent = 'Intermediate 🌟';
            }
            if (data.wins >= 30) {
                achivementElement.textContent = 'Advanced 🎖️';
            }
            if (data.wins >= 40) {
                achivementElement.textContent = 'Expert 🏆';
            }
            if (data.wins >= 50) {
                achivementElement.textContent = 'Master 🚀';
            }
        }
            



    })
    fetch(`/api/playerHistory/${localStorage.getItem('id')}/my_rank/`, { 
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
        const rankElement = document.getElementById('rank-set');
        if (rankElement)
            rankElement.textContent = data.rank;


    })
    
    fetch(`/api/playerHistory/${localStorage.getItem('id')}/top-ranks/`, { 
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
        // console.log(data);
        
        const classementList = document.querySelector('.classement');
        classementList.innerHTML = ''; // Clear existing items
        
        const currentUserId = parseInt(localStorage.getItem('id'));
        
        data.forEach((player, index) => {

            
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
    .catch(error => {
        console.error('Error:', error);
    });







    const container = document.querySelector('.container');
    
    // Click on view to view more history matches in details
    const viewHistory = document.querySelector('.profile-container .body .match-history .text .view');
    viewHistory.addEventListener('click', () => {
        // console.log(viewHistory);
        window.loadComponent2("match-history", container);
    });

    // Click on view to view more players ranking in details
    const viewPlayers = document.querySelector('.profile-container .body .leader-board .text .view');
    viewPlayers.addEventListener('click', () => {
        // console.log(viewPlayers);
        window.loadComponent2("players-ranking", container);
    });

    if (window.location.pathname === '/profile') {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.error('No access token found in localStorage');
        } else {
            // Fetch user profile details
            fetch('/api/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
                return response.json();
            })
            .then(data => {

                const dateJoinedElement = document.getElementById('date-joined');
                if (dateJoinedElement && data.joined_at) {
                    dateJoinedElement.textContent = data.joined_at;
     
                }
                
                const usernameElement = document.getElementById('username');
                if (usernameElement && data.username) {
                    usernameElement.textContent = data.username;
                }
                const emailElement = document.getElementById('email');
                if (emailElement && data.email) {
                    emailElement.textContent = data.email;
                }
                const profileImageElement = document.getElementById('profile_image');
                if (profileImageElement && data.profile_image) {
                    profileImageElement.src =  data.profile_image;
                    profileImageElement.alt = `${data.username}'s profile picture`;
                }
                // if (window.testsocket === undefined) {
                //     window.socket()
                // }
                // console.log(window.testsocket)
                // Initialize WebSocket connection
                // const wsUrl = `wss://10.11.4.4:443/ws/user/?token=${token}`;
                // const socket = new WebSocket(wsUrl);

                // socket.onopen = () => {
                //     console.log('WebSocket connection established');
                // };

                // socket.onmessage = (event) => {

                //     const message = JSON.parse(event.data);
                //     if (message.type === 'friend_request') {
                        
				// 	window.loadComponentNotify('notification', appContainer, {message: `${message.from_user} sent you a friend request!`, type: "info"});
                    
                //     }
                // };

                // socket.onerror = (error) => {
                //     console.error('WebSocket error:', error);
                // };

                // socket.onclose = () => {
                //     console.log('WebSocket connection closed');
                // };
            })
            .catch(error => {
                console.error('Error:', error);
                const errorMessageElement = document.getElementById('error-message');
                if (errorMessageElement) {
                    errorMessageElement.textContent = 'Unable to load user profile. Please try again later.';
                    errorMessageElement.style.display = 'block';
                } else {
                    alert('Unable to load user profile. Please try again later.');
                }
            });
        }
    }
})(this);






// const container = document.querySelector('.container');
    
//     // Click on view to view more history matches in details
//     const viewHistory = document.querySelector('.profile-container .body .match-history .text .view');
//     viewHistory.addEventListener('click', () => {
//         // console.log(viewHistory);
//         window.loadComponent2("match-history", container);
//     });


// 	// Click on view to view more players ranking in details
//     const viewPlayers = document.querySelector('.profile-container .body .leader-board .text .view');
//     viewPlayers.addEventListener('click', () => {
//         // console.log(viewPlayers);
//         window.loadComponent2("players-ranking", container);
//     });