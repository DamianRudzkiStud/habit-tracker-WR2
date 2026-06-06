import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

const RegisterPage = () => {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert('Hasła nie są takie same')
      return
    }

    try {
      await api.post(
        `/auth/register?username=${username}&password=${password}`
      )

      alert('Konto zostało utworzone')
      navigate('/login')
    } catch (error) {
      alert('Błąd rejestracji')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-lg w-full max-w-md shadow-md border border-gray-300"
      >
        <h1 className="text-3xl font-semibold text-center mb-2 text-gray-900">
          Rejestracja
        </h1>

        <p className="text-gray-600 text-center mb-8">
          Utwórz konto i zacznij korzystać z aplikacji
        </p>

        <input
          type="text"
          placeholder="Login"
          className="w-full p-3 rounded-md border border-gray-300 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Hasło"
          className="w-full p-3 rounded-md border border-gray-300 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Powtórz hasło"
          className="w-full p-3 rounded-md border border-gray-300 mb-6 outline-none focus:ring-2 focus:ring-blue-500"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white transition p-3 rounded-md font-semibold"
        >
          Utwórz konto
        </button>

        <p className="text-center text-gray-600 mt-6">
          Masz już konto?

          <Link
            to="/login"
            className="text-emerald-700 ml-2 hover:text-emerald-900"
          >
            Zaloguj się
          </Link>
        </p>
      </form>
    </div>
  )
}

export default RegisterPage