import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()
  const { login } = useAuth()

  const handleLogin = async (e) => {
    e.preventDefault()

    const formData = new FormData()

    formData.append('username', username)
    formData.append('password', password)

    try {
      const response = await api.post('/auth/login', formData)

      localStorage.setItem(
        'token',
        response.data.access_token
      )

      login(response.data.access_token)

      navigate('/')
    } catch (error) {
      console.log(error)
      alert('Błędne dane logowania')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">

      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg w-full max-w-md shadow-md border border-gray-300"
      >

        <h1 className="text-3xl font-semibold text-center mb-2 text-gray-900">
          Habit Tracker
        </h1>

        <p className="text-gray-600 text-center mb-8">
          Zaloguj się do swojego konta
        </p>

        <input
          type="text"
          placeholder="Login"
          className="w-full p-3 rounded-md border border-gray-300 mb-4 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Hasło"
          className="w-full p-3 rounded-md border border-gray-300 mb-6 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white transition p-3 rounded-md font-semibold"
        >
          Zaloguj się
        </button>

        <p className="text-center text-gray-600 mt-6">
          Nie masz konta?

          <Link
            to="/register"
            className="text-emerald-700 ml-2 hover:text-emerald-900"
          >
            Rejestracja
          </Link>
        </p>

      </form>

    </div>
  )
}

export default LoginPage