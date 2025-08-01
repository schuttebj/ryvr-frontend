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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { Client, QuestionnaireResponses, BusinessProfile, QUESTIONNAIRE_CATEGORIES } from '../types/client';

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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [isProfileGenerating, setIsProfileGenerating] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [responses, setResponses] = useState<QuestionnaireResponses>({} as QuestionnaireResponses);

  // Mock data for development
  useEffect(() => {
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
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddClient = () => {
    setIsAddDialogOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsAddDialogOpen(true);
  };

  const handleStartQuestionnaire = (client: Client) => {
    setSelectedClient(client);
    setResponses(client.questionnaireResponses || {} as QuestionnaireResponses);
    setCurrentCategory(0);
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
    } catch (error) {
      console.error('Failed to generate profile:', error);
    } finally {
      setIsProfileGenerating(false);
    }
  };

  const updateResponse = (categoryId: keyof QuestionnaireResponses, questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [questionId]: value
      }
    }));
  };

  const saveQuestionnaire = () => {
    if (!selectedClient) return;

    const updatedClients = clients.map(client =>
      client.id === selectedClient.id
        ? { ...client, questionnaireResponses: responses, updatedAt: new Date().toISOString() }
        : client
    );
    setClients(updatedClients);
    setIsQuestionnaireOpen(false);
  };

  const getQuestionnaireProgress = (client: Client) => {
    if (!client.questionnaireResponses) return 0;
    
    const totalQuestions = QUESTIONNAIRE_CATEGORIES.reduce((acc, cat) => acc + cat.questions.length, 0);
    const answeredQuestions = Object.values(client.questionnaireResponses).reduce((acc, category) => {
      return acc + Object.values(category || {}).filter(answer => answer && answer.trim()).length;
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
            <Typography variant="caption">
              Category {currentCategory + 1} of {QUESTIONNAIRE_CATEGORIES.length}
            </Typography>
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
            Save Progress
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