import { useEffect, useState } from 'react'
import api from '../api/axios'

const HabitCard = ({ habit, refresh }) => {
  const [streak, setStreak] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(habit.name)
  const [editedCategory, setEditedCategory] = useState(habit.category)
  const [error, setError] = useState('')

  const fetchStreak = async () => {
    try {
      const response = await api.get(`/habits/${habit.id}/streak`)
      setStreak(response.data.current_streak)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    setEditedName(habit.name)
    setEditedCategory(habit.category)
    fetchStreak()
  }, [habit.id, habit.name, habit.category, habit.is_completed_today])

  const completeHabit = async () => {
    try {
      setError('')
      await api.post(`/habits/${habit.id}/complete`)
      refresh()
      fetchStreak()
    } catch (error) {
      setError('Nie udało się oznaczyć nawyku')
    }
  }

  const deleteHabit = async () => {
    try {
      setError('')
      await api.delete(`/habits/${habit.id}`)
      refresh()
    } catch (error) {
      setError('Nie udało się usunąć nawyku')
    }
  }

  const updateHabit = async () => {
    if (!editedName.trim()) {
      setError('Nazwa nie może być pusta')
      return
    }

    try {
      setError('')
      await api.patch(`/habits/${habit.id}`, {
        name: editedName.trim(),
        category: editedCategory,
      })

      setIsEditing(false)
      refresh()
    } catch (error) {
      setError('Nie udało się zapisać zmian')
    }
  }

  return (
    <div className="bg-white border border-gray-300 rounded-md p-5 shadow-sm">

      <div className="flex justify-between items-start mb-4">

        <div className="flex-1">

          {isEditing ? (
            <div className="space-y-3">

              <input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />

              <select
                value={editedCategory}
                onChange={(e) => setEditedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="praca">Praca</option>
                <option value="zdrowie">Zdrowie</option>
                <option value="relaks">Relaks</option>
              </select>

            </div>
          ) : (
            <>
              <h3 className="text-xl font-semibold">
                {habit.name}
              </h3>

              <p className="text-gray-600 mt-1">
                Kategoria: {habit.category}
              </p>
            </>
          )}

        </div>

        {!isEditing && (
          <button
            onClick={deleteHabit}
            className="text-red-600 hover:text-red-800"
          >
            Usuń
          </button>
        )}

      </div>

      {error && (
        <div className="text-red-600 text-sm mb-3">
          {error}
        </div>
      )}

      <div className="mb-4">

        <p className="mb-2">
          Status:
          {' '}
          {habit.is_completed_today ? (
            <span className="text-emerald-700 font-medium">
              Wykonano
            </span>
          ) : (
            <span className="text-amber-600 font-medium">
              Do wykonania
            </span>
          )}
        </p>

        <p>
          Seria dni:
          {' '}
          <strong>{streak}</strong>
        </p>

      </div>

      {isEditing ? (
        <div className="flex gap-2">

          <button
            onClick={updateHabit}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md"
          >
            Zapisz
          </button>

          <button
            onClick={() => {
              setIsEditing(false)
              setEditedName(habit.name)
              setEditedCategory(habit.category)
              setError('')
            }}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-md"
          >
            Anuluj
          </button>

        </div>
      ) : (
        <div className="flex gap-2">

          <button
            onClick={completeHabit}
            disabled={habit.is_completed_today}
            className={`flex-1 py-2 rounded-md text-white ${
              habit.is_completed_today
                ? 'bg-green-600'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {habit.is_completed_today ? 'Wykonano' : 'Wykonaj'}
          </button>

          <button
            onClick={() => setIsEditing(true)}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-md"
          >
            Edytuj
          </button>

        </div>
      )}

    </div>
  )
}

export default HabitCard