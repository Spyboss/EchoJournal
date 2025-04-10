"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { analyzeSentiment } from "@/ai/flows/analyze-sentiment";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  const [entryText, setEntryText] = useState("");
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  useEffect(() => {
    // Load entries from local storage on mount
    const savedEntries = localStorage.getItem("journalEntries");
    if (savedEntries) {
      setJournalEntries(JSON.parse(savedEntries));
    }
  }, []);

  useEffect(() => {
    // Save entries to local storage whenever journalEntries changes
    localStorage.setItem("journalEntries", JSON.stringify(journalEntries));
  }, [journalEntries]);

  const handleSaveEntry = async () => {
    if (entryText.trim() === "") {
      toast({
        title: "Error",
        description: "Journal entry cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    const newEntryId = generateId();
    const timestamp = new Date().toLocaleString();
    let sentimentSummary: string | undefined;

    try {
      const sentimentAnalysis = await analyzeSentiment({ journalEntry: entryText });
      sentimentSummary = sentimentAnalysis.summary;
    } catch (error) {
      console.error("Sentiment analysis failed:", error);
      toast({
        title: "Sentiment Analysis Failed",
        description: "Could not analyze sentiment. Please try again later.",
        variant: "destructive",
      });
    }

    const newEntry: JournalEntry = {
      id: newEntryId,
      text: entryText,
      timestamp: timestamp,
      sentimentSummary: sentimentSummary,
    };

    setJournalEntries((prevEntries) => [newEntry, ...prevEntries]);
    setEntryText(""); // Clear the textarea after saving
    setAudioURL(null); // Clear the audio URL after saving
    toast({
      title: "Success",
      description: "Journal entry saved!",
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);

      const audioChunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setIsRecording(false);

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
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
    }
  };

  const handleDeleteEntry = (id: string) => {
    setJournalEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id));
    toast({
      title: "Success",
      description: "Journal entry deleted!",
    });
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Toaster />
      <h1 className="text-3xl font-bold mb-4 text-primary">Echo Journal</h1>
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
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className="bg-secondary text-secondary-foreground w-1/2 mr-1"
              disabled={isRecording}
            >
              <Mic className="mr-2 h-4 w-4" />
              {isRecording ? "Recording..." : "Record Voice Note"}
            </Button>
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
                  <Button type="button" onClick={() => setAudioURL(null)}>
                    Clear
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
            {journalEntries.map((entry) => (
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
            {journalEntries.length === 0 && (
              <p className="text-muted-foreground">No entries yet. Start writing!</p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
