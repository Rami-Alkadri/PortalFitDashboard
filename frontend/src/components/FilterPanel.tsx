import { Dispatch, SetStateAction } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Search, Filter } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface FilterPanelProps {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  selectedRoles: string[];
  setSelectedRoles: Dispatch<SetStateAction<string[]>>;
  minFitScore: number;
  setMinFitScore: Dispatch<SetStateAction<number>>;
  minTalent: number;
  setMinTalent: Dispatch<SetStateAction<number>>;
  minTeamNeed: number;
  setMinTeamNeed: Dispatch<SetStateAction<number>>;
  minStyle: number;
  setMinStyle: Dispatch<SetStateAction<number>>;
  sortBy: string;
  setSortBy: Dispatch<SetStateAction<string>>;
  showAvailableOnly: boolean;
  setShowAvailableOnly: Dispatch<SetStateAction<boolean>>;
}

export function FilterPanel({
  searchTerm,
  setSearchTerm,
  selectedRoles,
  setSelectedRoles,
  minFitScore,
  setMinFitScore,
  minTalent,
  setMinTalent,
  minTeamNeed,
  setMinTeamNeed,
  minStyle,
  setMinStyle,
  sortBy,
  setSortBy,
  showAvailableOnly,
  setShowAvailableOnly
}: FilterPanelProps) {
  // Unique roles for filter
  const roles = [
    "C",
    "Combo G",
    "PF/C",
    "Pure PG",
    "Scoring PG",
    "Stretch 4",
    "Wing F",
    "Wing G",
  ];

  return (
    <div className="space-y-4 p-4 h-full overflow-y-auto" style={{ backgroundColor: "#0A0E27" }}>
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

      {/* Show Available Only Toggle */}
      <div className="mb-2">
        <Button
          variant={showAvailableOnly ? "default" : "outline"}
          size="sm"
          className={showAvailableOnly ? "bg-green-700 text-white w-full" : "w-full border-green-700 text-green-400 border-2"}
          onClick={() => setShowAvailableOnly((v) => !v)}
        >
          {showAvailableOnly ? "Showing Available Only" : "Show Available Only"}
        </Button>
      </div>

      <div>
        <Label className="text-white mb-3 block">Role</Label>
        <div className="space-y-3">
          {roles.map((role) => (
            <div key={role} className="flex items-center space-x-3">
              <Checkbox
                id={role}
                checked={selectedRoles.includes(role)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedRoles([...selectedRoles, role])
                  } else {
                    setSelectedRoles(selectedRoles.filter((r) => r !== role))
                  }
                }}
                className="border-gray-600 data-[state=checked]:bg-[#FF5F05] data-[state=checked]:border-[#FF5F05]"
              />
              <Label htmlFor={role} className="text-gray-300 cursor-pointer">
                {role}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Sort By Dropdown */}
      <div>
        <Label className="text-white text-xs mb-1 block">Sort By</Label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="bg-[#1A1F3A] border-gray-600 text-white text-xs h-8">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1F3A] border-gray-600">
            <SelectItem value="fitScore" className="text-white text-xs hover:bg-gray-700">Fit Score</SelectItem>
            <SelectItem value="Talent" className="text-white text-xs hover:bg-gray-700">Talent</SelectItem>
            <SelectItem value="Team Need" className="text-white text-xs hover:bg-gray-700">Team Need</SelectItem>
            <SelectItem value="Style" className="text-white text-xs hover:bg-gray-700">Style</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Compact Sliders for Minimums */}
      <div className="grid grid-cols-1 gap-3">
        <div>
          <Label className="text-white text-xs mb-1 block">Min Fit Score</Label>
          <Slider value={[minFitScore]} onValueChange={([v]) => setMinFitScore(v)} max={100} min={0} step={1} className="w-full h-2 filter-slider" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{minFitScore}</span>
            <span>100</span>
          </div>
        </div>
        <div>
          <Label className="text-white text-xs mb-1 block">Min Talent</Label>
          <Slider value={[minTalent]} onValueChange={([v]) => setMinTalent(v)} max={100} min={0} step={1} className="w-full h-2 filter-slider" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{minTalent}</span>
            <span>100</span>
          </div>
        </div>
        <div>
          <Label className="text-white text-xs mb-1 block">Min Team Need</Label>
          <Slider value={[minTeamNeed]} onValueChange={([v]) => setMinTeamNeed(v)} max={100} min={0} step={1} className="w-full h-2 filter-slider" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{minTeamNeed}</span>
            <span>100</span>
          </div>
        </div>
        <div>
          <Label className="text-white text-xs mb-1 block">Min Style</Label>
          <Slider value={[minStyle]} onValueChange={([v]) => setMinStyle(v)} max={100} min={0} step={1} className="w-full h-2 filter-slider" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{minStyle}</span>
            <span>100</span>
          </div>
        </div>
      </div>

    </div>
  )
} 