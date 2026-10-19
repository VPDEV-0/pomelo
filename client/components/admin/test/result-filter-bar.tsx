"use client";

import { useEffect, useRef, useState } from "react";
import { useFilterParams } from "@/hooks/use-filter-params";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface ResultFilterBarProps {
  maxScore: number;
}

export function ResultFilterBar({ maxScore }: ResultFilterBarProps) {
  const { get, set, pending } = useFilterParams();

  const q = get("q");
  const score = get("score");
  const date = get("date");
  const sort = get("sort");

  const [searchInput, setSearchInput] = useState(q);
  const [seenQ, setSeenQ] = useState(q);
  const [lastPushed, setLastPushed] = useState(q);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Render-time sync: adjusts state when the URL's q changes externally or commits.
  // Calling setState during render is acceptable here because it is strictly conditional
  // on `q !== seenQ`, avoiding infinite loops and satisfying React 19 lint rules.
  if (q !== seenQ) {
    setSeenQ(q);
    if (q !== lastPushed) {
      setSearchInput(q);
      setLastPushed(q);
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const t = value.trim();
      setLastPushed(t);
      set({ q: t || undefined }, true);
    }, 400);
  };

  const updateParam = (key: string, value: string, defaultValue: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const t = searchInput.trim();
    setLastPushed(t);
    set({ [key]: value === defaultValue ? undefined : value, q: t || undefined });
  };

  const clearFilters = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSearchInput("");
    setLastPushed("");
    set({ q: undefined, score: undefined, date: undefined, sort: undefined });
  };

  const hasActiveFilters = !!(q || score || date || sort);

  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between transition-opacity ${pending ? "opacity-50" : ""}`}>
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={handleSearchChange}
            className="pl-8"
          />
        </div>
        
        <Select value={score || "all"} onValueChange={(v) => updateParam("score", v, "all")}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Score" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Scores</SelectItem>
            <SelectItem value="full">Full marks ({maxScore})</SelectItem>
            <SelectItem value="half_plus">50% and above</SelectItem>
            <SelectItem value="below_half">Below 50%</SelectItem>
            <SelectItem value="zero">Zero</SelectItem>
          </SelectContent>
        </Select>

        <Select value={date || "any"} onValueChange={(v) => updateParam("date", v, "any")}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any time</SelectItem>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort || "highest"} onValueChange={(v) => updateParam("sort", v, "highest")}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="highest">Highest score</SelectItem>
            <SelectItem value="lowest">Lowest score</SelectItem>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0">
          <X className="mr-2 h-4 w-4" />
          Clear filters
        </Button>
      )}
    </div>
  );
}