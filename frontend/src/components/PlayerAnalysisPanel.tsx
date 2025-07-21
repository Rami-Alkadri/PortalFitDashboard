import { Button } from "@/components/ui/button"
import { Users, Star, BarChart3, Download } from "lucide-react"
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts"

function getFitScoreColor(score: number) {
  if (score >= 70) return "#22C55E"; // green
  if (score > 30) return "#F59E0B"; // orange (centered at 40, range 31-69)
  return "#EF4444"; // red for 30 and under
}

interface PlayerAnalysisPanelProps {
  player: any
}

export function PlayerAnalysisPanel({ player }: PlayerAnalysisPanelProps) {
  // Generate radar data for the triangle (Quality, Team Need, Style)
  const fitRadarData = player && player.breakdown ? [
    { subject: "Talent", Player: player.breakdown.Talent ?? 0, Ideal: 100 },
    { subject: "Team Need", Player: player.breakdown["Team Need"] ?? 0, Ideal: 100 },
    { subject: "Style", Player: player.breakdown.Style ?? 0, Ideal: 100 },
  ] : [];

  if (!player) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400" style={{ backgroundColor: "#0A0E27" }}>
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select a player to view detailed analysis</p>
        </div>
      </div>
    );
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
          <h3 className="text-lg font-semibold text-white mb-4">AI Summary</h3>
          <div className="space-y-3 text-gray-300">
            {(player.fitSummaryStruct && Array.isArray(player.fitSummaryStruct) && player.fitSummaryStruct.length > 0
              ? player.fitSummaryStruct.slice(0, 3)
              : player.fitSummary
                ? player.fitSummary.split(/\n|\r/).filter(Boolean).slice(0, 3).map((line: string) => ({ text: line, sentiment: "neutral" }))
                : [
                    { text: "No summary available.", sentiment: "neutral" },
                  ]
            ).map((b: any, idx: number) => {
              let dotColor = "bg-gray-400";
              if (b.sentiment === "positive") dotColor = "bg-[#22C55E]";
              else if (b.sentiment === "negative") dotColor = "bg-[#EF4444]";
              else if (b.sentiment === "neutral") dotColor = "bg-gray-400";
              else if (b.sentiment === "warning" || b.sentiment === "orange") dotColor = "bg-[#F59E0B]";
              // Strip leading dash and space
              const cleanText = b.text.replace(/^\s*-\s*/, "");
              return (
                <div className="flex items-start gap-3" key={b.text + idx}>
                  <div className={`w-2 h-2 ${dotColor} rounded-full mt-2 flex-shrink-0`} />
                  <p>{cleanText}</p>
                </div>
              );
            })}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Illini Fit Analysis</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={fitRadarData} outerRadius={90}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                <Radar name="Player" dataKey="Player" stroke="#FF5F05" fill="#FF5F05" fillOpacity={0.2} strokeWidth={2} />
                <Radar
                  name="Illinois Ideal"
                  dataKey="Ideal"
                  stroke="#13294B"
                  fill="#13294B"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          {/* Numeric stat display under the triangle */}
          {player && player.breakdown && (
            <div className="flex justify-around mt-1">
              {["Talent", "Team Need", "Style"].map((key) => (
                <div key={key} className="flex flex-col items-center">
                  <span
                    className="text-lg font-bold"
                    style={{ color: getFitScoreColor(player.breakdown[key] ?? 0) }}
                  >
                    {player.breakdown[key] ?? 0}
                  </span>
                  <span className="text-xs text-gray-300 mt-1">{key}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Season Stats</h3>
          <div className="bg-[#1A1F3A] p-4 rounded-lg border border-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">PPG</span>
                  <span className="text-white font-medium">{player.stats.ppg}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">RPG</span>
                  <span className="text-white font-medium">{player.stats.rpg}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">APG</span>
                  <span className="text-white font-medium">{player.stats.apg}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">2PT%</span>
                  <span className="text-white font-medium">{player.stats.fgPct ? Math.round(player.stats.fgPct * 100) : 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">3PT%</span>
                  <span className="text-white font-medium">{player.stats.fg3}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Min%</span>
                  <span className="text-white font-medium">{player.stats.minPct ? Math.round(player.stats.minPct * 100) : 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
} 