'use client';

import { useState, useEffect } from 'react';
import { initializeGemini } from '@/lib/gemini';

interface GeminiSetupProps {
  onReady: () => void;
}

export default function GeminiSetup({ onReady }: GeminiSetupProps) {
  const [apiKey, setApiKey] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if API key is already in localStorage
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      try {
        initializeGemini(savedKey);
        setIsReady(true);
        onReady();
      } catch (err) {
        setError('Failed to initialize Gemini with saved key');
      }
    }
  }, [onReady]);

  const handleSetupKey = () => {
    if (!apiKey.trim()) {
      setError('Please enter a valid API key');
      return;
    }

    try {
      initializeGemini(apiKey);
      localStorage.setItem('gemini_api_key', apiKey);
      setIsReady(true);
      setError('');
      onReady();
    } catch (err) {
      setError('Failed to initialize Gemini. Please check your API key.');
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setIsReady(false);
    setError('');
  };

  if (isReady) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: 'green' }}>✓ Gemini API Ready</span>
        <button onClick={handleClearKey} style={{ fontSize: '12px', padding: '4px 8px' }}>
          Change Key
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
      <h3 style={{ marginBottom: '12px' }}>Setup Gemini API</h3>
      <div style={{ marginBottom: '12px' }}>
        <p style={{ fontSize: '14px', color: 'var(--text-color-secondary)', marginBottom: '8px' }}>
          Get your API key from{' '}
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#3B68FF' }}
          >
            Google AI Studio
          </a>
        </p>
        <input
          type="password"
          placeholder="Enter your Gemini API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSetupKey()}
          style={{ width: '100%', marginBottom: '8px' }}
        />
        {error && (
          <p style={{ color: 'red', fontSize: '14px', marginBottom: '8px' }}>{error}</p>
        )}
        <button onClick={handleSetupKey} style={{ width: '100%' }}>
          Initialize Gemini
        </button>
      </div>
    </div>
  );
} 