





let webSocketCreated = {};

// Function to create or get the WebSocket instance
const getWebsocket = (url) => {
    console.log( "hhhhh" , url )
    // If WebSocket does not already exist for the given URL, create a new one
    if (!webSocketCreated[url]) {
        console.log("Creating a new WebSocket connection to:", url);
        
        // Create a new WebSocket connection
        const socket = new WebSocket(url);
        
        // Store the WebSocket connection in the webSocketCreated object
        webSocketCreated[url] = socket;

        // Set up event listeners
        socket.onopen = () => console.log(`WebSocket connected to ${url}`);
        socket.onclose = () => {
            delete webSocketCreated[url];  // Remove the connection when closed
            console.log(`WebSocket closed for ${url}`);
        };
        socket.onerror = (error) => console.error(`WebSocket error for ${url}:`, error);
    } else {
        console.log(`WebSocket already exists for ${url}`);
    }

    // Return the WebSocket instance for further use
    return webSocketCreated[url];
};

// Function to close the WebSocket connection for a given URL
const closeWebsocket = (url) => {
    // Check if WebSocket connection exists for the given URL
    const socket = webSocketCreated[url];
    
    if (socket) {
        // Close the WebSocket connection
        socket.close(4900);
        
        // Remove the WebSocket connection from the webSocketCreated object
        delete webSocketCreated[url];
        console.log(`WebSocket connection closed for ${url}`);
    } else {
        console.log(`No WebSocket connection found for ${url}`);
    }
};
let tokenNotify  =  {
    notifyToken : null
}
let dataPlayer = {
    "myData" : {
    },
    "yourData" : {
    },
}


export { getWebsocket, closeWebsocket ,dataPlayer, tokenNotify};
