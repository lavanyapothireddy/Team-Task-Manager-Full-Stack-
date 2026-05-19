const BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('taskflow_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export const api = {
  // Auth
  signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/me', { method: 'PUT', body: JSON.stringify(body) }),

  // Projects
  listProjects: () => request('/projects'),
  createProject: (body) => request('/projects', { method: 'POST', body: JSON.stringify(body) }),
  getProject: (id) => request(`/projects/${id}`),
  updateProject: (id, body) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  addMember: (id, body) => request(`/projects/${id}/members`, { method: 'POST', body: JSON.stringify(body) }),
  removeMember: (id, userId) => request(`/projects/${id}/members/${userId}`, { method: 'DELETE' }),
  updateMemberRole: (id, userId, body) => request(`/projects/${id}/members/${userId}`, { method: 'PUT', body: JSON.stringify(body) }),

  // Tasks
  listTasks: (projectId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/projects/${projectId}/tasks${q ? '?' + q : ''}`);
  },
  createTask: (projectId, body) => request(`/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(body) }),
  getTask: (projectId, taskId) => request(`/projects/${projectId}/tasks/${taskId}`),
  updateTask: (projectId, taskId, body) => request(`/projects/${projectId}/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteTask: (projectId, taskId) => request(`/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' }),
  addComment: (projectId, taskId, body) => request(`/projects/${projectId}/tasks/${taskId}/comments`, { method: 'POST', body: JSON.stringify(body) }),

  // Dashboard
  getDashboard: () => request('/projects/dashboard'),

  // Admin
  listUsers: () => request('/users'),
  updateUserRole: (userId, body) => request(`/users/${userId}/role`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteUser: (userId) => request(`/users/${userId}`, { method: 'DELETE' }),
};

// AI endpoints
export const aiApi = {
  assist: (body) => request('/ai/assist', { method: 'POST', body: JSON.stringify(body) }),
  generateDescription: (body) => request('/ai/generate-description', { method: 'POST', body: JSON.stringify(body) }),
  suggestSubtasks: (body) => request('/ai/suggest-subtasks', { method: 'POST', body: JSON.stringify(body) }),
};
