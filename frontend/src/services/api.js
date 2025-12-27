
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Feedback API calls
export const feedbackAPI = {
    // Submit new feedback
    submitFeedback: (feedbackData) => 
        api.post("/feedback", feedbackData),
    
    // Get all feedback
    getAllFeedback: () => 
        api.get("/feedback"),
    
    // Get featured feedback
    getFeaturedFeedback: () => 
        api.get("/feedback/featured"),
    
    // Get statistics
    getFeedbackStats: () => 
        api.get("/feedback/stats"),
    
    // Create sample data
    createSampleFeedback: () => 
        api.get("/feedback/create-sample"),
};

// Product API calls
export const productAPI = {
    getAllProducts: () => 
        api.get("/products"),
    
    createProduct: (productData) => 
        api.post("/products", productData),
};

// User API calls
export const userAPI = {
    getAllUsers: () => 
        api.get("/users"),
    
    createUser: (userData) => 
        api.post("/users", userData),
};

export default api;
