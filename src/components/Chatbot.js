import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';

async function getUserId(username) {
  if (!username) return null; // Skip if no username

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

  try {
    const response = await fetch(`${API_BASE_URL}/api/users/get-user-id?username=${encodeURIComponent(username)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('user_id', data.UserId); // Cache userId locally
      return data.UserId;
    } else {
      console.error('Error fetching user ID:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error retrieving user ID:', error);
    return null;
  }
}



function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportType, setReportType] = useState('');
  const [formData, setFormData] = useState({ username: '', email: '', content: '' });
  const [userId, setUserId] = useState(null);
  const chatEndRef = useRef(null);
  const [convoId, setConvoId] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [isTitleUpdated, setIsTitleUpdated] = useState(false); // Track if title is updated
  const [convoTitle, setConvoTitle] = useState(""); // State to track ConvoTitle
  const [selectedEndpoint, setSelectedEndpoint] = useState('Default Model'); // State for selected endpoint

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

  // Map endpoint options
  const endpointOptions = {
    'Default Model': `${API_BASE_URL}/api/bedrock/chat`,
    'Advanced Model': `${API_BASE_URL}/api/bedrock/invoke-flow`,
  };

  // Dynamically update BACKEND_API_URL_FLOW based on selection
  const BACKEND_API_URL_FLOW = endpointOptions[selectedEndpoint] || endpointOptions['Default Model'];

  const BACKEND_API_URL = `${API_BASE_URL}/api/bedrock/chat`;
  const REPORT_API_URL = `${API_BASE_URL}/api/report`;
  const API_BASE_URL_2 = `${API_BASE_URL}/api/conversation-history`;


  useEffect(() => {
    console.log('Sessions:', sessions);
  }, [sessions]);
  
  useEffect(() => {
    console.log('Messages retrieved for page/session:', messages);
  }, [messages]);
  

  useEffect(() => {
    if (messages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // On component mount, determine if user is logged in
  useEffect(() => {
    const fetchUser = async () => {
      const storedUserId = localStorage.getItem("user_id");
      const username = localStorage.getItem("username");

      if (storedUserId) {
        setUserId(storedUserId);
        setIsGuest(false);
      } else if (username) {
        const fetchedUserId = await getUserId(username);
        if (fetchedUserId) {
          setUserId(fetchedUserId);
          setIsGuest(false);
        } else {
          console.error("Failed to fetch userId for the logged-in user.");
        }
      } else {
        setIsGuest(true);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    // This effect will run when the component mounts and when userId is available
    if (userId) {
      fetchSessions(); // Fetch sessions when the component is first loaded
    }
  }, [userId]);  // This will trigger only when userId changes
  
  

  // Fetch all sessions for the logged-in user
  // Fetch sessions and their titles
  // Fetch sessions and their titles
const fetchSessions = async () => {
  if (!userId || isGuest) return;

  try {
    const response = await fetch(`${API_BASE_URL_2}/sessions/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Fetched sessions:", data);  // Add logging to debug the response
      setSessions(data); // Update the sessions state with the latest data
    } else {
      console.error("Failed to fetch sessions:", response.status);
    }
  } catch (error) {
    console.error("Error fetching sessions:", error);
  }
};

  

  


  
  

  // Fetch messages for a specific session
  const fetchMessages = async (sessionId) => {
    if (!sessionId) {
      console.error("Session ID is undefined.");
      return [];
    }
  
    try {
      const response = await fetch(`${API_BASE_URL_2}/messages/${sessionId}/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
  
      if (response.ok) {
        const data = await response.json();
  
        if (!Array.isArray(data) || data.length === 0) {
          console.error("Invalid data structure or empty response:", data);
          return [];
        }
  
        return data.flatMap((message) => [
          message.userInput ? { user: true, text: message.userInput } : null,
          message.botResponse ? { user: false, text: message.botResponse } : null,
        ]).filter(Boolean); // Remove null values
      } else {
        console.error("Failed to fetch messages:", response.status);
        return [];
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  };
  
  
  
  
  

  const handleSelectSession = async (sessionId) => {
    console.log("Selected Session ID:", sessionId);
    console.log("User ID:", userId);
  
    if (!sessionId || !userId) {
      console.error("Session ID or User ID is missing.");
      return;
    }
  
    try {
      setConvoId(sessionId);
      const retrievedMessages = await fetchMessages(sessionId);
      console.log("Retrieved Messages:", retrievedMessages);
  
      setMessages(retrievedMessages);
    } catch (error) {
      console.error("Error selecting session:", error);
    }
  };
  


  // Handle manual creation of new conversation
  const handleNewConversation = async () => {
    if (isGuest) {
      console.warn("Guests cannot create new conversations.");
      return;
    }
  
    // Reset the current session and messages
    setConvoId(null); // Clear current session ID
    setMessages([]);  // Clear the messages
  
    console.log("Session cleared. Waiting for first user input to auto-create session.");
  };


  // Update
  const updateSessionTitle = async (convoId, convoTitle) => {
    try {
      const response = await fetch(`${API_BASE_URL_2}/update-title`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ConvoID: convoId, ConvoTitle: convoTitle }),
      });
  
      if (response.ok) {
        console.log(`Session title updated to: ${convoTitle}`);
  
        // After updating the title, directly re-fetch the sessions to get the latest data
        fetchSessions(); // Re-fetch sessions to reflect the updated title
      } else {
        console.error("Failed to update session title.");
      }
    } catch (error) {
      console.error("Error updating session title:", error);
    }
  };
  
  


  const createNewSession = async (userId, setSessions, setConvoId, convoTitle = "New Conversation") => {
    try {
      const response = await fetch(`${API_BASE_URL_2}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ UserID: userId, ConvoTitle: convoTitle }),
      });
  
      if (response.ok) {
        const result = await response.json();
  
        // Check if the session is already in the list before adding
        setSessions((prevSessions) => {
          const exists = prevSessions.some((session) => session.convoID === result.convoID);
          if (exists) return prevSessions; // Do not add duplicates
          return [...prevSessions, { convoID: result.convoID, convoTitle }];
        });
  
        setConvoId(result.convoID);
        console.log(`New session created with convoID: ${result.convoID} and title: ${convoTitle}`);
        return result.convoID; // Return the convoID for further use
      } else {
        console.error("Failed to create a session.");
        return null;
      }
    } catch (error) {
      console.error("Error creating session:", error);
      return null;
    }
  };
  

  
  const extractKeyWords = (message) => {
    if (!message) return "New Conversation";
    const words = message.split(" ").slice(0, 3).join(" ");
    return words || "New Conversation";
  };

  const generateMessageID = () => {
    return 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
      return (Math.random() * 16 | 0).toString(16);
    });
  };
  


  const handleSend = async () => {
    if (userInput.trim()) {
      // Handle Guest User
      if (isGuest) {
        setUserInput('');
        setMessages((prev) => [...prev, { user: true, text: userInput }]); // Add user's input immediately
        setIsLoading(true);
  
        try {
          const response = await fetch(BACKEND_API_URL_FLOW, {   // change here to switch agent and flow
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userInput }),
          });
  
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
          const result = await response.json();
          const botMessage = { user: false, text: processBotResponse(result.reply) };
          setMessages((prev) => [...prev, botMessage]); // Add bot response to messages
        } catch (error) {
          console.error('Error:', error.message);
          setMessages((prev) => [...prev, { user: true, text: userInput }, { user: false, text: 'Error: Unable to connect to bot.' }]);
        } finally {
          setIsLoading(false);
        }
        return;
      }
  
      setUserInput('');
      setMessages((prev) => [...prev, { user: true, text: userInput }]); // Add user's input immediately
      setIsLoading(true);
  
      try {
        let localConvoId = convoId;
  
        // If there's no convoId, create a new session
        if (!localConvoId) {
          const convoTitle = extractKeyWords(userInput); // Generate title from user input
          localConvoId = await createNewSession(userId, setSessions, setConvoId, convoTitle);
  
          if (!localConvoId) {
            console.error('Failed to create a new session.');
            return;
          }
        }
  
        // Generate MessageID
        const messageID = generateMessageID();
  
        // Save the user input and fetch bot response
        const botResponse = await fetch(BACKEND_API_URL_FLOW, {  // change here to switch agent and flow
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userInput, userId }),
        });
  
        if (!botResponse.ok) throw new Error(`HTTP error! status: ${botResponse.status}`);
  
        const botResult = await botResponse.json();
  
        // Save the input and bot response to the backend
        const saveMessageResponse = await fetch(`${API_BASE_URL_2}/save-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ConvoID: localConvoId,
            UserID: userId,
            UserInput: userInput,
            BotResponse: botResult.reply,
            BotTraceInfo: '{}', // Default trace info
            ConvoTitle: convoTitle,
            MessageID: messageID,
          }),
        });
  
        if (!saveMessageResponse.ok) throw new Error('Failed to save message to the backend.');
  
        // Fetch updated messages for the session to reflect changes
        const updatedMessages = await fetchMessages(localConvoId);
  
        // Update frontend messages state
        setMessages(updatedMessages.map((msg) => ({ ...msg, text: processBotResponse(msg.text) })));
  
        // Ensure title is updated only once, if required
        if (convoTitle === 'New Conversation') {
          const response = await fetch(`${API_BASE_URL_2}/get-session-title/${localConvoId}`);
          if (!response.ok) throw new Error(`Failed to fetch session title.`);
  
          const data = await response.json();
  
          let updatedTitle = data.ConvoTitle;
          if (!updatedTitle || updatedTitle === 'New Conversation') {
            updatedTitle = extractKeyWords(userInput);
            await updateSessionTitle(localConvoId, updatedTitle);
          }
        }
      } catch (error) {
        console.error('Error:', error.message);
        setMessages((prev) => [...prev, { user: true, text: userInput }, { user: false, text: 'Error: Unable to connect to bot.' }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const processBotResponse = (text) => {
    if (!text) return text;
  
    // Replace `**` wrapped text with HTML <b> tags
    return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  };
  
  



  const handleSendReport = async () => {
    try {
      const nzTime = new Date().toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' });
      const reportData = { ...formData, type: reportType, reportedAt: nzTime };

      const response = await fetch(REPORT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) throw new Error('Failed to submit report');

      alert('Report submitted successfully!');
      setIsModalOpen(false);
      setFormData({ username: '', email: '', content: '' });
    } catch (error) {
      console.error('Error submitting report:', error.message);
      alert('Error submitting the report');
    }
  };

  const handleOpenModal = (type) => {
    setReportType(type);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`sidebar ${isGuest ? '' : ''}`}>
        {!isGuest ? (
          <>
            <h3>Chat Sessions</h3>
            <button onClick={handleNewConversation} disabled={isGuest}>
              New Conversation
            </button>
            <ul>
              {sessions.length > 0 ? (
                // Remove duplicate sessions by convoID
                [...new Map(sessions.map((session) => [session.convoID, session])).values()].map((session) => (
                  <li
                    key={session.convoID} // Use convoID as a unique key
                    className={session.convoID === convoId ? 'active' : ''}
                    onClick={() => handleSelectSession(session.convoID)}
                  >
                    {session.convoTitle || 'New Conversation'}
                  </li>
                ))
              ) : (
                <li>Type to create new conversation</li>
              )}
            </ul>
            <div className="sidebar-footer">&copy; 2025 My Chatbot</div>
          </>
        ) : (
          <div className="guest-message">
            <p>Please log in or sign up to save your messages.</p>
            <button onClick={() => window.location.href = '/login'} className="login-button">
              Login
            </button>
          </div>
        )}
      </div>



  
      {/* Chatbot Container */}
      <div className="chatbot-container">
            <div className="header-controls">
        {/* Dropdown Menu for Model Selection */}
        <div className="dropdown-container">
          <label htmlFor="model-selector" className="dropdown-label">
            Select Model:
          </label>
          <select
            id="model-selector"
            value={selectedEndpoint}
            onChange={(e) => setSelectedEndpoint(e.target.value)}
            className="dropdown"
          >
            {Object.keys(endpointOptions).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Report Button */}
        <button
          className="report-button"
          onClick={() => handleOpenModal('Chatbot Issue')}
        >
          🏳️ Report
        </button>
      </div>


  
        {/* Chatbot Box */}
        <div className="chatbot-box">
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div key={index} className={`message-row ${msg.user ? 'user-message' : 'bot-message'}`}>
                  {!msg.user && (
                    <>
                      <img
                        src="https://img.icons8.com/ios-filled/50/00bfa6/bot.png"
                        alt="Bot"
                        className="bot-logo"
                      />
                      <div className="message-bubble"
                      dangerouslySetInnerHTML={{ __html: msg.text }} // Render HTML for bold text
                      ></div>
                    </>
                  )}
                  {msg.user && (
                    <>
                      <div className="message-bubble">{msg.text}</div>
                      <img
                        src="https://img.icons8.com/ios-filled/50/0078d4/user-male-circle.png"
                        alt="User"
                        className="user-logo"
                      />
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="no-messages"></div>
            )}
  
          {/* Loading Indicator */}
          {isLoading && (
            <div className="message-row bot-message">
              <img
                src="https://img.icons8.com/ios-filled/50/00bfa6/bot.png"
                alt="Bot"
                className="bot-logo"
              />
              <div className="message-bubble">Bot is typing...</div>
            </div>
          )}
  
          {/* Auto-Scroll Ref */}
          <div ref={chatEndRef} />
        </div>
      </div>
  
        {/* Input Section */}
        <div className="chatbot-input">
          <input
            type="text"
            placeholder="Type your message..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()} // Trigger send on Enter key press
          />
          <button onClick={handleSend}>Send</button>
        </div>
  
      {/* Modal */}
      {isModalOpen && (
          <div className="modal-overlay">
              <div className="modal-content">
                  <h2>{reportType} Report</h2>
                  
                  {/* Form Fields */}
                  <label>Username</label>
                  <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                  />
                  <label>Email</label>
                  <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                  />
                  <label>Description</label>
                  <textarea
                      name="content"
                      rows="4"
                      value={formData.content}
                      onChange={handleInputChange}
                  />
                  
                  {/* Toggle Link */}
                  <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#0078d4', cursor: 'pointer' }}>
                      {reportType === 'Chatbot Issue' ? (
                          <span onClick={() => {
                              setReportType('Website Issue');
                              setFormData({ username: '', email: '', content: '' }); // Reset form
                          }}>
                              Is there a website problem? Report it here
                          </span>
                      ) : (
                          <span onClick={() => {
                              setReportType('Chatbot Issue');
                              setFormData({ username: '', email: '', content: '' }); // Reset form
                          }}>
                              Go back to Chatbot Issue form
                          </span>
                      )}
                  </p>

                  {/* Action Buttons */}
                  <button className="modal-submit" onClick={handleSendReport}>
                      Submit
                  </button>
                  <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                      Close
                  </button>
              </div>
          </div>
      )}

    </>
  );
  
  
  
}

export default Chatbot;
