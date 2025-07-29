'use client';

import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sentimentFilter: string;
  setSentimentFilter: (filter: string) => void;
  totalEntries: number;
  filteredCount: number;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  setSearchTerm,
  sentimentFilter,
  setSentimentFilter,
  totalEntries,
  filteredCount
}) => {
  const hasActiveFilters = searchTerm || sentimentFilter !== 'all';

  const clearAllFilters = () => {
    setSearchTerm('');
    setSentimentFilter('all');
  };

  const sentimentOptions = [
    { value: 'all', label: 'All Moods', emoji: '🌈' },
    { value: 'positive', label: 'Positive', emoji: '😊' },
    { value: 'neutral', label: 'Neutral', emoji: '😐' },
    { value: 'negative', label: 'Negative', emoji: '😔' }
  ];

  return (
    <Card className="bg-card/50 backdrop-blur border-primary/10">
      <CardContent className="p-4 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search your thoughts and memories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 h-11 bg-background/50 border-primary/20 focus:border-primary/40 focus:ring-primary/20"
            aria-label="Search journal entries"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filter by mood:</span>
            </div>
            
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-[140px] h-9 bg-background/50 border-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sentimentOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.emoji}</span>
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results Summary and Clear Button */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {filteredCount} of {totalEntries} entries
              </Badge>
              {hasActiveFilters && (
                <Badge variant="outline" className="text-xs">
                  Filtered
                </Badge>
              )}
            </div>
            
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="h-8 text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                aria-label="Clear all filters"
              >
                <X className="h-3 w-3 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-primary/10">
            <span className="text-xs text-muted-foreground font-medium">Active filters:</span>
            {searchTerm && (
              <Badge variant="secondary" className="text-xs">
                Search: "{searchTerm}"
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                  aria-label="Remove search filter"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {sentimentFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Mood: {sentimentOptions.find(opt => opt.value === sentimentFilter)?.label}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSentimentFilter('all')}
                  className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                  aria-label="Remove mood filter"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchAndFilter;