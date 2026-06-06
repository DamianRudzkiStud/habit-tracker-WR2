import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import HabitCard from '../components/HabitCard'
import AddHabitModal from '../components/AddHabitModal'

const DashboardPage = () => {
  const [habits, setHabits] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const fetchHabits = async () => {
    try {
      setError('')
      const response = await api.get('/habits/today')
      setHabits(response.data)
    } catch (error) {
      setError('Nie udało się pobrać nawyków. Sprawdź, czy backend jest uruchomiony.')
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHabits()
  }, [])

  return (
  <div className="min-h-screen bg-green-50 text-slate-800">
    <nav className="bg-white border-b border-gray-300 px-8 py-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">
        Habit Tracker
      </h1>

      <div className="flex gap-3">
        <button
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md"
          onClick={() => navigate('/stats')}
        >
          Statystyki
        </button>

        <button
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          onClick={() => {
            localStorage.removeItem('token')
            navigate('/login')
          }}
        >
          Wyloguj
        </button>
      </div>
    </nav>

    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          Dashboard
        </h1>

        <p className="text-gray-600 mt-2">
          Monitoruj swoje codzienne nawyki i rozwijaj dyscyplinę
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-md p-6 border border-gray-300 shadow-sm">
          <h2 className="text-xl font-semibold mb-5">
            Dzisiejszy progres
          </h2>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
              <p className="text-gray-600">Wszystkie</p>
              <h3 className="text-3xl font-semibold mt-2">
                {habits.length}
              </h3>
            </div>

            <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
              <p className="text-gray-600">Wykonane</p>
              <h3 className="text-3xl font-semibold mt-2 text-green-700">
                {habits.filter((habit) => habit.is_completed_today).length}
              </h3>
            </div>

            <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
              <p className="text-gray-600">Pozostało</p>
              <h3 className="text-3xl font-semibold mt-2 text-orange-700">
                {habits.filter((habit) => !habit.is_completed_today).length}
              </h3>
            </div>
          </div>
        </div>

        <div>
          <AddHabitModal refresh={fetchHabits} />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-5">
          Twoje nawyki
        </h2>

        {isLoading ? (
          <p className="text-gray-600">Ładowanie...</p>
        ) : habits.length === 0 ? (
          <div className="bg-white border border-gray-300 rounded-md p-6 text-gray-600 shadow-sm">
            Nie masz jeszcze żadnych nawyków. Dodaj pierwszy po prawej stronie.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                refresh={fetchHabits}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)
}

export default DashboardPage
