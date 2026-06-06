import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

const StatsChart = ({ data }) => {
  return (
    <div className="bg-white border border-gray-300 rounded-md p-4 h-[350px] shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
          />

          <YAxis
            tick={{ fontSize: 12 }}
          />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="completed_count"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
          />

        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default StatsChart