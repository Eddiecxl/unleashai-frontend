import React, { useEffect, useState } from 'react';
import './RegisteredUsers.css';

function RegisteredUsers() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formVisible, setFormVisible] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        age: '',
        email: '',
        phoneNumber: '',
        role: 'normal',
    });
    const [editingUser, setEditingUser] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'username', direction: 'asc' }); // Default sorting
    const [searchTerm, setSearchTerm] = useState(''); // New state for search term

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

    // Fetch users from the backend
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/users/all-users`);
            if (!response.ok) {
                console.log('Rendering RegisteredUsers');
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc', // Toggle direction
        }));
    };

    const sortedUsers = () => {
        const sortedData = [...users];
        const { key, direction } = sortConfig;

        sortedData.sort((a, b) => {
            let aValue = a[key];
            let bValue = b[key];

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

    const handleSearch = (e) => setSearchTerm(e.target.value);

    const filteredUsers = sortedUsers().filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Add or update a user
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingUser
                ? `${API_BASE_URL}/api/users/update-user`
                : `${API_BASE_URL}/api/users/add-user`;
            const method = editingUser ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingUser ? { ...formData, username: editingUser.username } : formData),
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message || (editingUser ? 'User updated successfully.' : 'User added successfully.'));
                fetchUsers();
                resetForm();
            } else {
                throw new Error(result.message || 'Failed to submit form.');
            }
        } catch (err) {
            console.error('Error:', err.message);
            alert(err.message);
        }
    };

    const resetForm = () => {
        setFormData({
            username: '',
            password: '',
            age: '',
            email: '',
            phoneNumber: '',
            role: 'normal',
        });
        setEditingUser(null);
        setFormVisible(false);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            password: '',
            age: user.age,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
        });
        setFormVisible(true);
    };

    const deleteUser = async (username) => {
        if (!window.confirm(`Are you sure you want to delete the user "${username}"?`)) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/delete-user/${username}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                alert('User deleted successfully.');
                fetchUsers();
            } else {
                throw new Error('Failed to delete user.');
            }
        } catch (err) {
            console.error('Error:', err.message);
            alert(err.message);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="admin-content registered-users">
            <h1>Registered Users</h1>
            <div className="button-group">
                <button onClick={fetchUsers} className="refresh-button">Refresh Table</button>
                <button onClick={() => setFormVisible(!formVisible)} className="add-button">
                    {formVisible ? 'Close Form' : 'Add User'}
                </button>
            </div>

            {/* Search Input */}
            <div className="search-container">
                <label htmlFor="search-username">Search by Username:</label>
                <input
                    id="search-username"
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Enter Username"
                />
            </div>

            {loading && <p>Loading user data...</p>}
            {error && <p className="error">{error}</p>}
            {!loading && users.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('username')}>
                                Username {sortConfig.key === 'username' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('age')}>
                                Age {sortConfig.key === 'age' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('email')}>
                                Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('phoneNumber')}>
                                Phone {sortConfig.key === 'phoneNumber' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('role')}>
                                Role {sortConfig.key === 'role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.username}>
                                <td>{user.username}</td>
                                <td>{user.age}</td>
                                <td>{user.email}</td>
                                <td>{user.phoneNumber}</td>
                                <td>{user.role}</td>
                                <td>
                                    <button onClick={() => handleEdit(user)} className="edit-button">Edit</button>
                                    <button onClick={() => deleteUser(user.username)} className="delete-button">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {formVisible && (
                <div className="user-form">
                    <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
                    <form onSubmit={handleFormSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                placeholder="Enter Username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                                disabled={!!editingUser}
                            />
                        </div>
                        {!editingUser && (
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Enter Password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        )}
                        <div className="form-group">
                            <label htmlFor="age">Age</label>
                            <input
                                id="age"
                                type="number"
                                placeholder="Enter Age"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Enter Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phoneNumber">Phone Number</label>
                            <input
                                id="phoneNumber"
                                type="text"
                                placeholder="Enter Phone Number"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="role">Role</label>
                            <select
                                id="role"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                required
                            >
                                <option value="normal">Normal</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="form-buttons">
                            <button type="submit" className="submit-button">{editingUser ? 'Update User' : 'Add User'}</button>
                            <button type="button" onClick={resetForm} className="cancel-button">Cancel</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default RegisteredUsers;
