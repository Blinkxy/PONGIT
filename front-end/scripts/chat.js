
( function initializeChatComponent(component)
{
    console.log("Chat component initialized");
    const input = component.document.querySelector('.chat-container .input-msg2 > input');
    const body = component.document.querySelector('.chat-container .body-msg');
    const msgContainer = body.children[1];
    
    window.ChatBody = body;
    window.ChatMsgContainer = msgContainer;

    // Send message on "Enter" key press
    input.addEventListener('keypress', (e) =>
    {
        if (e.key === 'Enter' && input.value.trim() !== "")
		{
            if (window.Chatsocket.readyState === WebSocket.OPEN)
			{
                const message = {
                    type: "chat.message",
                    message: input.value.trim(),
                };
                window.Chatsocket.send(JSON.stringify(message));
                input.value = "";
            } else {
                console.error("WebSocket is not connected.");
            }
        }
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
      else {
          const data = await response.json();
          console.log("MY DATA: ", data);
          return data;
      }
  }
  catch( error ) {
      console.error("fetch error" , error )
      throw error
  }
}

