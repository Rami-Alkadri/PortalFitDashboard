"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Settings,
  Eye,
  Grid3X3,
  List,
  Clock,
  Menu,
} from "lucide-react"
import { PlayerCard } from "./PlayerCard"
import { FilterPanel } from "./FilterPanel"
import { PlayerAnalysisPanel } from "./PlayerAnalysisPanel"

export default function BasketballDashboard() {
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [minFitScore, setMinFitScore] = useState(0)
  const [minTalent, setMinTalent] = useState(0)
  const [minTeamNeed, setMinTeamNeed] = useState(0)
  const [minStyle, setMinStyle] = useState(0)
  const [sortBy, setSortBy] = useState("fitScore")
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)

  useEffect(() => {
    fetch("/transfer-players-2026-merged.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load player data")
        return res.json()
      })
      .then((data) => {
        setPlayers(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Map loaded players to PlayerCard format
  const mappedPlayers = players.map((p, idx) => ({
    id: `json-${idx}`,
    name: p.player,
    school: p.team,
    position: p["247_position"] || p.role || "-",
    fitScore: p.fitScore,
    stats: {
      ppg: p.ppg || 0,
      rpg: p.dr || 0,
      apg: p.ast || 0,
      fg3: p.threePPct ? Math.round(p.threePPct * 100) : 0,
      fgPct: p.twoPPct || 0,
      minPct: p.minPct / 100 || 0,
    },
    conference: p.conf || "-",
    breakdown: {
      Talent: Math.round(p.qualityScore * 100),
      "Team Need": Math.round(p.needScore * 100),
      "Style": Math.round(p.styleScore * 100)
    },
    photo: p["247_imageUrl"] || "",
    status: p["247_status"] || "",
  }))

  const allPlayers = [...mappedPlayers]

  // Filter players by search term, role, and minimums
  const filteredPlayers = allPlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRoles.length === 0 || selectedRoles.includes(player.position);
    const matchesFitScore = player.fitScore >= minFitScore;
    const matchesTalent = (player.breakdown?.Talent ?? 0) >= minTalent;
    const matchesTeamNeed = (player.breakdown?.["Team Need"] ?? 0) >= minTeamNeed;
    const matchesStyle = (player.breakdown?.Style ?? 0) >= minStyle;
    const matchesAvailable = !showAvailableOnly || ((player.status || '').toLowerCase() !== 'committed' && (player.status || '').toLowerCase() !== 'enrolled');
    return matchesSearch && matchesRole && matchesFitScore && matchesTalent && matchesTeamNeed && matchesStyle && matchesAvailable;
  });
  // Sort filtered players
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sortBy === 'fitScore') return b.fitScore - a.fitScore;
    if (sortBy === 'Talent') return (b.breakdown?.Talent ?? 0) - (a.breakdown?.Talent ?? 0);
    if (sortBy === 'Team Need') return (b.breakdown?.["Team Need"] ?? 0) - (a.breakdown?.["Team Need"] ?? 0);
    if (sortBy === 'Style') return (b.breakdown?.Style ?? 0) - (a.breakdown?.Style ?? 0);
    return 0;
  });

  // Calculate available and committed counts
  const availableCount = allPlayers.filter(p => (p.status || '').toLowerCase() !== 'committed' && (p.status || '').toLowerCase() !== 'enrolled').length;
  const committedCount = allPlayers.filter(p => (p.status || '').toLowerCase() === 'committed' || (p.status || '').toLowerCase() === 'enrolled').length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A0E27" }}>
      <div className="flex h-screen">
        {/* Desktop Filter Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-80 border-r border-gray-700">
          <FilterPanel
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedRoles={selectedRoles}
            setSelectedRoles={setSelectedRoles}
            minFitScore={minFitScore}
            setMinFitScore={setMinFitScore}
            minTalent={minTalent}
            setMinTalent={setMinTalent}
            minTeamNeed={minTeamNeed}
            setMinTeamNeed={setMinTeamNeed}
            minStyle={minStyle}
            setMinStyle={setMinStyle}
            sortBy={sortBy}
            setSortBy={setSortBy}
            showAvailableOnly={showAvailableOnly}
            setShowAvailableOnly={setShowAvailableOnly}
          />
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
                    <FilterPanel
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      selectedRoles={selectedRoles}
                      setSelectedRoles={setSelectedRoles}
                      minFitScore={minFitScore}
                      setMinFitScore={setMinFitScore}
                      minTalent={minTalent}
                      setMinTalent={setMinTalent}
                      minTeamNeed={minTeamNeed}
                      setMinTeamNeed={setMinTeamNeed}
                      minStyle={minStyle}
                      setMinStyle={setMinStyle}
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      showAvailableOnly={showAvailableOnly}
                      setShowAvailableOnly={setShowAvailableOnly}
                    />
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
                {/* Available vs Committed Block */}
                <div className="flex gap-4 mb-4">
                  <div className="flex-1 flex flex-col items-center bg-green-900/40 rounded-lg p-3 border border-green-700">
                    <span className="text-lg font-bold text-green-400">{availableCount}</span>
                    <span className="text-xs text-green-200">Available</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center bg-red-900/40 rounded-lg p-3 border border-red-700">
                    <span className="text-lg font-bold text-red-400">{committedCount}</span>
                    <span className="text-xs text-red-200">Committed</span>
                  </div>
                </div>
                {loading && <div className="text-white">Loading players...</div>}
                {error && <div className="text-red-500">{error}</div>}
                {!loading && !error && sortedPlayers.map((player, idx) => (
                  <PlayerCard
                    key={player.id || idx}
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