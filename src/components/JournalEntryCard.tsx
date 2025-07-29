'use client';

import React from 'react';
import { Heart, Trash2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface JournalEntry {
  id: string;
  text: string;
  timestamp: string;
  sentimentSummary?: string;
}

interface JournalEntryCardProps {
  entry: JournalEntry;
  isLiked: boolean;
  isExpanded: boolean;
  onToggleLike: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onDelete: (id: string) => void;
  getSentimentType: (sentimentSummary?: string) => string;
  getSentimentEmoji: (sentimentType: string) => string;
  getSentimentColor: (sentimentType: string) => string;
  truncateText: (text: string, maxLength?: number) => string;
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({
  entry,
  isLiked,
  isExpanded,
  onToggleLike,
  onToggleExpand,
  onDelete,
  getSentimentType,
  getSentimentEmoji,
  getSentimentColor,
  truncateText
}) => {
  const sentimentType = getSentimentType(entry.sentimentSummary);
  const sentimentEmoji = getSentimentEmoji(sentimentType);
  const sentimentColor = getSentimentColor(sentimentType);
  const shouldTruncate = entry.text.length > 150;
  
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-0 bg-card/50 backdrop-blur hover:bg-card/70">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl" role="img" aria-label={`${sentimentType} mood`}>
              {sentimentEmoji}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <time 
                  className="text-sm font-medium text-foreground"
                  dateTime={entry.timestamp}
                >
                  {new Date(entry.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </time>
                <Badge 
                  variant="secondary" 
                  className={`text-xs px-2 py-1 ${sentimentColor} border-0`}
                >
                  {sentimentType}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleLike(entry.id)}
              className={`h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 ${
                isLiked ? 'text-red-600 bg-red-50 dark:bg-red-950/20' : 'text-muted-foreground'
              }`}
              aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete entry"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">Delete Journal Entry</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Are you sure you want to delete this journal entry? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-background hover:bg-muted">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(entry.id)}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="prose prose-sm max-w-none">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {isExpanded ? entry.text : truncateText(entry.text)}
          </p>
          
          {shouldTruncate && (
            <Button
              variant="link"
              size="sm"
              onClick={() => onToggleExpand(entry.id)}
              className="h-auto p-0 text-primary hover:text-primary/80 font-medium"
              aria-label={isExpanded ? 'Show less text' : 'Show more text'}
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </Button>
          )}
        </div>
        
        {entry.sentimentSummary && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-primary/10">
            <div className="flex items-start space-x-2">
              <div className="flex items-center space-x-1 flex-shrink-0">
                <TrendingUp className="h-4 w-4 text-primary" />
                <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                  AI Analysis
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {entry.sentimentSummary}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JournalEntryCard;