import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { Client, QuestionnaireResponses, QUESTIONNAIRE_CATEGORIES } from '../types/client';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ClientsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [isProfileGenerating, setIsProfileGenerating] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [responses, setResponses] = useState<QuestionnaireResponses>({} as QuestionnaireResponses);
  const [lastSaved, setLastSaved] = useState<string>('');
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [newClientData, setNewClientData] = useState<{
    name: string;
    email: string;
    company: string;
    industry: string;
    phone: string;
    status: 'potential' | 'active' | 'inactive';
    tags: string[];
    notes: string;
  }>({
    name: '',
    email: '',
    company: '',
    industry: '',
    phone: '',
    status: 'potential',
    tags: [],
    notes: ''
  });

  // Load clients from localStorage or create mock data
  useEffect(() => {
    const savedClients = localStorage.getItem('ryvr_clients');
    
    if (savedClients) {
      try {
        const parsedClients = JSON.parse(savedClients);
        setClients(parsedClients);
        console.log('✅ Loaded clients from localStorage:', parsedClients.length, 'clients');
      } catch (error) {
        console.error('❌ Error parsing saved clients:', error);
        loadMockClients();
      }
    } else {
      loadMockClients();
    }
  }, []);

  const loadMockClients = () => {
    const mockClients: Client[] = [
      {
        id: '1',
        name: 'TechStart Solutions',
        email: 'contact@techstart.com',
        company: 'TechStart Solutions',
        industry: 'SaaS',
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T15:30:00Z',
        tags: ['Enterprise', 'Tech'],
        questionnaireResponses: {
          basic: {
            businessName: 'TechStart Solutions',
            founderName: 'Sarah Johnson, CEO',
            businessAge: '2-5 years',
            industry: 'SaaS',
            coreOffering: 'Project management software for small teams'
          }
        } as QuestionnaireResponses
      },
      {
        id: '2',
        name: 'Green Valley Consulting',
        email: 'info@greenvalley.com',
        company: 'Green Valley Consulting',
        industry: 'Consulting',
        status: 'potential',
        createdAt: '2024-02-01T09:00:00Z',
        updatedAt: '2024-02-01T09:00:00Z',
        tags: ['Consulting', 'Sustainability']
      }
    ];
    setClients(mockClients);
    saveClientsToStorage(mockClients);
    console.log('✅ Created mock clients data');
  };

  // Save clients to localStorage
  const saveClientsToStorage = (clientsData: Client[]) => {
    try {
      localStorage.setItem('ryvr_clients', JSON.stringify(clientsData));
      console.log('💾 Clients saved to localStorage');
    } catch (error) {
      console.error('❌ Error saving clients to localStorage:', error);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddClient = () => {
    setNewClientData({
      name: '',
      email: '',
      company: '',
      industry: '',
      phone: '',
      status: 'potential',
      tags: [],
      notes: ''
    });
    setIsAddClientOpen(true);
  };

  const handleSaveNewClient = () => {
    if (!newClientData.name.trim()) {
      alert('Please enter a client name');
      return;
    }

    // Check if client name already exists
    const existingClient = clients.find(client => 
      client.name.toLowerCase() === newClientData.name.trim().toLowerCase()
    );
    
    if (existingClient) {
      alert('A client with this name already exists. Please choose a different name.');
      return;
    }

    // Generate unique ID
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newClient: Client = {
      id: clientId,
      name: newClientData.name.trim(),
      email: newClientData.email.trim(),
      company: newClientData.company.trim(),
      industry: newClientData.industry.trim(),
      phone: newClientData.phone.trim(),
      status: newClientData.status,
      tags: newClientData.tags,
      notes: newClientData.notes.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedClients = [...clients, newClient];
    setClients(updatedClients);
    saveClientsToStorage(updatedClients);
    setIsAddClientOpen(false);
    
    console.log('✅ New client added:', newClient.name, 'with ID:', newClient.id);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    // TODO: Implement edit client dialog
    console.log('Edit client clicked:', client.name);
  };

  const handleStartQuestionnaire = (client: Client) => {
    setSelectedClient(client);
    setResponses(client.questionnaireResponses || {} as QuestionnaireResponses);
    setCurrentCategory(0);
    setLastSaved(''); // Reset auto-save indicator
    setIsQuestionnaireOpen(true);
  };

  const handleGenerateProfile = async (client: Client) => {
    if (!client.questionnaireResponses) {
      alert('Please complete the questionnaire first');
      return;
    }

    setIsProfileGenerating(true);
    try {
      // TODO: Implement AI profile generation
      console.log('Generating business profile for:', client.name);
      await new Promise(resolve => setTimeout(resolve, 3000)); // Mock delay
      
      // Update client with generated profile
      const updatedClients = clients.map(c => 
        c.id === client.id 
          ? { ...c, profileGeneratedAt: new Date().toISOString() }
          : c
      );
      setClients(updatedClients);
      saveClientsToStorage(updatedClients); // Persist to localStorage
    } catch (error) {
      console.error('Failed to generate profile:', error);
    } finally {
      setIsProfileGenerating(false);
    }
  };

  const updateResponse = (categoryId: keyof QuestionnaireResponses, questionId: string, value: string) => {
    const newResponses = {
      ...responses,
      [categoryId]: {
        ...responses[categoryId],
        [questionId]: value
      }
    };
    
    setResponses(newResponses);
    
    // Auto-save: Update the client immediately and persist to localStorage
    if (selectedClient) {
      const updatedClients = clients.map(client =>
        client.id === selectedClient.id
          ? { ...client, questionnaireResponses: newResponses, updatedAt: new Date().toISOString() }
          : client
      );
      setClients(updatedClients);
      saveClientsToStorage(updatedClients);
      setLastSaved(new Date().toLocaleTimeString());
      console.log('🔄 Auto-saved response for:', categoryId, questionId);
    }
  };

  const saveQuestionnaire = () => {
    if (!selectedClient) return;

    const updatedClients = clients.map(client =>
      client.id === selectedClient.id
        ? { ...client, questionnaireResponses: responses, updatedAt: new Date().toISOString() }
        : client
    );
    
    setClients(updatedClients);
    saveClientsToStorage(updatedClients); // Persist to localStorage
    setIsQuestionnaireOpen(false);
    
    console.log('✅ Questionnaire saved for client:', selectedClient.name);
  };

  const getQuestionnaireProgress = (client: Client) => {
    if (!client.questionnaireResponses) return 0;
    
    const totalQuestions = QUESTIONNAIRE_CATEGORIES.reduce((acc, cat) => acc + cat.questions.length, 0);
    const answeredQuestions = Object.values(client.questionnaireResponses).reduce((acc, category) => {
      return acc + Object.values(category || {}).filter(answer => answer && String(answer).trim()).length;
    }, 0);
    
    return Math.round((answeredQuestions / totalQuestions) * 100);
  };

  const renderClientsList = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">All Clients</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClient}
        >
          Add Client
        </Button>
      </Box>

      <Grid container spacing={3}>
        {clients.map((client) => {
          const progress = getQuestionnaireProgress(client);
          const hasProfile = !!client.businessProfile || !!client.profileGeneratedAt;

          return (
            <Grid item xs={12} md={6} lg={4} key={client.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="div">
                      {client.name}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {client.email}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Industry: {client.industry || 'Not specified'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip 
                      label={client.status} 
                      color={client.status === 'active' ? 'success' : client.status === 'potential' ? 'warning' : 'default'}
                      size="small"
                    />
                    {client.tags?.map(tag => (
                      <Chip key={tag} label={tag} variant="outlined" size="small" />
                    ))}
                  </Box>

                  {/* Questionnaire Progress */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption">Questionnaire</Typography>
                      <Typography variant="caption">{progress}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={progress} />
                  </Box>

                  {/* Business Profile Status */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {hasProfile ? (
                      <>
                        <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} fontSize="small" />
                        <Typography variant="caption" color="success.main">
                          Business Profile Generated
                        </Typography>
                      </>
                    ) : (
                      <>
                        <RadioButtonUncheckedIcon sx={{ color: 'text.secondary', mr: 1 }} fontSize="small" />
                        <Typography variant="caption" color="text.secondary">
                          Profile Pending
                        </Typography>
                      </>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleStartQuestionnaire(client)}
                    >
                      {progress > 0 ? 'Continue' : 'Start'} Questionnaire
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<AutoAwesomeIcon />}
                      onClick={() => handleGenerateProfile(client)}
                      disabled={progress < 50 || isProfileGenerating}
                    >
                      Generate Profile
                    </Button>
                    <IconButton size="small" onClick={() => handleEditClient(client)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );

  const renderQuestionnaire = () => {
    const category = QUESTIONNAIRE_CATEGORIES[currentCategory];
    
    return (
      <Dialog open={isQuestionnaireOpen} onClose={() => setIsQuestionnaireOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedClient?.name} - Business Questionnaire
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Typography variant="caption">
                Category {currentCategory + 1} of {QUESTIONNAIRE_CATEGORIES.length}
              </Typography>
              {lastSaved && (
                <Typography variant="caption" color="success.main" sx={{ fontSize: '0.7rem' }}>
                  ✓ Auto-saved at {lastSaved}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {category.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {category.description}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={((currentCategory + 1) / QUESTIONNAIRE_CATEGORIES.length) * 100}
              sx={{ mt: 2 }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {category.questions.map((question) => {
              const currentValue = responses[category.id]?.[question.id as keyof typeof responses[typeof category.id]] || '';
              
              return (
                <Box key={question.id}>
                  <Typography variant="subtitle1" gutterBottom>
                    {question.text}
                    {question.required && <span style={{ color: 'red' }}> *</span>}
                  </Typography>
                  
                  {question.helpText && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      {question.helpText}
                    </Typography>
                  )}
                  
                  {question.type === 'text' && (
                    <TextField
                      fullWidth
                      value={currentValue}
                      onChange={(e) => updateResponse(category.id, question.id, e.target.value)}
                      placeholder={question.placeholder}
                      variant="outlined"
                    />
                  )}
                  
                  {question.type === 'textarea' && (
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={currentValue}
                      onChange={(e) => updateResponse(category.id, question.id, e.target.value)}
                      placeholder={question.placeholder}
                      variant="outlined"
                    />
                  )}
                  
                  {question.type === 'select' && (
                    <FormControl fullWidth variant="outlined">
                      <Select
                        value={currentValue}
                        onChange={(e) => updateResponse(category.id, question.id, e.target.value as string)}
                      >
                        <MenuItem value="">
                          <em>Select an option</em>
                        </MenuItem>
                        {question.options?.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Box>
              );
            })}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setIsQuestionnaireOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => setCurrentCategory(Math.max(0, currentCategory - 1))}
            disabled={currentCategory === 0}
          >
            Previous
          </Button>
          <Button 
            onClick={() => setCurrentCategory(Math.min(QUESTIONNAIRE_CATEGORIES.length - 1, currentCategory + 1))}
            disabled={currentCategory === QUESTIONNAIRE_CATEGORIES.length - 1}
          >
            Next
          </Button>
          <Button variant="contained" onClick={saveQuestionnaire}>
            Close & Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Client Management
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="All Clients" />
          <Tab label="Business Profiles" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {renderClientsList()}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h5" gutterBottom>Business Profiles</Typography>
        <Typography variant="body1" color="text.secondary">
          AI-generated business profiles from completed questionnaires will appear here.
        </Typography>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h5" gutterBottom>Client Analytics</Typography>
        <Typography variant="body1" color="text.secondary">
          Client insights and analytics dashboard coming soon.
        </Typography>
      </TabPanel>

      {/* Add Client Dialog */}
      <Dialog open={isAddClientOpen} onClose={() => setIsAddClientOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6">Add New Client</Typography>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Client Name"
              value={newClientData.name}
              onChange={(e) => setNewClientData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
              placeholder="Enter client name"
            />
            
            <TextField
              label="Company"
              value={newClientData.company}
              onChange={(e) => setNewClientData(prev => ({ ...prev, company: e.target.value }))}
              fullWidth
              placeholder="Company name"
            />
            
            <TextField
              label="Email"
              type="email"
              value={newClientData.email}
              onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
              fullWidth
              placeholder="client@company.com"
            />
            
            <TextField
              label="Phone"
              value={newClientData.phone}
              onChange={(e) => setNewClientData(prev => ({ ...prev, phone: e.target.value }))}
              fullWidth
              placeholder="+1 (555) 123-4567"
            />
            
            <TextField
              label="Industry"
              value={newClientData.industry}
              onChange={(e) => setNewClientData(prev => ({ ...prev, industry: e.target.value }))}
              fullWidth
              placeholder="e.g., Technology, Healthcare, E-commerce"
            />
            
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={newClientData.status}
                label="Status"
                onChange={(e) => setNewClientData(prev => ({ ...prev, status: e.target.value as 'potential' | 'active' | 'inactive' }))}
              >
                <MenuItem value="potential">Potential</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Tags"
              value={newClientData.tags.join(', ')}
              onChange={(e) => {
                const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                setNewClientData(prev => ({ ...prev, tags }));
              }}
              fullWidth
              placeholder="e.g., Enterprise, SaaS, High Priority"
              helperText="Separate tags with commas"
            />
            
            <TextField
              label="Notes"
              value={newClientData.notes}
              onChange={(e) => setNewClientData(prev => ({ ...prev, notes: e.target.value }))}
              fullWidth
              multiline
              rows={3}
              placeholder="Additional notes about this client..."
            />
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setIsAddClientOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveNewClient}>
            Add Client
          </Button>
        </DialogActions>
      </Dialog>

      {renderQuestionnaire()}

      {/* Loading overlay for profile generation */}
      {isProfileGenerating && (
        <Dialog open={isProfileGenerating}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Generating Business Profile
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Our AI is analyzing the questionnaire responses to create a comprehensive business profile...
            </Typography>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
} 