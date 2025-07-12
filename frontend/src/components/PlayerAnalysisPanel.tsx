import { Button } from "@/components/ui/button"
import { Users, Star, BarChart3, Download } from "lucide-react"
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts"

function getFitScoreColor(score: number) {
  if (score >= 80) return "#22C55E"
  if (score >= 65) return "#F59E0B"
  return "#EF4444"
}

const radarData = [
  { subject: "Defense", A: 90, B: 80, fullMark: 100 },
  { subject: "Offense", A: 75, B: 85, fullMark: 100 },
  { subject: "Athletics", A: 85, B: 70, fullMark: 100 },
  { subject: "Role Fit", A: 88, B: 75, fullMark: 100 },
  { subject: "Leadership", A: 70, B: 65, fullMark: 100 },
  { subject: "Clutch", A: 80, B: 70, fullMark: 100 },
]

interface PlayerAnalysisPanelProps {
  player: any
}

export function PlayerAnalysisPanel({ player }: PlayerAnalysisPanelProps) {
  if (!player) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400" style={{ backgroundColor: "#0A0E27" }}>
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select a player to view detailed analysis</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: "#0A0E27" }}>
      <div className="sticky top-0 bg-[#0A0E27] p-6 border-b border-gray-700 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{player.name}</h2>
            <p className="text-gray-400">
              {player.school} • {player.position}
            </p>
          </div>
          <div className="text-4xl font-bold" style={{ color: getFitScoreColor(player.fitScore) }}>
            {player.fitScore}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Why this score?</h3>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#22C55E] rounded-full mt-2 flex-shrink-0" />
              <p>Elite defensive instincts and versatility match Illinois system perfectly</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#F59E0B] rounded-full mt-2 flex-shrink-0" />
              <p>Solid offensive production but needs improvement in half-court sets</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#22C55E] rounded-full mt-2 flex-shrink-0" />
              <p>Physical tools and athleticism ideal for Big Ten competition</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">System Fit Analysis</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                <Radar name="Player" dataKey="A" stroke="#FF5F05" fill="#FF5F05" fillOpacity={0.2} strokeWidth={2} />
                <Radar
                  name="Illinois Ideal"
                  dataKey="B"
                  stroke="#13294B"
                  fill="#13294B"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">vs Most Similar Illini</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-[#FF5F05]">{player.name}</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>PPG</span>
                  <span className="text-white font-medium">{player.stats.ppg}</span>
                </div>
                <div className="flex justify-between">
                  <span>RPG</span>
                  <span className="text-white font-medium">{player.stats.rpg}</span>
                </div>
                <div className="flex justify-between">
                  <span>APG</span>
                  <span className="text-white font-medium">{player.stats.apg}</span>
                </div>
                <div className="flex justify-between">
                  <span>3PT%</span>
                  <span className="text-white font-medium">{player.stats.fg3}%</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-[#13294B]">{player.similarTo}</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>PPG</span>
                  <span className="text-white font-medium">11.8</span>
                </div>
                <div className="flex justify-between">
                  <span>RPG</span>
                  <span className="text-white font-medium">4.2</span>
                </div>
                <div className="flex justify-between">
                  <span>APG</span>
                  <span className="text-white font-medium">4.8</span>
                </div>
                <div className="flex justify-between">
                  <span>3PT%</span>
                  <span className="text-white font-medium">32%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Projected Role at Illinois</h3>
          <div className="bg-[#1A1F3A] p-4 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-300">Expected Minutes</span>
              <span className="text-white font-semibold">22-28 MPG</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-300">Primary Role</span>
              <span className="text-white font-semibold">6th Man/Starter</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Impact Timeline</span>
              <span className="text-white font-semibold">Immediate</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button className="flex-1 bg-[#FF5F05] hover:bg-[#E54A00] text-white">
            <Star className="h-4 w-4 mr-2" />
            Add to Watchlist
          </Button>
          <Button variant="outline" className="flex-1 border-gray-600 text-white hover:bg-[#1A1F3A] bg-transparent">
            <BarChart3 className="h-4 w-4 mr-2" />
            Compare
          </Button>
          <Button variant="outline" className="border-gray-600 text-white hover:bg-[#1A1F3A] bg-transparent">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 