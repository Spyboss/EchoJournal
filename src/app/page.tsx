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
import { Mic, Trash2, Pause, Play } from "lucide-react";
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

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

export default function Home() {
  const { user, loading } = useAuth();
  const [entryText, setEntryText] = useState("");
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const audioChunksRef = useRef<Blob[]>([]);

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
      // Save entry to Firebase
      await JournalService.createEntry(user.uid, entryText);
      
      // Analyze sentiment and update the entry
      let sentimentSummary: string | undefined;
      try {
        const sentimentAnalysis = await JournalService.analyzeSentiment(entryText);
        sentimentSummary = sentimentAnalysis.summary;
        
        // Update the entry with sentiment analysis
        await JournalService.updateEntrySentiment(user.uid, entryText, sentimentSummary);
      } catch (error) {
        console.error("Sentiment analysis failed:", error);
        // Don't fail the entire save if sentiment analysis fails
      }

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
        <h2 className="text-2xl font-semibold mb-3 text-primary">
          Recent Entries
        </h2>
        <ScrollArea className="rounded-md border h-[400px] w-full">
          <div className="flex flex-col gap-4 p-4">
            {entriesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading entries...</p>
              </div>
            ) : journalEntries.map((entry) => (
              <Card key={entry.id} className="mb-4 shadow-md rounded-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <p className="text-sm text-muted-foreground">{entry.timestamp}</p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
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
                </CardHeader>
                <CardContent>
                  <p className="text-gray-800">{entry.text}</p>
                  {entry.sentimentSummary && (
                    <div className="mt-2">
                      <Label className="text-sm text-muted-foreground">
                        Sentiment Summary:
                      </Label>
                      <p className="text-gray-700">{entry.sentimentSummary}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {!entriesLoading && journalEntries.length === 0 && (
              <p className="text-muted-foreground">No entries yet. Start writing!</p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
