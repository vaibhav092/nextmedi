'use client';

import { useState } from 'react';
import { Upload, Loader2, AlertCircle, FileAudio, X, Stethoscope, Activity, HeartPulse } from 'lucide-react';

export default function MedicalAudioAnalyzer() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setError('');
      setAiResponse('');
    }
  };

  const processAudio = async () => {
    if (!audioFile) {
      setError('Please select an audio file.');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');
      setAiResponse('');

      const buffer = await audioFile.arrayBuffer();
      const base64Audio = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const response = await fetch('/api/AI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio: base64Audio,
          mimeType: audioFile.type,
        }),
      });

      if (!response.ok) throw new Error('Audio analysis failed.');

      const data = await response.json();
      setAiResponse(data.analysis || 'No response from AI.');
    } catch (err: any) {
      console.error('❌ Audio Processing Error:', err);
      setError(err.message || 'Failed to process audio.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setAudioFile(null);
    setAiResponse('');
    setError('');
  };

  // Function to extract and format only relevant sections
  const getFormattedResponse = (text: string) => {
    if (!text) return null;

    const extractSection = (title: string) => {
      const regex = new RegExp(`\\*\\*${title}:\\*\\*[\\s\\S]*?(?=\\*\\*|$)`, 'i');
      const match = text.match(regex);
      return match ? match[0].replace(`**${title}:**`, '').trim() : '';
    };

    return {
      symptoms: extractSection('Key Symptoms'),
      conditions: extractSection('Possible Conditions'),
      recommendations: extractSection('Medical Recommendations'),
    };
  };

  const summary = getFormattedResponse(aiResponse);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Medical Audio Analyzer</h1>
          <p className="mt-2">Upload audio for Gemini AI-based analysis</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Disclaimer */}
        <div className="border rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm">
            <strong>Medical Disclaimer:</strong> For informational purposes only.
          </p>
        </div>

        {/* Upload Section */}
        {!aiResponse && (
          <div className="border rounded-lg p-8 shadow-sm">
            <div className="text-center space-y-6">
              {!audioFile ? (
                <label className="flex flex-col items-center gap-4 cursor-pointer">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center transition-colors">
                    <Upload className="w-12 h-12" />
                  </div>
                  <p className="font-semibold text-lg">Upload Audio File</p>
                  <p className="text-sm">MP3, WAV, WebM, or OGG</p>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3 border rounded-lg p-4">
                    <FileAudio className="w-5 h-5" />
                    <span className="font-medium">{audioFile.name}</span>
                    <button onClick={handleReset} className="p-1 rounded transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={processAudio}
                    disabled={isProcessing}
                    className="w-full px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing with Gemini...
                      </span>
                    ) : (
                      'Analyze with Gemini'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="border rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* AI Response */}
        {aiResponse && summary && (
          <div className="space-y-6">
            {/* Key Symptoms */}
            {summary.symptoms && (
              <div className="border rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">Key Symptoms</h2>
                </div>
                <div className="whitespace-pre-wrap text-sm">{summary.symptoms}</div>
              </div>
            )}

            {/* Possible Conditions */}
            {summary.conditions && (
              <div className="border rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">Possible Conditions</h2>
                </div>
                <div className="whitespace-pre-wrap text-sm">{summary.conditions}</div>
              </div>
            )}

            {/* Medical Recommendations */}
            {summary.recommendations && (
              <div className="border rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <HeartPulse className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">Medical Recommendations</h2>
                </div>
                <div className="whitespace-pre-wrap text-sm">{summary.recommendations}</div>
              </div>
            )}

            {/* Reset */}
            <button
              onClick={handleReset}
              className="w-full px-6 py-3 border rounded-lg font-medium transition"
            >
              New Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
