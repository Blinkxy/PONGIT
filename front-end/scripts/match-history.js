(function initializeSidebarComponent(component) {
    const cancelBtn = document.querySelector('.match-history-container .header .close-btn');
    const history = document.querySelector('.match-history-container');
    const matchList = document.querySelector('.body .history');
    cancelBtn.addEventListener('click', () => {
        history.remove();
    });


    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' }).toLowerCase();
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        
        return `${day} ${month} ${year} ${hours}:${minutes.toString().padStart(2, '0')}`;
    }


    function createMatchElement(match) {
        let userProfileImage;
        if(window.location.pathname === '/profiles') {
            userProfileImage =  localStorage.getItem('friend_image') || '../assets/imgs/sidebar/ghost.jpeg';
        }
        else {
            userProfileImage = localStorage.getItem('profile_image') || '../assets/imgs/sidebar/ghost.jpeg';
        }
        
        
        return `
            <li class="match ${match.status.toLowerCase()}">
                <span class="date">${formatDate(match.date_game)}</span>
                <span class="result">
                    <span class="profile1 profile">
                        <img src="${userProfileImage}">
                    </span>
                    <span class="score">${match.playerScore} : ${match.opponentScore}</span>
                    <span class="profile2 profile">
                        <img src="${match.opponent_profile_image || '../assets/imgs/sidebar/ghost.jpeg'}">
                    </span>
                </span>
                <span class="status">${match.status.charAt(0).toUpperCase() + match.status.slice(1)}</span>
            </li>
        `;
    }
    function getLocalStorageItem(key) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) {
                throw new Error(`${key} not found in localStorage`);
            }
            return item;
        } catch (error) {
            console.error(`Error accessing localStorage for ${key}:`, error);
            return null;
        }
    }

    // Function to handle match history fetch
    function fetchMatchHistory(userId) {
        if (!userId) {
            matchList.innerHTML = '<li class="error">User ID not available</li>';
            return Promise.reject(new Error('User ID not available'));
        }

        return fetch(`/api/playerHistory/${userId}/`, { 
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getLocalStorageItem('accessToken')}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
    }

    // Main execution
    Promise.resolve()
        .then(() => {
            // Get user_id based on path
            const isProfilePage = window.location.pathname === '/profiles';
            const storageKey = isProfilePage ? 'friend_id' : 'id';
            
            const userId = getLocalStorageItem(storageKey);
            if (!userId) {
                throw new Error(`${storageKey} not available in localStorage`);
            }
            
            return fetchMatchHistory(userId);
        })
        .then(data => {
            console.log(data);
            
            if (!Array.isArray(data) || data.length === 0) {
                matchList.innerHTML = '<li class="no-matches">No matches found</li>';
                return;
            }

            const matchesHTML = data.map(match => createMatchElement(match)).join('');
            matchList.innerHTML = matchesHTML;
        })
        .catch(error => {
            console.error('Error in match history flow:', error);
            
            // Provide more specific error messages
            let errorMessage = 'Failed to load match history';
            if (error.message.includes('localStorage')) {
                errorMessage = 'User data not available. Please try logging in again.';
            } else if (error.message.includes('HTTP error')) {
                errorMessage = 'Could not connect to the server. Please try again later.';
            }
            
            matchList.innerHTML = `<li class="error">${errorMessage}</li>`;
        });

})(this);