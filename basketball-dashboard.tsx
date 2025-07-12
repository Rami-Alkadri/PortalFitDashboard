"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Search,
  Settings,
  Eye,
  BarChart3,
  Grid3X3,
  List,
  Users,
  Download,
  Star,
  Clock,
  Filter,
  Menu,
} from "lucide-react"
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts"

// Sample data
const samplePlayers = [
  {
    id: 1,
    name: "Jaylen Clark",
    school: "UCLA",
    position: "Guard",
    fitScore: 84,
    similarTo: "Andre Curbelo",
    stats: { ppg: 13.2, rpg: 4.7, apg: 3.1, fg3: 35 },
    conference: "Pac-12",
    breakdown: { defense: 90, offense: 75, athletics: 85, roleFit: 88 },
    photo: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 2,
    name: "Jalen Wilson",
    school: "Kansas",
    position: "Forward",
    fitScore: 71,
    similarTo: "Coleman Hawkins",
    stats: { ppg: 19.1, rpg: 8.3, apg: 2.4, fg3: 33 },
    conference: "Big 12",
    breakdown: { defense: 70, offense: 85, athletics: 65, roleFit: 75 },
    photo: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 3,
    name: "Max Abmas",
    school: "Oral Roberts",
    position: "Guard",
    fitScore: 62,
    similarTo: "Alfonso Plummer",
    stats: { ppg: 22.8, rpg: 2.1, apg: 3.6, fg3: 38 },
    conference: "Summit",
    breakdown: { defense: 45, offense: 95, athletics: 60, roleFit: 55 },
    photo: "/placeholder.svg?height=80&width=80",
  },
]

const radarData = [
  { subject: "Defense", A: 90, B: 80, fullMark: 100 },
  { subject: "Offense", A: 75, B: 85, fullMark: 100 },
  { subject: "Athletics", A: 85, B: 70, fullMark: 100 },
  { subject: "Role Fit", A: 88, B: 75, fullMark: 100 },
  { subject: "Leadership", A: 70, B: 65, fullMark: 100 },
  { subject: "Clutch", A: 80, B: 70, fullMark: 100 },
]

function getFitScoreColor(score: number) {
  if (score >= 80) return "#22C55E"
  if (score >= 65) return "#F59E0B"
  return "#EF4444"
}

function PlayerCard({ player, isSelected, onSelect }: { player: any; isSelected: boolean; onSelect: () => void }) {
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

function FilterPanel() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPositions, setSelectedPositions] = useState<string[]>([])
  const [fitScoreRange, setFitScoreRange] = useState([0, 100])

  const positions = ["Guard", "Wing", "Forward", "Big"]
  const conferences = ["All Conferences", "Big Ten", "Big 12", "SEC", "ACC", "Pac-12", "Big East"]

  return (
    <div className="space-y-6 p-6 h-full overflow-y-auto" style={{ backgroundColor: "#0A0E27" }}>
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </h2>
      </div>

      <div>
        <Label className="text-white mb-3 block">Search Players</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#1A1F3A] border-gray-600 text-white placeholder-gray-400"
          />
        </div>
      </div>

      <div>
        <Label className="text-white mb-3 block">Position</Label>
        <div className="space-y-3">
          {positions.map((position) => (
            <div key={position} className="flex items-center space-x-3">
              <Checkbox
                id={position}
                checked={selectedPositions.includes(position)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedPositions([...selectedPositions, position])
                  } else {
                    setSelectedPositions(selectedPositions.filter((p) => p !== position))
                  }
                }}
                className="border-gray-600 data-[state=checked]:bg-[#FF5F05] data-[state=checked]:border-[#FF5F05]"
              />
              <Label htmlFor={position} className="text-gray-300 cursor-pointer">
                {position}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-white mb-3 block">Fit Score Range</Label>
        <Slider value={fitScoreRange} onValueChange={setFitScoreRange} max={100} min={0} step={1} className="w-full" />
        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <span>{fitScoreRange[0]}</span>
          <span>{fitScoreRange[1]}</span>
        </div>
      </div>

      <div>
        <Label className="text-white mb-3 block">Conference</Label>
        <Select>
          <SelectTrigger className="bg-[#1A1F3A] border-gray-600 text-white">
            <SelectValue placeholder="All Conferences" />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1F3A] border-gray-600">
            {conferences.map((conf) => (
              <SelectItem key={conf} value={conf} className="text-white hover:bg-gray-700">
                {conf}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-white mb-3 block">Sort By</Label>
        <Select>
          <SelectTrigger className="bg-[#1A1F3A] border-gray-600 text-white">
            <SelectValue placeholder="Fit Score (High to Low)" />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1F3A] border-gray-600">
            <SelectItem value="fit-high" className="text-white hover:bg-gray-700">
              Fit Score (High to Low)
            </SelectItem>
            <SelectItem value="fit-low" className="text-white hover:bg-gray-700">
              Fit Score (Low to High)
            </SelectItem>
            <SelectItem value="recent" className="text-white hover:bg-gray-700">
              Recently Added
            </SelectItem>
            <SelectItem value="ppg" className="text-white hover:bg-gray-700">
              Points Per Game
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function PlayerAnalysisPanel({ player }: { player: any }) {
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

export default function BasketballDashboard() {
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A0E27" }}>
      <div className="flex h-screen">
        {/* Desktop Filter Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-80 border-r border-gray-700">
          <FilterPanel />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="border-b border-gray-700 p-4 flex-shrink-0" style={{ backgroundColor: "#0A0E27" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Sheet */}
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="lg:hidden text-white hover:bg-[#1A1F3A]">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0" style={{ backgroundColor: "#0A0E27" }}>
                    <FilterPanel />
                  </SheetContent>
                </Sheet>

                <h1 className="text-2xl font-bold text-white">Portal Fit Predictor</h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={
                      viewMode === "grid" ? "bg-[#FF5F05] hover:bg-[#E54A00]" : "text-gray-400 hover:bg-[#1A1F3A]"
                    }
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={
                      viewMode === "list" ? "bg-[#FF5F05] hover:bg-[#E54A00]" : "text-gray-400 hover:bg-[#1A1F3A]"
                    }
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                <Badge variant="secondary" className="bg-[#13294B] text-[#FF5F05] hidden sm:flex">
                  <Eye className="h-3 w-3 mr-1" />
                  Watchlist: 7
                </Badge>

                <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="h-4 w-4" />
                  Updated 2 hours ago
                </div>

                <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-[#1A1F3A]">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          <div className="flex-1 flex min-h-0">
            {/* Player List */}
            <div className="flex-1 p-6 overflow-y-auto" style={{ backgroundColor: "#0A0E27" }}>
              <div className="space-y-4 max-w-4xl">
                {samplePlayers.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    isSelected={selectedPlayer?.id === player.id}
                    onSelect={() => setSelectedPlayer(player)}
                  />
                ))}
              </div>
            </div>

            {/* Analysis Panel - Hidden on mobile when no player selected */}
            <div className={`w-96 border-l border-gray-700 ${selectedPlayer ? "block" : "hidden lg:block"}`}>
              <PlayerAnalysisPanel player={selectedPlayer} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
