// This is an Fetch API that is used ot create a new chatbot conversation 

const createConversation = async (userId) => {
    try {
        const response = await fetch('http://localhost:5050/api/conversations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data); // Log success message
        return data;
    } catch (error) {
        console.error('Error creating conversation:', error.message);
        throw new Error(error.message || 'Failed to create conversation');
    }
};

export default createConversation;
