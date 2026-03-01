"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface SearchResult {
  symbol: string;
  name: string;
  logo: string;
}

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {}

function SearchBar({ className, ...props }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Debounced search
  React.useEffect(() => {
    if (!query || query.length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
        setIsOpen(data.results?.length > 0);
        setSelectedIndex(-1);
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on click outside
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (symbol: string) => {
    setQuery("");
    setIsOpen(false);
    router.push(`/stock/${symbol}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex].symbol);
        } else if (results.length > 0) {
          handleSelect(results[0].symbol);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg bg-[#1a2332] px-3 py-2",
          isOpen && "rounded-b-none",
          className
        )}
      >
        <Search className={cn(
          "size-4 transition-colors",
          loading ? "text-[#2ecc71] animate-pulse" : "text-gray-400"
        )} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && results.length > 0 && setIsOpen(true)}
          placeholder="Search stocks, crypto..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-400 focus:outline-none"
          dir="ltr"
          autoComplete="off"
          {...props}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#1a2332] rounded-b-lg shadow-xl shadow-black/30 border-t border-[#2a3a4d] overflow-hidden z-50">
          {results.map((result, index) => (
            <button
              key={result.symbol}
              onClick={() => handleSelect(result.symbol)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 text-left transition-colors",
                "hover:bg-[#243447]",
                index === selectedIndex && "bg-[#243447]",
                index < results.length - 1 && "border-b border-[#2a3a4d]/50"
              )}
            >
              {/* Logo */}
              <div className="w-8 h-8 rounded-full bg-white overflow-hidden flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.logo}
                  alt={result.symbol}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `<span class="flex items-center justify-center w-full h-full text-black font-bold">${result.symbol[0]}</span>`;
                  }}
                />
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm">{result.symbol}</div>
                <div className="text-xs text-[#8b9eb3] truncate">{result.name}</div>
              </div>

              {/* Arrow indicator */}
              <svg 
                className="w-4 h-4 text-[#5a6b7d]" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export { SearchBar }
