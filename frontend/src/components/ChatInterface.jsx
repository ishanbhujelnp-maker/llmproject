import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatInterface.css';

// Reusable Skeleton loader for the dashboard panels
function SkeletonLoader({ lines = 4, title = "Loading content" }) {
  return (
    <div className="skeleton-loader-panel" aria-label={title}>
      <div className="skeleton-line skeleton-header"></div>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton-line"></div>
      ))}
    </div>
  );
}

export default function ChatInterface({
  conversation,
  onSendMessage,
  isLoading,
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!conversation) {
    return (
      <div className="chat-interface">
        <div className="empty-state">
          <h2>Welcome to LLM Council</h2>
          <p>Select a consultation from the sidebar or start a new one to begin.</p>
        </div>
      </div>
    );
  }

  const userMsg = conversation.messages.find((m) => m.role === 'user');
  const assistantMsg = conversation.messages.find((m) => m.role === 'assistant');

  return (
    <div className="chat-interface">
      <div className="dashboard-container">
        {conversation.messages.length === 0 ? (
          <div className="empty-state">
            <h2>Start a New Council Consultation</h2>
            <p>Enter your question below. The council members will evaluate the query, critique each other's responses, and synthesize a master consensus report.</p>
          </div>
        ) : (
          <div className="council-dashboard">
            {userMsg && (
              <header className="dashboard-header">
                <span className="dashboard-badge">Congressional Consultation Brief</span>
                <h1 className="dashboard-query">“{userMsg.content}”</h1>
              </header>
            )}

            <div className="dashboard-workspace">
              {/* Left Column: Final Consensus Briefing (Stage 3) */}
              <div className="dashboard-main-panel">
                <h3 className="panel-section-title">Consensus Synthesis</h3>
                <div className="consensus-card">
                  {assistantMsg?.stage3 ? (
                    <div className="consensus-brief">
                      <div className="chairman-metadata">
                        <span className="meta-label">Synthesized by Chairman:</span>
                        <span className="meta-value">
                          {assistantMsg.stage3.model.split('/')[1] || assistantMsg.stage3.model}
                        </span>
                      </div>
                      <div className="consensus-text markdown-content">
                        <ReactMarkdown>{assistantMsg.stage3.response}</ReactMarkdown>
                      </div>
                    </div>
                  ) : isLoading ? (
                    <SkeletonLoader lines={12} title="Synthesizing final consensus..." />
                  ) : (
                    <div className="panel-placeholder">Waiting for council evaluation...</div>
                  )}
                </div>
              </div>

              {/* Right Column: Peer Scoreboard & Leaderboard (Stage 2) */}
              <div className="dashboard-side-panel">
                <h3 className="panel-section-title">Council Scoreboard</h3>
                <div className="scoreboard-card">
                  {assistantMsg?.stage2 ? (
                    <div className="scoreboard-content">
                      <h4 className="scoreboard-sub-title">Street Cred Leaderboard</h4>
                      {assistantMsg.metadata?.aggregate_rankings &&
                      assistantMsg.metadata.aggregate_rankings.length > 0 ? (
                        <div className="leaderboard-list">
                          {assistantMsg.metadata.aggregate_rankings.map((agg, idx) => (
                            <div key={idx} className="leaderboard-row">
                              <span className="lead-rank">#{idx + 1}</span>
                              <div className="lead-info">
                                <span className="lead-model">
                                  {agg.model.split('/')[1] || agg.model}
                                </span>
                                <span className="lead-score">
                                  Avg Rank: {agg.average_rank.toFixed(2)} ({agg.rankings_count} votes)
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="panel-placeholder">Aggregating ranks...</div>
                      )}

                      <h4 className="scoreboard-sub-title" style={{ marginTop: '24px' }}>
                        Peer Grading Matrix
                      </h4>
                      <div className="grading-matrix">
                        {assistantMsg.stage2.map((rank, i) => (
                          <div key={i} className="matrix-row">
                            <span className="matrix-model">
                              {rank.model.split('/')[1] || rank.model}
                            </span>
                            <div className="matrix-grades">
                              {rank.parsed_ranking && rank.parsed_ranking.length > 0 ? (
                                rank.parsed_ranking.map((label, idx) => {
                                  const modelName = assistantMsg.metadata?.label_to_model?.[label];
                                  const shortName = modelName
                                    ? modelName.split('/')[1] || modelName
                                    : label;
                                  return (
                                    <span key={idx} className="matrix-badge" title={`Ranked ${idx + 1}: ${shortName}`}>
                                      {idx + 1}. {shortName.split('-')[0].split(':')[0]}
                                    </span>
                                  );
                                })
                              ) : (
                                <span className="matrix-pending">No rankings extracted</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : isLoading && assistantMsg?.loading?.stage2 ? (
                    <SkeletonLoader lines={6} title="Conducting peer rankings..." />
                  ) : (
                    <div className="panel-placeholder">Waiting for grading phase...</div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Row: Side-by-Side Council Testimony (Stage 1) */}
            <div className="dashboard-bottom-section">
              <h3 className="panel-section-title">Council Member Testimony</h3>
              <div className="testimony-dashboard-grid">
                {assistantMsg?.stage1 ? (
                  assistantMsg.stage1.map((resp, i) => (
                    <div key={i} className="testimony-card">
                      <div className="testimony-card-header">
                        <span className="testimony-model-name">
                          {resp.model.split('/')[1] || resp.model}
                        </span>
                      </div>
                      <div className="testimony-card-body markdown-content">
                        <ReactMarkdown>{resp.response}</ReactMarkdown>
                      </div>
                    </div>
                  ))
                ) : isLoading && assistantMsg?.loading?.stage1 ? (
                  <div className="testimony-dashboard-grid">
                    <SkeletonLoader lines={6} title="Collecting testimony 1..." />
                    <SkeletonLoader lines={6} title="Collecting testimony 2..." />
                    <SkeletonLoader lines={6} title="Collecting testimony 3..." />
                  </div>
                ) : (
                  <div className="panel-placeholder">Waiting for testimony collection...</div>
                )}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {conversation.messages.length === 0 && (
        <form className="input-form" onSubmit={handleSubmit}>
          <textarea
            className="message-input"
            placeholder="Submit your consultation query to the council... (Press Enter to submit)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={2}
          />
          <button
            type="submit"
            className="send-button"
            disabled={!input.trim() || isLoading}
          >
            Consult
          </button>
        </form>
      )}
    </div>
  );
}
