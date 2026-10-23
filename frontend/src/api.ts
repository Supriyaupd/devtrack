
const API_URL = import.meta.env.VITE_API_URL

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed')
  }

  return data
}

export async function loginUser(
  email: string,
  password: string
) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Login failed')
  }

  return data
}

export async function getApplications(token: string) {
  const response = await fetch(`${API_URL}/applications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch applications')
  }

  return data
}

export async function createApplication(
  token: string,
  application: {
    company: string
    position: string
    status: string
  }
) {
  const response = await fetch(`${API_URL}/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(application),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create application')
  }

  return data
}

export async function updateApplication(
  token: string,
  id: number,
  application: {
    company: string
    position: string
    status: string
  }
) {
  const response = await fetch(`${API_URL}/applications/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(application),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update application')
  }

  return data
}

export async function deleteApplication(
  token: string,
  id: number
) {
  const response = await fetch(`${API_URL}/applications/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete application')
  }

  return data
}
