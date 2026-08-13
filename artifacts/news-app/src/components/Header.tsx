import { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import type { GetHeadlinesCategory } from '@workspace/api-client-react';

const CATEGORIES: { label: string; value: GetHeadlinesCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Business', value: 'business' },
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Health', value: 'health' },
  { label: 'Science', value: 'science' },
  { label: 'Sports', value: 'sports' },
  { label: 'Technology', value: 'technology' },
];

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeCategory: GetHeadlinesCategory | 'all';
  onCategoryChange: (cat: GetHeadlinesCategory | 'all') => void;
  totalResults?: number;
}

export function Header({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  totalResults,
}: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      {/* Masthead */}
      <div className="border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="font-serif-display font-black text-xl sm:text-2xl tracking-tight text-foreground leading-none">
                Tech Pulse
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5 font-medium">
                Understanding News in seconds.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{today}</p>
              {totalResults !== undefined && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{totalResults.toLocaleString()}</span> stories
                </p>
              )}
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="font-serif-display font-bold text-primary-foreground text-sm">T</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search + filters */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div
            className={`relative flex-1 transition-all duration-200 ${searchFocused ? 'ring-2 ring-ring ring-offset-1 ring-offset-background rounded-md' : ''}`}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              ref={inputRef}
              type="search"
              data-testid="input-search"
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-card border border-input rounded-md placeholder:text-muted-foreground focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                data-testid="button-clear-search"
                onClick={() => {
                  onSearchChange('');
                  inputRef.current?.focus();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category chips — horizontal scroll on mobile with fade hint */}
          <div className="relative w-full sm:w-auto flex-shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  data-testid={`chip-category-${cat.value}`}
                  onClick={() => onCategoryChange(cat.value)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap
                    ${activeCategory === cat.value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-card text-muted-foreground border border-input hover:border-primary/40 hover:text-foreground hover:bg-accent'
                    }`}
                >
                  {cat.label}
                </button>
              ))}
              {/* Spacer so last chip isn't flush against fade */}
              <div className="flex-shrink-0 w-6 sm:hidden" />
            </div>
            {/* Right-edge fade to signal scrollability — use actual background color */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 sm:hidden" style={{ background: 'linear-gradient(to left, hsl(40 28% 95%), transparent)' }} />
          </div>
        </div>

        {/* Active search indicator */}
        {searchQuery && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Showing results for
            </span>
            <span className="text-xs font-semibold text-primary bg-accent px-2 py-0.5 rounded-full border border-accent-border">
              {searchQuery}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
