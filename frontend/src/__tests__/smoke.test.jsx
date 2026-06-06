import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import App from '../App'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import { AuthProvider } from '../context/AuthContext'

describe('Smoke testy GUI', () => {
  it('strona logowania renderuje formularz', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /habit tracker/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/login/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/hasło/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /zaloguj się/i })).toBeInTheDocument()
  })

  it('strona rejestracji renderuje formularz', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /rejestracja/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /utwórz konto/i })).toBeInTheDocument()
  })

  it('niezalogowany użytkownik jest przekierowany na ekran logowania', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    )

    expect(screen.getByRole('button', { name: /zaloguj się/i })).toBeInTheDocument()
  })
})
