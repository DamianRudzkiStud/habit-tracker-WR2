import { useState } from 'react'
import api from '../api/axios'

const AddHabitModal = ({ refresh }) => {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('praca')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const addHabit = async () => {
    if (!name.trim()) {
      setError('Podaj nazwę nawyku')
      return
    }

    try {
      setError('')
      setIsSaving(true)

      await api.post('/habits/', {
        name: name.trim(),
        category,
      })

      setName('')
      setCategory('praca')
      refresh()
    } catch (error) {
      setError('Nie udało się dodać nawyku')
      console.log(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-md border border-gray-300 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">
        Dodaj nawyk
      </h2>

      {error && (
        <p className="text-red-600 text-sm mb-3">
          {error}
        </p>
      )}

      <input
        type="text"
        placeholder="Nazwa"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md mb-4"
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md mb-4"
      >
        <option value="praca">Praca</option>
        <option value="zdrowie">Zdrowie</option>
        <option value="relaks">Relaks</option>
      </select>

      <button
        onClick={addHabit}
        disabled={isSaving}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white p-2 rounded-md"
      >
        {isSaving ? 'Dodawanie...' : 'Dodaj'}
      </button>
    </div>
  )
}

export default AddHabitModal