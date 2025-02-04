import React, { useEffect, useState, useRef } from 'react';
import './Conversation.css';

function Conversation() {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedConvoID, setExpandedConvoID] = useState(null); // Track expanded convo ID
    const [sortConfig, setSortConfig] = useState({ key: 'convoCreatedAt', direction: 'asc' }); // Default sorting
    const [searchTerm, setSearchTerm] = useState(''); // Search term
    const [searchTermUserID, setSearchTermUserID] = useState(''); // Search term for User ID
    const [searchTermTitle, setSearchTermTitle] = useState(''); // Search term for Convo Title
    const tableRef = useRef(null); // Reference for the table

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

    

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/conversation-history`);
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            const data = await response.json();
            setConversations(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchConversations();
    };

    const toggleRowExpansion = (convoID) => {
        setExpandedConvoID((prev) => (prev === convoID ? null : convoID));
    };

    const sortedConversations = () => {
        const sortedData = [...conversations];
        const { key, direction } = sortConfig;

        sortedData.sort((a, b) => {
            let aValue = a[key];
            let bValue = b[key];

            // Handle date columns
            if (key === 'convoCreatedAt') {
                aValue = aValue ? new Date(aValue) : null;
                bValue = bValue ? new Date(bValue) : null;
            }

            // Handle null/undefined values
            if (aValue === null || aValue === undefined) return direction === 'asc' ? 1 : -1;
            if (bValue === null || bValue === undefined) return direction === 'asc' ? -1 : 1;

            // Perform comparison
            if (aValue < bValue) return direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return direction === 'asc' ? 1 : -1;

            return 0; // Equal values
        });

        return sortedData;
    };

    const groupedConversations = () => {
        const groups = {};
        sortedConversations().forEach((conversation) => {
            if (!groups[conversation.convoID]) groups[conversation.convoID] = [];
            groups[conversation.convoID].push(conversation);
        });
        return groups;
    };

    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc', // Toggle direction
        }));
    };

    const handleSearch = (e) => setSearchTerm(e.target.value);

    const highlightMatch = (text) => {
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.toString().replace(regex, (match) => `<mark>${match}</mark>`);
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    const grouped = groupedConversations();

    // Function to close expanded row on clicking outside the table
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tableRef.current && !tableRef.current.contains(event.target)) {
                setExpandedConvoID(null); // Close expanded row
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="admin-content conversation-page">
            <h1>Conversation History</h1>
    
            {/* Refresh and Search Section */}
            <div className="actions-container">
                <div className="search-row">
                    <div className="search-box">
                        <label htmlFor="search-convo-id">Search by Convo ID:</label>
                        <input
                            id="search-convo-id"
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Enter Convo ID"
                        />
                    </div>
                    <div className="search-box">
                        <label htmlFor="search-user-id">Search by User ID:</label>
                        <input
                            id="search-user-id"
                            type="text"
                            value={searchTermUserID}
                            onChange={(e) => setSearchTermUserID(e.target.value)}
                            placeholder="Enter User ID"
                        />
                    </div>
                    <div className="search-box">
                        <label htmlFor="search-convo-title">Search by Convo Title:</label>
                        <input
                            id="search-convo-title"
                            type="text"
                            value={searchTermTitle}
                            onChange={(e) => setSearchTermTitle(e.target.value)}
                            placeholder="Enter Convo Title"
                        />
                    </div>
                </div>
            </div>

    
            <button onClick={handleRefresh} className="refresh-button">
                🔄 Refresh
            </button>
    
            {loading ? (
                <p>Loading...</p>
            ) : (
                <table ref={tableRef}>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('convoID')}>Convo ID</th>
                            <th onClick={() => handleSort('userID')}>User ID</th>
                            <th onClick={() => handleSort('convoTitle')}>Convo Title</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(grouped)
                            .filter(
                                ([convoID, rows]) =>
                                    convoID.includes(searchTerm) &&
                                    rows.some((row) => row.userID.includes(searchTermUserID)) &&
                                    rows.some((row) =>
                                        (row.convoTitle || '').toLowerCase().includes(searchTermTitle.toLowerCase())
                                    )
                            )
                            .map(([convoID, rows]) => {
                                const titleRow = rows.find((row) => row.convoTitle);
                                return (
                                    <React.Fragment key={convoID}>
                                        <tr
                                            onClick={() => toggleRowExpansion(convoID)}
                                            className={expandedConvoID === convoID ? 'expanded-row' : ''}
                                        >
                                            <td>{convoID}</td>
                                            <td>{titleRow?.userID || 'Unknown User'}</td>
                                            <td>
                                                {titleRow?.convoTitle || 'No Title'}{' '}
                                                {expandedConvoID === convoID ? '▲' : '▼'}
                                            </td>
                                        </tr>
                                        {expandedConvoID === convoID &&
                                            rows.map((row) => (
                                                <tr key={row.messageID} className="expanded-details">
                                                    <td colSpan="3">
                                                        <div className="details-container">
                                                            <p>
                                                                <strong>User ID:</strong> {row.userID}
                                                            </p>
                                                            <p>
                                                                <strong>Message ID:</strong> {row.messageID}
                                                            </p>
                                                            <p className="wrap-text" style={{ color: 'green' }}>
                                                                <strong>User Input:</strong> {row.userInput || 'No content'}
                                                            </p>
                                                            <p className="wrap-text" style={{ color: 'orange' }}>
                                                                <strong>Bot Response:</strong> {row.botResponse || 'No content'}
                                                            </p>
                                                            <p>
                                                                <strong>Convo Created At:</strong> {row.convoCreatedAt}
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </React.Fragment>
                                );
                            })}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Conversation;
