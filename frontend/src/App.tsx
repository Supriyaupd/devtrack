
import './App.css'
import { useEffect, useState } from 'react'
import {
  createApplication,
  deleteApplication,
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!token) {
      setApplications([])
      return
    }

    getApplications(token)
      .then((result) => setApplications(result.data))
      .catch((error) => console.error(error))
  }, [token])

  async function handleSubmit(
    event: React.SyntheticEvent<HTMLFormElement>
  ) {
    event.preventDefault()
    if (!token || isSubmitting) return

    const form = event.currentTarget
    const formData = new FormData(form)

    const application = {
      company: String(formData.get('company')).trim(),
      position: String(formData.get('position')).trim(),
      status: String(formData.get('status')),
    }

    setApplicationError('')
    setIsSubmitting(true)

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
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    if (!token) return

    const confirmed = window.confirm(
      'Are you sure you want to delete this application?'
    )

    if (!confirmed) return

    setApplicationError('')

    try {
      await deleteApplication(token, id)
      setApplications((current) =>
        current.filter((app) => app.id !== id)
      )
    } catch (error) {
      setApplicationError(
        error instanceof Error
          ? error.message
          : 'Failed to delete application'
      )
    }
  }

  async function handleAuth(
    event: React.SyntheticEvent<HTMLFormElement>
  ) {
    event.preventDefault()
    setAuthError('')
    setAuthMessage('')
    setIsSubmitting(true)

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
        setAuthMessage('Account created successfully. Please log in.')
        return
      }

      localStorage.setItem('token', user.token)
      setToken(user.token)
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : 'Authentication failed'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('token')
    setToken(null)
    setApplications([])
    setShowForm(false)
    setEditingApplication(null)
    setApplicationError('')
  }

  const interviewCount = applications.filter(
    (app) => app.status === 'interview'
  ).length

  const offerCount = applications.filter(
    (app) => app.status === 'offer'
  ).length

  const rejectionCount = applications.filter(
    (app) => app.status === 'rejected'
  ).length

  function formatStatus(status: string) {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <main className={`dashboard ${!token ? 'auth-layout' : ''}`}>
      {!token ? (
        <section className="auth-panel">
          <div className="brand-mark" aria-hidden="true">
            D
          </div>

          <p className="eyebrow">YOUR CAREER, ORGANIZED</p>
          <h1>{isRegistering ? 'Create your account' : 'Welcome back!'}</h1>
          <p className="auth-description">
            {isRegistering
              ? 'Start keeping all your job applications in one place.'
              : 'Your next opportunity starts here. Let’s pick up where you left off.'}
          </p>

          {authError && (
            <p className="message error-message" role="alert">
              {authError}
            </p>
          )}

          {authMessage && (
            <p className="message success-message" role="status">
              {authMessage}
            </p>
          )}

          <form className="auth-form" onSubmit={handleAuth}>
            {isRegistering && (
              <label>
                Full name
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  autoComplete="name"
                  required
                />
              </label>
            )}

            <label>
              Email address
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                autoComplete={
                  isRegistering ? 'new-password' : 'current-password'
                }
                required
              />
            </label>

            <button
              className="primary-button auth-submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Please wait...'
                : isRegistering
                  ? 'Create account'
                  : 'Log in to DevTrack'}
            </button>
          </form>

          <p className="auth-switch">
            {isRegistering
              ? 'Already have an account?'
              : "Don't have an account yet?"}{' '}
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setIsRegistering(!isRegistering)
                setAuthError('')
                setAuthMessage('')
              }}
            >
              {isRegistering ? 'Log in' : 'Sign up'}
            </button>
          </p>

          <p className="auth-footer">
            One organized step closer to your next opportunity.
          </p>
        </section>
      ) : (
        <>
          <div className="dashboard-heading">
            <header className="welcome-header">
              <div className="brand-line">
                <div className="brand-mark small-mark" aria-hidden="true">
                  D
                </div>
                <span>DevTrack</span>
              </div>
              <p className="eyebrow">YOUR CAREER DASHBOARD</p>
              <h1>Your next chapter starts here.</h1>
              <p className="welcome-description">
                Keep track of your applications and celebrate every step
                forward.
              </p>
            </header>

            <div className="dashboard-actions">
              <button
                className="primary-button"
                onClick={() => {
                  setEditingApplication(null)
                  setApplicationError('')
                  setShowForm(!showForm)
                }}
              >
                {showForm && !editingApplication
                  ? 'Close form'
                  : '+ Add application'}
              </button>

              <button className="secondary-button" onClick={handleLogout}>
                Log out
              </button>
            </div>
          </div>

          <section className="summary" aria-label="Application summary">
            <article className="summary-card total-card">
              <div className="summary-icon" aria-hidden="true">
                ↗
              </div>
              <h2>Total applications</h2>
              <p>{applications.length}</p>
              <span className="summary-note">Opportunities you're pursuing</span>
            </article>

            <article className="summary-card interview-card">
              <div className="summary-icon" aria-hidden="true">
                ✦
              </div>
              <h2>Interviews</h2>
              <p>{interviewCount}</p>
              <span className="summary-note">Chances to shine</span>
            </article>

            <article className="summary-card offer-card">
              <div className="summary-icon" aria-hidden="true">
                ✓
              </div>
              <h2>Offers</h2>
              <p>{offerCount}</p>
              <span className="summary-note">Great things ahead</span>
            </article>

            <article className="summary-card rejection-card">
              <div className="summary-icon" aria-hidden="true">
                ↻
              </div>
              <h2>Rejections</h2>
              <p>{rejectionCount}</p>
              <span className="summary-note">Keep moving forward</span>
            </article>
          </section>

          {showForm && (
            <section className="application-form">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">
                    {editingApplication ? 'UPDATE DETAILS' : 'NEW OPPORTUNITY'}
                  </p>
                  <h2>
                    {editingApplication
                      ? 'Edit application'
                      : 'Add an application'}
                  </h2>
                </div>

                <button
                  type="button"
                  className="close-button"
                  aria-label="Close application form"
                  onClick={() => {
                    setShowForm(false)
                    setEditingApplication(null)
                    setApplicationError('')
                  }}
                >
                  ×
                </button>
              </div>

              {applicationError && (
                <p className="message error-message" role="alert">
                  {applicationError}
                </p>
              )}

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
                  Job title
                  <input
                    type="text"
                    name="position"
                    placeholder="e.g. Software Engineer"
                    defaultValue={editingApplication?.position ?? ''}
                    required
                  />
                </label>

                <label>
                  Application status
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

                <div className="form-actions">
                  <button
                    className="primary-button"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? 'Saving...'
                      : editingApplication
                        ? 'Save changes'
                        : 'Save application'}
                  </button>

                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingApplication(null)
                      setApplicationError('')
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          )}

          {applicationError && !showForm && (
            <p className="message error-message" role="alert">
              {applicationError}
            </p>
          )}

          <section className="applications">
            <div className="section-heading applications-heading">
              <div>
                <p className="eyebrow">YOUR JOB SEARCH</p>
                <h2>Your applications</h2>
                <p className="section-description">
                  Every application is progress. Keep going!
                </p>
              </div>

              <span className="count-pill">
                {applications.length}{' '}
                {applications.length === 1 ? 'application' : 'applications'}
              </span>
            </div>

            {applications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon" aria-hidden="true">
                  ✦
                </div>
                <h3>Your journey starts here</h3>
                <p>
                  Add your first job application and keep all your opportunities
                  organized in one place.
                </p>
                <button
                  className="primary-button"
                  onClick={() => {
                    setEditingApplication(null)
                    setApplicationError('')
                    setShowForm(true)
                  }}
                >
                  + Add your first application
                </button>
              </div>
            ) : (
              <div className="application-list">
                {applications.map((app) => (
                  <article className="application-card" key={app.id}>
                    <div className="company-avatar" aria-hidden="true">
                      {app.company.trim().charAt(0).toUpperCase() || '?'}
                    </div>

                    <div className="application-details">
                      <h3>{app.company}</h3>
                      <p>{app.position}</p>
                      <span
                        className={`status-badge status-${app.status.toLowerCase()}`}
                      >
                        <span className="status-dot" />
                        {formatStatus(app.status)}
                      </span>
                    </div>

                    <div className="application-actions">
                      <button
                        className="secondary-button"
                        onClick={() => {
                          setEditingApplication(app)
                          setApplicationError('')
                          setShowForm(true)
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() => handleDelete(app.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <footer className="dashboard-footer">
            <p>Built for your next big opportunity. Keep going!</p>
          </footer>
        </>
      )}
    </main>
  )
}

export default App
