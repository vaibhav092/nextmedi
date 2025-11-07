'use client';

import { useState } from 'react';
import { Upload, Loader2, AlertCircle, FileAudio, X } from 'lucide-react';

export default function MedicalAudioAnalyzer() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<string>('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('📁 File selected:', file);
    
    if (file) {
      setAudioFile(file);
      setError('');
      setAiResponse('');
      setTranscript('');
      console.log('✅ File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
    }
  };

  const transcribeAudio = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log('🎤 Starting transcription...');
      
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        console.error('❌ Speech Recognition not supported');
        reject(new Error('Speech recognition not supported in this browser'));
        return;
      }

      // Create audio element to play the file
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      let fullTranscript = '';

      recognition.onstart = () => {
        console.log('🎙️ Recognition started');
        audio.play().catch(err => {
          console.error('❌ Audio play error:', err);
        });
      };

      recognition.onresult = (event: any) => {
        console.log('📝 Recognition result received');
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join(' ');
        fullTranscript = transcript;
        console.log('✅ Transcript:', transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('❌ Recognition error:', {
          error: event.error,
          message: event.message
        });
        audio.pause();
        URL.revokeObjectURL(audio.src);
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      recognition.onend = () => {
        console.log('🏁 Recognition ended');
        audio.pause();
        URL.revokeObjectURL(audio.src);
        
        if (fullTranscript) {
          console.log('✅ Final transcript:', fullTranscript);
          resolve(fullTranscript);
        } else {
          console.warn('⚠️ No transcript generated');
          reject(new Error('No speech detected in audio'));
        }
      };

      recognition.start();
    });
  };

  const processAudio = async () => {
    if (!audioFile) {
      console.error('❌ No audio file selected');
      setError('Please select an audio file first.');
      return;
    }

    setIsProcessing(true);
    setError('');
    console.log('🚀 Starting audio processing...');

    try {
      // Transcribe audio
      console.log('📝 Transcribing audio...');
      const transcribedText = await transcribeAudio(audioFile);
      setTranscript(transcribedText);
      console.log('✅ Transcription complete:', transcribedText);

      // Send to API
      console.log('📤 Sending to API...');
      const response = await fetch('/api/AI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcribedText,
          timestamp: new Date().toISOString(),
        }),
      });

      console.log('📥 API response status:', response.status);

      if (!response.ok) {
        console.error('❌ API error:', response.status, response.statusText);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API response data:', data);
      
      setAiResponse(data.analysis || data.message || JSON.stringify(data, null, 2));
      console.log('✅ Processing complete!');
    } catch (err: any) {
      console.error('❌ Processing error:', err);
      setError(err.message || 'Failed to process audio. Check console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    console.log('🔄 Resetting form...');
    setAiResponse('');
    setError('');
    setAudioFile(null);
    setTranscript('');
  };

  const removeFile = () => {
    console.log('🗑️ Removing file...');
    setAudioFile(null);
    setTranscript('');
    setError('');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Medical Audio Analyzer</h1>
          <p className="mt-2">Upload audio files for AI-powered medical analysis</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Disclaimer */}
        <div className="border rounded-lg p-4 border-amber-200 flex gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm">
            <strong>Medical Disclaimer:</strong> This AI tool is for informational purposes only.
            Always consult a qualified healthcare professional.
          </p>
        </div>

        {/* Upload Section */}
        {!aiResponse && (
          <div className="border rounded-lg p-8 shadow-sm">
            <div className="text-center space-y-6">
              {/* File Upload */}
              {!audioFile ? (
                <label className="flex flex-col items-center gap-4 cursor-pointer">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center hover:border-blue-500 transition-colors">
                    <Upload className="w-12 h-12" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Upload Audio File</p>
                    <p className="text-sm mt-1">MP3, WAV, M4A, WebM, or OGG</p>
                  </div>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="space-y-4">
                  {/* Selected File Display */}
                  <div className="flex items-center justify-center gap-3 border rounded-lg p-4 bg-muted/50">
                    <FileAudio className="w-5 h-5" />
                    <span className="font-medium flex-1 text-left">{audioFile.name}</span>
                    <button
                      onClick={removeFile}
                      className="p-1 hover:bg-muted rounded transition-colors"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Process Button */}
                  <button
                    onClick={processAudio}
                    disabled={isProcessing}
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      'Analyze Audio'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="border border-red-300 rounded-lg p-4 bg-red-50 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-900 font-medium">{error}</p>
              <p className="text-xs text-red-700 mt-1">Check browser console (F12) for detailed logs</p>
            </div>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && !aiResponse && (
          <div className="border rounded-lg p-12 text-center shadow-sm">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
            <h3 className="text-xl font-semibold mt-4">Processing Audio...</h3>
            <p className="mt-2 text-muted-foreground">
              {transcript ? 'Sending to AI...' : 'Transcribing audio...'}
            </p>
            {transcript && (
              <div className="mt-4 p-3 bg-muted rounded-lg text-left text-sm">
                <p className="font-medium mb-1">Transcript Preview:</p>
                <p className="text-muted-foreground line-clamp-3">{transcript}</p>
              </div>
            )}
          </div>
        )}

        {/* AI Response */}
        {aiResponse && (
          <div className="space-y-4">
            <div className="border rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">AI Analysis</h2>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap leading-relaxed">{aiResponse}</div>
              </div>
            </div>

            {transcript && (
              <details className="border rounded-lg p-4 shadow-sm">
                <summary className="font-medium cursor-pointer">View Transcript</summary>
                <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">
                  {transcript}
                </p>
              </details>
            )}

            <button
              onClick={handleReset}
              className="w-full px-6 py-3 border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              New Analysis
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          For informational purposes only. Always consult a healthcare professional.
        </div>
      </footer>
    </div>
  );
}