import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Search, Filter } from "lucide-react"

export function FilterPanel() {
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