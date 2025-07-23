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
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSetupKey = async () => {
    if (!apiKey.trim()) {
      setError('Please enter a valid API key');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API validation
      initializeGemini(apiKey);
      localStorage.setItem('gemini_api_key', apiKey);
      setIsReady(true);
      setError('');
      onReady();
    } catch (err) {
      setError('Failed to initialize Gemini. Please check your API key.');
    } finally {
      setIsLoading(false);
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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        background: 'var(--bg-card)',
        border: '1px solid var(--success)',
        borderRadius: '12px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Success glow effect */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.1), transparent)',
          animation: 'shimmer 2s infinite'
        }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
          <div style={{
            width: '24px',
            height: '24px',
            background: 'var(--success)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px'
          }}>
            ✓
          </div>
          <div>
            <div style={{ 
              color: 'var(--text-primary)', 
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Gemini AI Connected
            </div>
            <div style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '12px',
              marginTop: '2px'
            }}>
              Ready for computer vision analysis
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleClearKey} 
          className="btn-ghost"
          style={{ 
            fontSize: '12px', 
            padding: '6px 12px',
            position: 'relative'
          }}
        >
          Change Key
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-primary)', 
      borderRadius: '16px',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px 16px',
        borderBottom: '1px solid var(--border-primary)',
        background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'var(--gradient-primary)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}>
            🤖
          </div>
          <h3 style={{ 
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            Setup Gemini AI
          </h3>
        </div>
        <p style={{ 
          fontSize: '14px', 
          color: 'var(--text-secondary)',
          margin: 0,
          lineHeight: '1.4'
        }}>
          Connect your Google AI Studio API key to enable computer vision analysis
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--text-secondary)', 
            marginBottom: '12px',
            lineHeight: '1.4'
          }}>
            Get your free API key from{' '}
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: 'var(--primary)',
                fontWeight: '500',
                textDecoration: 'none'
              }}
            >
              Google AI Studio
            </a>
          </p>
          
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              placeholder="Enter your Gemini API key (AIza...)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSetupKey()}
              disabled={isLoading}
              style={{ 
                width: '100%', 
                marginBottom: '16px',
                paddingRight: '50px',
                background: 'var(--bg-secondary)',
                border: `1px solid ${error ? 'var(--error)' : 'var(--border-primary)'}`,
                transition: 'all 0.2s ease'
              }}
            />
            
            {apiKey && (
              <div style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                marginBottom: '16px',
                color: 'var(--success)',
                fontSize: '16px'
              }}>
                ✓
              </div>
            )}
          </div>
          
          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--error)',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <p style={{ 
                color: 'var(--error)', 
                fontSize: '14px',
                margin: 0,
                fontWeight: '500'
              }}>
                {error}
              </p>
            </div>
          )}
          
          <button 
            onClick={handleSetupKey} 
            disabled={!apiKey.trim() || isLoading}
            className="btn-primary"
            style={{ 
              width: '100%',
              padding: '14px',
              fontSize: '15px',
              fontWeight: '600',
              position: 'relative'
            }}
          >
            {isLoading ? (
              <>
                <div 
                  className="spinner"
                  style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    marginRight: '8px'
                  }}
                />
                Connecting...
              </>
            ) : (
              <>
                <span style={{ fontSize: '16px', marginRight: '8px' }}>🚀</span>
                Initialize Gemini AI
              </>
            )}
          </button>
        </div>
        
        {/* Info Section */}
        <div style={{
          padding: '16px',
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--border-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '16px' }}>💡</span>
            <span style={{ 
              fontSize: '14px', 
              fontWeight: '500',
              color: 'var(--text-primary)'
            }}>
              Quick Start
            </span>
          </div>
          <ul style={{ 
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: '1.4',
            margin: 0,
            paddingLeft: '20px'
          }}>
            <li>Visit Google AI Studio</li>
            <li>Create a free API key</li>
            <li>Paste it above to get started</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 