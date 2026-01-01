import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// ========== CONTACT API ==========
export const contactAPI = {
    // Submit new contact message
    submitContact: (contactData) => 
        api.post("/contacts", contactData),
    
    // Get all contact messages (for admin)
    getAllContacts: () => 
        api.get("/contacts"),
    
    // Update contact status (for admin)
    updateContactStatus: (id, status) => 
        api.put(`/contacts/${id}`, { status }),
    
    // Delete contact message (for admin)
    deleteContact: (id) => 
        api.delete(`/contacts/${id}`),
};

// ========== FEEDBACK API ==========
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

// ========== EXPERIENCE API ==========
// Note: You might need this for your feedback/experience feature
export const experienceAPI = {
    // Submit new experience/feedback
    submitExperience: (experienceData) => 
        api.post("/experiences", experienceData),
    
    // Get all experiences
    getAllExperiences: () => 
        api.get("/experiences"),
    
    // Update experience
    updateExperience: (id, experienceData) => 
        api.put(`/experiences/${id}`, experienceData),
    
    // Delete experience
    deleteExperience: (id) => 
        api.delete(`/experiences/${id}`),
};

// ========== STAFF API ==========
export const staffAPI = {
    // Staff login
    login: (credentials) => 
        api.post("/staff/login", credentials),
    
    // Staff registration
    register: (staffData) => 
        api.post("/staff/register", staffData),
    
    // Get all staff (admin only)
    getAllStaff: () => 
        api.get("/staff"),
};

// ========== PRODUCT API ==========
export const productAPI = {
    getAllProducts: () => 
        api.get("/products"),
    
    createProduct: (productData) => 
        api.post("/products", productData),
};

// ========== USER API ==========
export const userAPI = {
    getAllUsers: () => 
        api.get("/users"),
    
    createUser: (userData) => 
        api.post("/users", userData),
};

// ========== TEST API ==========
export const testAPI = {
    // Test endpoint to check if backend is working
    testBackend: () => 
        api.get("/test"),
};

// Export all APIs together (optional)
export const API = {
    contact: contactAPI,
    feedback: feedbackAPI,
    experience: experienceAPI,
    staff: staffAPI,
    product: productAPI,
    user: userAPI,
    test: testAPI,
};

// Default export
export default api;