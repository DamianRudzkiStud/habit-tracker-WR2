import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import StatsChart from '../components/StatsChart'

const StatsPage = () => {
  const [stats, setStats] = useState([])
  const [ranking, setRanking] = useState([])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const fetchStats = async () => {
    try {
      setError('')

      const [dailyResponse, rankingResponse] = await Promise.all([
        api.get('/stats/daily-activity?days=7'),
        api.get('/stats/ranking'),
      ])

      setStats(dailyResponse.data)
      setRanking(rankingResponse.data)
    } catch (error) {
      setError('Nie udało się pobrać statystyk. Sprawdź, czy backend jest uruchomiony.')
      console.log(error)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-green-50 text-slate-800">
      <nav className="bg-white border-b border-gray-300 px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">
          Habit Tracker
        </h1>

        <button
          onClick={() => navigate('/')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md"
        >
          Dashboard
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-semibold mb-8">
          Statystyki
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-md border border-gray-300 shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Aktywność z ostatnich 7 dni
          </h2>

          <StatsChart data={stats} />
        </div>

        <div className="bg-white p-6 rounded-md border border-gray-300 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">
            Ranking TOP 5 nawyków
          </h2>

          {ranking.length === 0 ? (
            <p className="text-gray-600">
              Brak danych do rankingu.
            </p>
          ) : (
            <div className="space-y-3">
              {ranking.map((item, index) => (
                <div
                  key={item.habit_name}
                  className="flex justify-between items-center bg-gray-50 border border-gray-200 p-4 rounded-md"
                >
                  <div>
                    <span className="text-emerald-700 font-semibold mr-3">
                      #{index + 1}
                    </span>

                    <span className="font-medium">
                      {item.habit_name}
                    </span>
                  </div>

                  <span className="text-gray-600">
                    {item.total_completions} wykonań
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatsPage