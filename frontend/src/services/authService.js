const API_BASE_URL = 'http://localhost:5000/api/auth';

/**
 * Helper to process response and throw errors if response is not ok
 * @param {Response} response 
 */
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

// Create a generic fetch helper that includes credentials: 'include'
const fetchWithCredentials = async (url, options = {}) => {
  const defaultOptions = {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
  return fetch(url, defaultOptions);
};

export const registerUser = async (userData) => {
  const response = await fetchWithCredentials(`${API_BASE_URL}/register`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

export const verifyEmailOtp = async (email, otp) => {
  const response = await fetchWithCredentials(`${API_BASE_URL}/verify-email`, {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
  return handleResponse(response);
};

export const resendVerificationOtp = async (email) => {
  const response = await fetchWithCredentials(`${API_BASE_URL}/resend-otp`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
};

export const loginUser = async (credentials) => {
  const response = await fetchWithCredentials(`${API_BASE_URL}/login`, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  return handleResponse(response);
};

export const requestPasswordResetOtp = async (email) => {
  const response = await fetchWithCredentials(`${API_BASE_URL}/forgot-password`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
};

export const verifyPasswordResetOtp = async (email, otp) => {
  const response = await fetchWithCredentials(`${API_BASE_URL}/verify-reset-otp`, {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
  return handleResponse(response);
};

export const resetPassword = async (resetData) => {
  const response = await fetchWithCredentials(`${API_BASE_URL}/reset-password`, {
    method: 'POST',
    body: JSON.stringify(resetData),
  });
  return handleResponse(response);
};

export const logoutUser = async () => {
  const response = await fetchWithCredentials(`${API_BASE_URL}/logout`, {
    method: 'POST',
  });
  return handleResponse(response);
};

export const getCurrentUser = async () => {
  const response = await fetchWithCredentials(`${API_BASE_URL}/me`, {
    method: 'GET',
  });
  return handleResponse(response);
};
