import api from './api';

export const initiateLoginWithMicrosoft = async () => {
  try {
    // Step 1: Get the authorization URL from backend using POST
    const response = await api.post('/auth/microsoft/login');
    const { authorizationUrl } = response.data;
    
    // Step 2: Redirect user to Microsoft login page
    window.location.href = authorizationUrl;
  } catch (error) {
    console.error('Failed to initiate Microsoft login:', error);
    throw error;
  }
};