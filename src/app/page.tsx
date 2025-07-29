'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { JournalService } from '@/lib/journalService';
import AuthForm from '@/components/AuthForm';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { analyzeSentiment } from "@/ai/flows/analyze-sentiment";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, Trash2, Pause, Play, Heart, MessageCircle, Calendar, TrendingUp, Search, Filter } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

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
      const entries = await JournalService.getEntries(user.uid);
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
      await JournalService.createEntry(user.uid, entryText);

      // Reload entries to get the latest data
      await loadEntries();
      
      setEntryText(""); // Clear the textarea after saving
      setAudioURL(null); // Clear the audio URL after saving
      toast({
        title: "Success",
        description: "Journal entry saved!",
      });
    } catch (error) {
      console.error("Failed to save entry:", error);
      toast({
        title: "Error",
        description: "Failed to save journal entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      audioChunksRef.current = []; // Initialize the array to collect audio chunks
      recorder.start();
      setIsRecording(true);
      setIsPaused(false);

      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setIsRecording(false);
        setIsPaused(false);

        // Convert audio to text using a mock transcription
        // In a real implementation, you would send the audioBlob to a transcription service
        const transcribedText = "This is a voice note transcribed to text.";
        setEntryText(transcribedText);
      };
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording Failed",
        description: "Failed to start recording. Please check your microphone permissions.",
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

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!user) return;
    
    try {
      await JournalService.deleteEntry(id, user.uid);
      // Remove from local state after successful deletion
      setJournalEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id));
      toast({
        title: "Success",
        description: "Journal entry deleted!",
      });
    } catch (error) {
      console.error('Failed to delete entry:', error);
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
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Toaster />
      <div className="w-full max-w-md mb-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Echo Journal</h1>
        <Button 
          variant="outline" 
          onClick={async () => {
            try {
              await signOut(auth);
              toast({
                title: "Success",
                description: "Signed out successfully!",
              });
            } catch (error) {
              console.error('Sign out error:', error);
              toast({
                title: "Error",
                description: "Failed to sign out.",
                variant: "destructive",
              });
            }
          }}
        >
          Sign Out
        </Button>
      </div>
      <Card className="w-full max-w-md p-4">
        <CardHeader>
          <Label htmlFor="entryText">New Entry</Label>
        </CardHeader>
        <CardContent>
          <Textarea
            id="entryText"
            placeholder="Write about your day..."
            value={entryText}
            onChange={(e) => setEntryText(e.target.value)}
            className="mb-2"
          />
          {audioURL ? (
            <div className="mb-2">
              <audio src={audioURL} controls className="w-full"></audio>
            </div>
          ) : null}
          <div className="flex justify-between">
            {!isRecording && !isPaused && (
              <Button
                onClick={startRecording}
                className="bg-secondary text-secondary-foreground w-1/2 mr-1"
                disabled={isRecording}
              >
                <Mic className="mr-2 h-4 w-4" />
                Record Voice Note
              </Button>
            )}
            {isRecording && !isPaused && (
              <Button
                onClick={pauseRecording}
                className="bg-secondary text-secondary-foreground w-1/2 mr-1"
              >
                <Pause className="mr-2 h-4 w-4" />
                Pause Recording
              </Button>
            )}
            {isRecording && isPaused && (
              <Button
                onClick={resumeRecording}
                className="bg-secondary text-secondary-foreground w-1/2 mr-1"
              >
                <Play className="mr-2 h-4 w-4" />
                Resume Recording
              </Button>
            )}
            {isRecording && (
              <Button
                onClick={stopRecording}
                className="bg-secondary text-secondary-foreground w-1/2 ml-1"
              >
                Stop Recording
              </Button>
            )}
            {!isRecording && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-secondary text-secondary-foreground w-1/2 ml-1" disabled={!audioURL}>
                    Review Note
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Voice Note Preview</DialogTitle>
                    <DialogDescription>
                      Review your voice note before saving.
                    </DialogDescription>
                  </DialogHeader>
                  {audioURL && (
                    <audio src={audioURL} controls className="w-full"></audio>
                  )}
                  <DialogFooter>
                    <Button type="button" onClick={clearAudioNote}>
                      Clear
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
             {audioURL && !isRecording && !isPaused &&(
              <Button
                onClick={clearAudioNote}
                className="bg-secondary text-secondary-foreground w-1/2 ml-1"
              >
                Clear Note
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={handleSaveEntry} className="bg-accent text-accent-foreground">
            Save Entry
          </Button>
        </CardFooter>
      </Card>

      <div className="w-full max-w-md mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-primary flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Recent Entries
          </h2>
          <div className="text-sm text-muted-foreground">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
          </div>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All Moods</option>
              <option value="positive">😊 Positive</option>
              <option value="neutral">😐 Neutral</option>
              <option value="negative">😔 Negative</option>
            </select>
          </div>
        </div>

        <ScrollArea className="rounded-md border h-[400px] w-full">
          <div className="flex flex-col gap-3 p-4">
            {entriesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading entries...</p>
              </div>
            ) : filteredEntries.map((entry) => {
              const sentimentType = getSentimentType(entry.sentimentSummary);
              const isExpanded = expandedEntries.has(entry.id);
              const isLiked = likedEntries.has(entry.id);
              const shouldTruncate = entry.text.length > 150;
              
              return (
                <Card key={entry.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary/60">
                  <CardHeader className="flex flex-row items-start justify-between pb-3 space-y-0">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-lg">{getSentimentEmoji(sentimentType)}</span>
                        <p className="text-sm text-muted-foreground">{entry.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLike(entry.id)}
                        className={`h-8 w-8 p-0 transition-colors ${
                          isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                        <span className="sr-only">Like</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your entry from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteEntry(entry.id)}>Continue</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div>
                        <p className="text-foreground leading-relaxed">
                          {isExpanded || !shouldTruncate ? entry.text : truncateText(entry.text)}
                        </p>
                        {shouldTruncate && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => toggleExpand(entry.id)}
                            className="p-0 h-auto text-primary hover:text-primary/80 mt-1"
                          >
                            {isExpanded ? 'Show less' : 'Read more'}
                          </Button>
                        )}
                      </div>
                      
                      {entry.sentimentSummary && (
                        <div className="bg-muted/50 rounded-lg p-3 border-l-2 border-l-primary/30">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <Label className="text-sm font-medium text-foreground">
                              Mood Insight
                            </Label>
                          </div>
                          <p className={`text-sm ${getSentimentColor(sentimentType)} font-medium`}>
                            {entry.sentimentSummary}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {!entriesLoading && filteredEntries.length === 0 && journalEntries.length > 0 && (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No entries match your search.</p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchTerm('');
                    setSentimentFilter('all');
                  }}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              </div>
            )}
            
            {!entriesLoading && journalEntries.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No entries yet. Start writing!</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
