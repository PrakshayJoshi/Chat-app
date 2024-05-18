import React, { useState, useEffect } from 'react';
import '../styles/home.css';

const HomePage = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    useEffect(() => {
        messages.forEach((msg, index) => {
            console.log(`Message ${index} Location:`, msg.location);
        });
    }, [messages]); 

    const fetchMessages = async () => {
        try {
            const response = await fetch('http://localhost:9000/api/messages');
            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }
            const data = await response.json();
            setMessages(data.reverse());
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            setError(error.message);
            setLoading(false);
        }
    };

    const handleKeyDown = async (event) => {
        if (event.key === 'Enter') {
            await sendMessage();
        }
    };

    const getCurrentLocation = async () => {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            type: 'Point',
                            coordinates: [position.coords.latitude, position.coords.longitude]
                        });
                    },
                    (error) => {
                        reject(error);
                    }
                );
            } else {
                reject(new Error('Geolocation is not supported by this browser.'));
            }
        });
    };
    
    const sendMessage = async () => {
        if (message.trim() !== '') {
            try {
                const location = await getCurrentLocation();
                
                const messageObject = {
                    text: message,
                    location: location
                };
    
                const response = await fetch('http://localhost:9000/api/messages/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(messageObject)
                });
    
                const data = await response.json();
                console.log('Success:', data);
                if (data.success) {
                    setMessages([data.message, ...messages]);
                }
                setMessage('');
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    return (
        <div className="container">
            <h2 className="home-header">Home Page</h2>
            <div className="message-input-container">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={handleKeyDown}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
            
            <div className="messages-container">
                {loading ? (
                    <p className="loading">Loading...</p>
                ) : error ? (
                    <p className="error">Error: {error}</p>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className="message">
                            <p>{msg.text}</p>
                            {msg.location && msg.location.coordinates && (
                                <p className="message-location">
                                    Location: {msg.location.coordinates[0]}, {msg.location.coordinates[1]}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );  
};

export default HomePage;
