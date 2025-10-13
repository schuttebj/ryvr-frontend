import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Divider,
  Paper,
  Tooltip,
  // Switch,
  // FormControlLabel,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Description as FileIcon,
  Refresh as RefreshIcon,
  // AllInclusiveOutlined as AllIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import BusinessSelector from '../components/common/BusinessSelector';

// Import layout based on user role
import AdminLayout from '../components/layout/AdminLayout';
// import AgencyLayout from '../components/layout/AgencyLayout'; // Unused in simplified structure
import BusinessLayout from '../components/layout/BusinessLayout';

// API configuration - updated for new backend
import { API_BASE_URL } from '../config/api';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    file_id: number;
    filename: string;
    similarity: number;
  }>;
  context_found?: boolean;
  tokens_used?: number;
  credits_used?: number;
}

export default function ChatPage() {
  const { user, currentBusinessId, hasFeature, token } = useAuth();
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use current business context if no specific business selected
  const effectiveBusinessId = selectedBusinessId !== null ? selectedBusinessId : currentBusinessId;

  // Check if user can use cross-business chat
  const canUseCrossBusiness = hasFeature('cross_business_chat') || user?.role === 'admin';
  
  // Determine if we're in cross-business mode (when selectedBusinessId is explicitly null)
  const useCrossBusiness = selectedBusinessId === null && canUseCrossBusiness;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Check if we need a business context
    if (!useCrossBusiness && !effectiveBusinessId) {
      setError('Please select a business to chat with');
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setError(null);

    try {
      const endpoint = useCrossBusiness && canUseCrossBusiness 
        ? '/api/v1/embeddings/chat-all' 
        : '/api/v1/embeddings/chat';

      const requestBody: any = {
        message: inputMessage,
        model: 'gpt-4.1',
        temperature: 0.7,
        max_context_tokens: 16000,
        top_k: 5,
        similarity_threshold: 0.4,
      };

      // Add business_id only for single business chat
      if (!useCrossBusiness && effectiveBusinessId) {
        requestBody.business_id = effectiveBusinessId;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        sources: data.sources,
        context_found: data.context_found,
        tokens_used: data.tokens_used,
        credits_used: data.credits_used,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to send message');
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}. Please make sure you have uploaded documents and try again.`,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  const renderContent = () => (
    <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                📚 Chat with Your Documents
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ask questions and get answers from your uploaded files
              </Typography>
            </Box>
            {messages.length > 0 && (
              <Tooltip title="Clear chat">
                <IconButton onClick={handleClearChat} color="primary">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>

          {/* Business Selector */}
          <Box sx={{ mt: 2 }}>
            <BusinessSelector
              selectedBusinessId={selectedBusinessId}
              onBusinessChange={setSelectedBusinessId}
              allowAllOption={canUseCrossBusiness || user?.role === 'admin'} // Allow "All Businesses" for admins and cross-business users
            />
          </Box>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Messages Area */}
      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <CardContent sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {messages.length === 0 ? (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <Box>
                <BotIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Start a conversation
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                  Select a business and ask questions about your documents. I'll search through your files to find relevant information.
                </Typography>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Try asking:
                  </Typography>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    <Chip
                      label="What are our pricing strategies?"
                      onClick={() => setInputMessage("What are our pricing strategies?")}
                      size="small"
                      sx={{ cursor: 'pointer' }}
                    />
                    <Chip
                      label="Summarize our brand guidelines"
                      onClick={() => setInputMessage("Summarize our brand guidelines")}
                      size="small"
                      sx={{ cursor: 'pointer' }}
                    />
                    <Chip
                      label="What's in our latest report?"
                      onClick={() => setInputMessage("What's in our latest report?")}
                      size="small"
                      sx={{ cursor: 'pointer' }}
                    />
                  </Stack>
                </Box>
              </Box>
            </Box>
          ) : (
            <Stack spacing={3}>
              {messages.map((message, index) => (
                <Box key={index}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    {/* Avatar */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1,
                        borderRadius: '50%',
                        bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                        color: 'white',
                      }}
                    >
                      {message.role === 'user' ? <PersonIcon /> : <BotIcon />}
                    </Paper>

                    {/* Message Content */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                        {message.role === 'user' ? 'You' : 'AI Assistant'}
                      </Typography>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          bgcolor: message.role === 'user' ? 'background.default' : 'background.paper',
                          border: 1,
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {message.content}
                        </Typography>

                        {/* Sources */}
                        {message.sources && message.sources.length > 0 && (
                          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                              📄 Sources used:
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                              {message.sources.map((source, idx) => (
                                <Chip
                                  key={idx}
                                  icon={<FileIcon />}
                                  label={`${source.filename} (${Math.round(source.similarity * 100)}% match)`}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Stack>
                          </Box>
                        )}

                        {/* Credits Used */}
                        {message.credits_used !== undefined && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            💳 {message.credits_used} credits used
                          </Typography>
                        )}
                      </Paper>
                    </Box>
                  </Stack>
                </Box>
              ))}

              {/* Loading indicator */}
              {loading && (
                <Stack direction="row" spacing={2} alignItems="center">
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1,
                      borderRadius: '50%',
                      bgcolor: 'secondary.main',
                      color: 'white',
                    }}
                  >
                    <BotIcon />
                  </Paper>
                  <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                      AI Assistant
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="text.secondary">
                        Searching documents and generating response...
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              )}

              <div ref={messagesEndRef} />
            </Stack>
          )}
        </CardContent>

        <Divider />

        {/* Input Area */}
        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder={
                selectedBusinessId
                  ? "Ask a question about your documents..."
                  : "Select a business first..."
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!selectedBusinessId || loading}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.paper',
                },
              }}
            />
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || !selectedBusinessId || loading}
              sx={{ alignSelf: 'flex-end', minWidth: 100 }}
            >
              Send
            </Button>
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            💡 Tip: Press Enter to send, Shift+Enter for new line
          </Typography>
        </Box>
      </Card>
    </Box>
  );

  // Select appropriate layout based on user role
  if (user?.role === 'admin') {
    return <AdminLayout>{renderContent()}</AdminLayout>;
  } else {
    return <BusinessLayout>{renderContent()}</BusinessLayout>;
  }
}

