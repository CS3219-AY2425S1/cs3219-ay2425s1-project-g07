import axios from 'axios';

const baseDomain = process.env.NEXT_PUBLIC_USER_SERVICE_DOMAIN || process.env.NEXT_PUBLIC_API_GATEWAY_DOMAIN || "http://localhost:8003"

export const createUser = async (username: string, email: string, password: string) => {
  try {
    await axios.post(`${baseDomain}/users`, { username, email, password });
  } catch (error) {
    console.error('Error creating user:', error);
    throw error; 
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${baseDomain}/auth/login`, { email, password });
    const { accessToken } = response.data.data;
    localStorage.setItem('authToken', accessToken);
  } catch (error) {
    console.error('Error logging in:', error);
    throw error; 
  }
};

export const logout = async () => {
  localStorage.removeItem('authToken');
  window.location.reload();
}

export const verifyToken = async () => {
  const accessToken = localStorage.getItem('authToken');
  if (!accessToken) {
    return false;
  }
  try {
    const response = await axios.get(`${baseDomain}/auth/verify-token`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log('Token verified');
    return response.data;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
}

export const deleteUser = async (userId: string) => {
  const accessToken = localStorage.getItem('authToken');
  if (!accessToken) {
    return false;
  }
  try {
    const response = await axios.delete(`${baseDomain}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log(`User ${userId} deleted`);
    return response.data;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  } finally {
    await logout();
  }
}

export const updateUser = async (userId: string, userData: { username?: string; email?: string; password?: string }) => {
  try {
    const accessToken = localStorage.getItem('authToken');
    const response = await axios.patch(`${baseDomain}/users/${userId}`, userData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log('Error updating user:', error);
    throw error;
  }
}