import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function getFitScoreColor(score: number) {
  if (score >= 80) return "#22C55E"
  if (score >= 65) return "#F59E0B"
  return "#EF4444"
}

interface PlayerCardProps {
  player: any
  isSelected: boolean
  onSelect: () => void
}

export function PlayerCard({ player, isSelected, onSelect }: PlayerCardProps) {
  // Determine status
  const status = (player.status || "").toLowerCase()
  const isCommitted = status === "committed" || status === "enrolled"
  const statusLabel = isCommitted ? "Committed" : "Available"
  const statusColor = isCommitted ? "bg-red-600 text-white" : "bg-green-600 text-white"

  // Use placeholder-user.jpg if photo is missing or empty
  const photoSrc = player.photo && player.photo !== "" ? player.photo : "/placeholder-user.jpg"

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-gray-700 ${
        isSelected ? "ring-2 ring-[#FF5F05] shadow-lg" : ""
      }`}
      style={{ backgroundColor: "#1A1F3A" }}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={photoSrc}
              alt={player.name}
              className="w-14 h-14 rounded-lg object-cover bg-gray-600 flex-shrink-0"
            />
            <div className="min-w-0">
              <h3 className="font-semibold text-white text-base truncate">{player.name}</h3>
              <p className="text-gray-400 text-xs truncate">
                {player.school} • {player.position}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end ml-2 min-w-fit">
            <div className="text-xl font-bold" style={{ color: getFitScoreColor(player.fitScore) }}>
              {player.fitScore}
            </div>
            <div className="text-[10px] text-gray-400">FIT</div>
            <span className={`mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${statusColor}`}>{statusLabel}</span>
          </div>
        </div>
        {/* Basic Stats Row */}
        <div className="flex gap-3 text-xs text-gray-300 mb-2 mt-2 ml-16">
          <div><span className="text-white font-medium">{player.stats?.ppg}</span> PPG</div>
          <div><span className="text-white font-medium">{player.stats?.rpg}</span> RPG</div>
          <div><span className="text-white font-medium">{player.stats?.apg}</span> APG</div>
          <div><span className="text-white font-medium">{player.stats?.fg3}%</span> 3PT</div>
        </div>
        {/* Breakdown Bar */}
        <div className="grid grid-cols-3 gap-2 mb-0 ml-16">
          {Object.entries(player.breakdown).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mb-0.5">
                <div className="h-full bg-[#FF5F05] transition-all duration-300" style={{ width: `${value}%` }} />
              </div>
              <div className="text-[10px] text-gray-400 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 