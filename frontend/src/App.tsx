
import './App.css'
import { useEffect, useState } from 'react'
import {
  createApplication,
  getApplications,
  loginUser,
  registerUser,
  updateApplication,
} from './api'

type Application = {
  id: number
  company: string
  position: string
  status: string
}

function App() {
  const [showForm, setShowForm] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [editingApplication, setEditingApplication] =
    useState<Application | null>(null)
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  )
  const [isRegistering, setIsRegistering] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [applicationError, setApplicationError] = useState('')

  useEffect(() => {
    if (!token) return

    getApplications(token)
      .then((result) => setApplications(result.data))
      .catch((error) => console.error(error))
  }, [token])

  async function handleSubmit(
    event: React.SyntheticEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (!token) return

    const form = event.currentTarget
    const formData = new FormData(form)

    const application = {
      company: String(formData.get('company')).trim(),
      position: String(formData.get('position')).trim(),
      status: String(formData.get('status')),
    }

    setApplicationError('')

    try {
      if (editingApplication) {
        const result = await updateApplication(
          token,
          editingApplication.id,
          application
        )

        setApplications((current) =>
          current.map((app) =>
            app.id === editingApplication.id ? result.data : app
          )
        )
      } else {
        const result = await createApplication(token, application)
        setApplications((current) => [...current, result.data])
      }

      setShowForm(false)
      setEditingApplication(null)
      form.reset()
    } catch (error) {
      setApplicationError(
        error instanceof Error
          ? error.message
          : 'Failed to save application'
      )
    }
  }

  async function handleAuth(
    event: React.SyntheticEvent<HTMLFormElement>
  ) {
    event.preventDefault()
    setAuthError('')
    setAuthMessage('')

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email')).trim()
    const password = String(formData.get('password'))

    try {
      const user = isRegistering
        ? await registerUser(
            String(formData.get('name')).trim(),
            email,
            password
          )
        : await loginUser(email, password)

      if (isRegistering) {
        setIsRegistering(false)
        setAuthMessage('Registration successful. Please log in.')
        return
      }

      localStorage.setItem('token', user.token)
      setToken(user.token)
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : 'Authentication failed'
      )
    }
  }

  return (
    <main className="dashboard">
      {!token ? (
        <section className="application-form">
          <h2>{isRegistering ? 'Create Account' : 'Login'}</h2>

          {authError && <p>{authError}</p>}
          {authMessage && <p>{authMessage}</p>}

          <form onSubmit={handleAuth}>
            {isRegistering && (
              <label>
                Name
                <input type="text" name="name" required />
              </label>
            )}

            <label>
              Email
              <input type="email" name="email" required />
            </label>

            <label>
              Password
              <input type="password" name="password" required />
            </label>

            <button type="submit">
              {isRegistering ? 'Register' : 'Login'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering)
              setAuthError('')
              setAuthMessage('')
            }}
          >
            {isRegistering
              ? 'Already have an account? Login'
              : 'Create an account'}
          </button>
        </section>
      ) : (
        <>
          <header>
            <h1>DevTrack</h1>
            <p>Track your job applications in one place.</p>
            <button
              onClick={() => {
                localStorage.removeItem('token')
                setToken(null)
                setApplications([])
                setShowForm(false)
                setEditingApplication(null)
              }}
            >
              Logout
            </button>
          </header>

          <button
            onClick={() => {
              setEditingApplication(null)
              setApplicationError('')
              setShowForm(!showForm)
            }}
          >
            Add Application
          </button>

          {showForm && (
            <section className="application-form">
              <h2>
                {editingApplication ? 'Edit Application' : 'New Application'}
              </h2>

              {applicationError && <p>{applicationError}</p>}

              <form onSubmit={handleSubmit}>
                <label>
                  Company
                  <input
                    type="text"
                    name="company"
                    placeholder="e.g. Google"
                    defaultValue={editingApplication?.company ?? ''}
                    required
                  />
                </label>

                <label>
                  Position
                  <input
                    type="text"
                    name="position"
                    placeholder="e.g. Software Engineer"
                    defaultValue={editingApplication?.position ?? ''}
                    required
                  />
                </label>

                <label>
                  Status
                  <select
                    name="status"
                    defaultValue={editingApplication?.status ?? 'applied'}
                    required
                  >
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </label>

                <button type="submit">
                  {editingApplication ? 'Update Application' : 'Save Application'}
                </button>

                {editingApplication && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingApplication(null)
                      setApplicationError('')
                      setShowForm(false)
                    }}
                  >
                    Cancel
                  </button>
                )}
              </form>
            </section>
          )}

          <section className="summary">
            <article>
              <h2>Total Applications</h2>
              <p>{applications.length}</p>
            </article>

            <article>
              <h2>Interviews</h2>
              <p>
                {applications.filter((app) => app.status === 'interview').length}
              </p>
            </article>

            <article>
              <h2>Offers</h2>
              <p>
                {applications.filter((app) => app.status === 'offer').length}
              </p>
            </article>

            <article>
              <h2>Rejections</h2>
              <p>
                {applications.filter((app) => app.status === 'rejected').length}
              </p>
            </article>
          </section>

          <section className="applications">
            <h2>Your Applications</h2>

            {applications.length === 0 ? (
              <p>No applications to display yet.</p>
            ) : (
              applications.map((app) => (
                <article key={app.id}>
                  <h3>{app.company}</h3>
                  <p>{app.position}</p>
                  <p>Status: {app.status}</p>
                  <button
                    onClick={() => {
                      setEditingApplication(app)
                      setApplicationError('')
                      setShowForm(true)
                    }}
                  >
                    Edit
                  </button>
                </article>
              ))
            )}
          </section>
        </>
      )}
    </main>
  )
}

export default App
