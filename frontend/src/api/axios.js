import axios from 'axios';

const api = axios.create({
    baseURL: 'https://glacier-task-manager.onrender.com/api', 
    withCredentials: true
});

export default api;