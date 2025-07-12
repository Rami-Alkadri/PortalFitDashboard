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
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-gray-700 ${
        isSelected ? "ring-2 ring-[#FF5F05] shadow-lg" : ""
      }`}
      style={{ backgroundColor: "#1A1F3A" }}
      onClick={onSelect}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <img
            src={player.photo || "/placeholder.svg"}
            alt={player.name}
            className="w-20 h-20 rounded-lg object-cover bg-gray-600 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-white text-xl truncate">{player.name}</h3>
                <p className="text-gray-400 text-sm">
                  {player.school} • {player.position}
                </p>
              </div>
              <div className="text-right ml-4">
                <div className="text-3xl font-bold mb-1" style={{ color: getFitScoreColor(player.fitScore) }}>
                  {player.fitScore}
                </div>
                <div className="text-xs text-gray-400">FIT SCORE</div>
              </div>
            </div>

            <Badge variant="secondary" className="mb-4 bg-[#13294B] text-[#FF5F05] border-[#FF5F05]">
              Most similar to: {player.similarTo}
            </Badge>

            <div className="grid grid-cols-4 gap-3 mb-4">
              {Object.entries(player.breakdown).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-[#FF5F05] transition-all duration-300" style={{ width: `${value}%` }} />
                  </div>
                  <div className="text-xs text-gray-400 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</div>
                </div>
              ))}
            </div>

            <div className="text-sm text-gray-400">
              {player.stats.ppg} PPG • {player.stats.rpg} RPG • {player.stats.fg3}% 3PT
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 