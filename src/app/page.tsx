'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { JournalService } from '@/lib/journalService';
import AuthForm from '@/components/AuthForm';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
// Sentiment analysis temporarily disabled for static export
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, Trash2, Pause, Play, Heart, MessageCircle, Calendar, Search, Filter } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import SearchAndFilter from '@/components/SearchAndFilter';
import JournalEntryCard from '@/components/JournalEntryCard';
import { useAccessibility, useSkipNavigation } from '@/hooks/useAccessibility';

interface JournalEntry {
  id: string;
  text: string;
  timestamp: string;
  sentimentSummary?: string;
}

export default function Home() {
  const { user, loading } = useAuth();
  const [entryText, setEntryText] = useState("");
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [likedEntries, setLikedEntries] = useState<Set<string>>(new Set());
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  
  // Accessibility hooks
  const { announce, AnnouncementRegion } = useAccessibility();
  const { SkipLink } = useSkipNavigation();
  const audioChunksRef = useRef<Blob[]>([]);

  // Helper function to detect sentiment from summary
  const getSentimentType = (sentimentSummary?: string): string => {
    if (!sentimentSummary) return 'neutral';
    const summary = sentimentSummary.toLowerCase();
    if (summary.includes('positive') || summary.includes('happy') || summary.includes('joy')) return 'positive';
    if (summary.includes('negative') || summary.includes('sad') || summary.includes('angry')) return 'negative';
    return 'neutral';
  };

  // Helper function to get sentiment emoji
  const getSentimentEmoji = (sentimentType: string): string => {
    switch (sentimentType) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      default: return '😐';
    }
  };

  // Helper function to get sentiment color
  const getSentimentColor = (sentimentType: string): string => {
    switch (sentimentType) {
      case 'positive': return 'text-green-600 dark:text-green-400';
      case 'negative': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Filter entries based on search and sentiment
  const filteredEntries = journalEntries.filter(entry => {
    const matchesSearch = entry.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (entry.sentimentSummary?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesSentiment = sentimentFilter === 'all' || getSentimentType(entry.sentimentSummary) === sentimentFilter;
    return matchesSearch && matchesSentiment;
  });

  // Toggle like for an entry
  const toggleLike = (entryId: string) => {
    setLikedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  // Toggle expand for an entry
  const toggleExpand = (entryId: string) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  // Truncate text for preview
  const truncateText = (text: string, maxLength: number = 150): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  useEffect(() => {
    // Load entries from Firebase when user is authenticated
    if (user) {
      loadEntries();
    } else {
      setJournalEntries([]);
    }
  }, [user]);

  const loadEntries = async () => {
    if (!user) return;
    
    setEntriesLoading(true);
    try {
      const entries = await JournalService.getEntries(user.id);
      setJournalEntries(entries);
    } catch (error) {
      console.error('Failed to load entries:', error);
      toast({
        title: "Error",
        description: "Failed to load journal entries.",
        variant: "destructive",
      });
    } finally {
      setEntriesLoading(false);
    }
  };

  const handleSaveEntry = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to save entries.",
        variant: "destructive",
      });
      return;
    }

    if (entryText.trim() === "") {
      toast({
        title: "Error",
        description: "Journal entry cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save entry to Firebase (sentiment analysis is now included during creation)
      await JournalService.createEntry(user.id, entryText);

      // Reload entries to get the latest data
      await loadEntries();
      
      setEntryText(""); // Clear the textarea after saving
      setAudioURL(null); // Clear the audio URL after saving
      announce('Journal entry saved successfully');
      toast({
        title: "Success",
        description: "Journal entry saved!",
      });
    } catch (error) {
      console.error("Failed to save entry:", error);
      announce('Failed to save journal entry');
      toast({
        title: "Error",
        description: "Failed to save journal entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startRecording = async (event?: React.MouseEvent) => {
    // Prevent event bubbling and default behavior
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Prevent multiple simultaneous recording attempts
    if (isRecording || !navigator.mediaDevices) {
      return;
    }

    try {
      // Set recording state immediately to prevent double-clicks
      setIsRecording(true);
      setIsPaused(false);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/wav'
      });
      
      setMediaRecorder(recorder);
      audioChunksRef.current = []; // Initialize the array to collect audio chunks
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setIsRecording(false);
        setIsPaused(false);
        announce('Voice recording completed');

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());

        // Convert audio to text using a mock transcription
        // In a real implementation, you would send the audioBlob to a transcription service
        const transcribedText = "This is a voice note transcribed to text.";
        setEntryText(transcribedText);
      };

      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setIsRecording(false);
        setIsPaused(false);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      announce('Voice recording started');
      
    } catch (error) {
      console.error("Error starting recording:", error);
      announce('Failed to start voice recording');
      
      let errorMessage = "Failed to start recording. Please check your microphone permissions.";
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "Microphone access denied. Please allow microphone permissions and try again.";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "No microphone found. Please connect a microphone and try again.";
        }
      }
      
      toast({
        title: "Recording Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && isRecording && isPaused) {
      mediaRecorder.resume();
      setIsPaused(false);
    }
  };

  const stopRecording = (event?: React.MouseEvent) => {
    // Prevent event bubbling and default behavior
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (mediaRecorder && isRecording) {
      try {
        mediaRecorder.stop();
        setIsRecording(false);
        setIsPaused(false);
        announce('Voice recording stopped');
      } catch (error) {
        console.error('Error stopping recording:', error);
        setIsRecording(false);
        setIsPaused(false);
      }
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!user) return;
    
    try {
      await JournalService.deleteEntry(id, user.id);
      // Remove from local state after successful deletion
      setJournalEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id));
      announce('Journal entry deleted');
      toast({
        title: "Success",
        description: "Journal entry deleted!",
      });
    } catch (error) {
      console.error('Failed to delete entry:', error);
      announce('Failed to delete journal entry');
      toast({
        title: "Error",
        description: "Failed to delete journal entry.",
        variant: "destructive",
      });
    }
  };

  const clearAudioNote = () => {
    setAudioURL(null);
    setEntryText("");
  };


  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication form if user is not signed in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <Toaster />
        <h1 className="text-3xl font-bold mb-8 text-primary">Echo Journal</h1>
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <SkipLink />
      <AnnouncementRegion />
      <Toaster />


      {/* Main Content */}
      <main id="main-content" className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8" role="main">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* New Entry Section */}
            <div className="lg:col-span-1">
              <Card className="h-fit shadow-lg border-0 bg-card/50 backdrop-blur">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-primary" />
                    </div>
                    <Label htmlFor="entryText" className="text-lg font-semibold text-foreground">
                      New Entry
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Share your thoughts and feelings
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    id="entryText"
                    placeholder="What's on your mind today? Share your thoughts, feelings, or experiences..."
                    value={entryText}
                    onChange={(e) => setEntryText(e.target.value)}
                    className="min-h-[120px] resize-none border-0 bg-background/50 focus:bg-background transition-colors"
                    aria-label="Journal entry text"
                  />
                  {audioURL && (
                    <div className="p-3 bg-muted/50 rounded-lg border">
                      <Label className="text-sm font-medium mb-2 block">Voice Note</Label>
                      <audio src={audioURL} controls className="w-full" />
                    </div>
                  )}
                  {/* Voice Recording Controls */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-foreground">Voice Note</Label>
                      {isRecording && (
                        <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                          <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                          <span>Recording...</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {!isRecording && !isPaused && (
                        <Button
                          onClick={(e) => startRecording(e)}
                          variant="outline"
                          size="sm"
                          className="h-10"
                          disabled={isRecording}
                          aria-label="Start voice recording"
                          type="button"
                        >
                          <Mic className="mr-2 h-4 w-4" />
                          Record
                        </Button>
                      )}
                      
                      {isRecording && !isPaused && (
                        <Button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); pauseRecording(); }}
                          variant="outline"
                          size="sm"
                          className="h-10"
                          aria-label="Pause recording"
                          type="button"
                        >
                          <Pause className="mr-2 h-4 w-4" />
                          Pause
                        </Button>
                      )}
                      
                      {isRecording && isPaused && (
                        <Button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); resumeRecording(); }}
                          variant="outline"
                          size="sm"
                          className="h-10"
                          aria-label="Resume recording"
                          type="button"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Resume
                        </Button>
                      )}
                      
                      {isRecording && (
                        <Button
                          onClick={(e) => stopRecording(e)}
                          variant="destructive"
                          size="sm"
                          className="h-10"
                          aria-label="Stop recording"
                          type="button"
                        >
                          Stop
                        </Button>
                      )}
                      
                      {audioURL && !isRecording && (
                        <Button
                          onClick={clearAudioNote}
                          variant="outline"
                          size="sm"
                          className="h-10"
                          aria-label="Clear voice note"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button 
                    onClick={handleSaveEntry} 
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                    disabled={!entryText.trim() && !audioURL}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Save Entry
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Journal Entries Section */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                      <Calendar className="h-6 w-6 text-primary" />
                      Recent Entries
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
                      {(searchTerm || sentimentFilter !== 'all') && ' found'}
                    </p>
                  </div>
                </div>
                
                {/* Search and Filter Controls */}
                <SearchAndFilter
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  sentimentFilter={sentimentFilter}
                  setSentimentFilter={setSentimentFilter}
                  filteredCount={filteredEntries.length}
                  totalEntries={journalEntries.length}
                />

                {/* Journal Entries List */}
                <div className="space-y-4">
                  {entriesLoading ? (
                    <Card className="p-8 text-center bg-muted/30 border-0">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground font-medium">Loading your entries...</p>
                    </Card>
                  ) : filteredEntries.length > 0 ? (
                    <div className="space-y-4">
                      {filteredEntries.map((entry) => (
                        <JournalEntryCard
                          key={entry.id}
                          entry={entry}
                          isLiked={likedEntries.has(entry.id)}
                          isExpanded={expandedEntries.has(entry.id)}
                          onToggleLike={toggleLike}
                          onToggleExpand={toggleExpand}
                          onDelete={handleDeleteEntry}
                          getSentimentType={getSentimentType}
                          getSentimentEmoji={getSentimentEmoji}
                          getSentimentColor={getSentimentColor}
                          truncateText={truncateText}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card className="border-dashed border-2 border-muted-foreground/20">
                              <CardContent className="py-16">
                          <div className="flex flex-col items-center justify-center space-y-6 text-center">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                        <MessageCircle className="h-10 w-10 text-primary" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-xs text-primary font-bold">✨</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 max-w-md">
                      <h3 className="text-xl font-semibold text-foreground">
                        {searchTerm || sentimentFilter !== 'all' ? 'No matching entries found' : 'Your journal awaits'}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {searchTerm || sentimentFilter !== 'all' 
                          ? 'Try adjusting your search terms or filter criteria to find what you\'re looking for.' 
                          : 'Begin your mindful journaling journey. Share your thoughts, feelings, and experiences above.'}
                      </p>
                      
                      {(searchTerm || sentimentFilter !== 'all') && (
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSearchTerm('');
                            setSentimentFilter('all');
                          }}
                          className="mt-4"
                        >
                          Clear all filters
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
