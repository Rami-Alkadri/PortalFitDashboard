"use client"

import { useState } from "react"
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