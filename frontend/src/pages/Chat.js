import React from 'react';
import AIChatbot from '../components/AIChatbot';

export default function Chat() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>AI Wellness Assistant</h1>
        <p className="text-muted mb-0">Get personalized mental health guidance powered by MindWatch AI</p>
      </div>
      <div style={{ height: 'calc(100vh - 220px)', minHeight: 480 }}>
        <AIChatbot embedded />
      </div>
    </div>
  );
}
