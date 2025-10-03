import { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormHelperText,
  Paper,
  Alert,
  CircularProgress,
  useTheme,
  Chip,
} from '@mui/material';
import type { 
  OnboardingTemplate, 
  OnboardingQuestion, 
  OnboardingAnswers
} from '../types/onboarding';

interface OnboardingWizardProps {
  onComplete: (answers: OnboardingAnswers) => void;
  onBack: () => void;
}

interface SectionQuestions {
  [section: string]: OnboardingQuestion[];
}

export default function OnboardingWizard({ 
  onComplete, 
  onBack 
}: OnboardingWizardProps) {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [template, setTemplate] = useState<OnboardingTemplate | null>(null);
  const [sections, setSections] = useState<SectionQuestions>({});
  const [sectionNames, setSectionNames] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    loadOnboardingTemplate();
  }, []);

  const loadOnboardingTemplate = async () => {
    setLoading(true);
    setError('');

    try {
      // For now, we'll use mock data until the backend endpoint is ready
      // TODO: Replace with actual API call
      // const template = await onboardingApi.getBusinessOnboardingTemplate();
      
      // Mock template data matching backend structure
      const mockTemplate: OnboardingTemplate = {
        id: 1,
        name: 'Business Onboarding',
        description: 'Tell us about your business',
        target_type: 'business',
        is_default: true,
        is_active: true,
        created_at: new Date().toISOString(),
        questions: [
          {
            id: 1,
            template_id: 1,
            section: 'basic',
            question_key: 'business_name',
            question_text: 'What is your business name?',
            question_type: 'text',
            options: [],
            is_required: true,
            placeholder: 'e.g., Acme Marketing Agency',
            sort_order: 1,
            is_active: true,
            created_at: new Date().toISOString(),
          },
          {
            id: 2,
            template_id: 1,
            section: 'basic',
            question_key: 'industry',
            question_text: 'What industry are you in?',
            question_type: 'text',
            options: [],
            is_required: true,
            placeholder: 'e.g., Digital Marketing, E-commerce',
            sort_order: 2,
            is_active: true,
            created_at: new Date().toISOString(),
          },
          {
            id: 3,
            template_id: 1,
            section: 'basic',
            question_key: 'website',
            question_text: 'What is your website URL?',
            question_type: 'text',
            options: [],
            is_required: false,
            placeholder: 'https://www.example.com',
            sort_order: 3,
            is_active: true,
            created_at: new Date().toISOString(),
          },
          {
            id: 4,
            template_id: 1,
            section: 'basic',
            question_key: 'business_type',
            question_text: 'What type of business are you?',
            question_type: 'select',
            options: ['E-commerce', 'Service-based', 'SaaS', 'Local Business', 'B2B', 'B2C', 'Non-profit'],
            is_required: false,
            sort_order: 4,
            is_active: true,
            created_at: new Date().toISOString(),
          },
          {
            id: 5,
            template_id: 1,
            section: 'audience',
            question_key: 'target_audience',
            question_text: 'Who is your target audience?',
            question_type: 'textarea',
            options: [],
            is_required: true,
            placeholder: 'Describe your ideal customer...',
            help_text: 'Be as specific as possible about demographics, interests, and pain points',
            sort_order: 5,
            is_active: true,
            created_at: new Date().toISOString(),
          },
          {
            id: 6,
            template_id: 1,
            section: 'audience',
            question_key: 'geographic_focus',
            question_text: 'What is your geographic focus?',
            question_type: 'select',
            options: ['Local', 'Regional', 'National', 'International'],
            is_required: false,
            sort_order: 6,
            is_active: true,
            created_at: new Date().toISOString(),
          },
          {
            id: 7,
            template_id: 1,
            section: 'marketing',
            question_key: 'current_marketing',
            question_text: 'What marketing channels are you currently using?',
            question_type: 'multiselect',
            options: ['SEO', 'Google Ads', 'Facebook Ads', 'Social Media', 'Email Marketing', 'Content Marketing', 'Traditional Advertising'],
            is_required: false,
            sort_order: 7,
            is_active: true,
            created_at: new Date().toISOString(),
          },
          {
            id: 8,
            template_id: 1,
            section: 'marketing',
            question_key: 'marketing_goals',
            question_text: 'What are your main marketing goals?',
            question_type: 'multiselect',
            options: ['Increase Website Traffic', 'Generate More Leads', 'Improve Brand Awareness', 'Boost Sales', 'Better Customer Engagement'],
            is_required: false,
            sort_order: 8,
            is_active: true,
            created_at: new Date().toISOString(),
          },
          {
            id: 9,
            template_id: 1,
            section: 'marketing',
            question_key: 'biggest_challenges',
            question_text: 'What are your biggest marketing challenges?',
            question_type: 'textarea',
            options: [],
            is_required: false,
            placeholder: 'Tell us about your challenges...',
            sort_order: 9,
            is_active: true,
            created_at: new Date().toISOString(),
          },
        ],
      };

      setTemplate(mockTemplate);
      
      // Group questions by section
      const groupedSections: SectionQuestions = {};
      mockTemplate.questions.forEach((question) => {
        if (!groupedSections[question.section]) {
          groupedSections[question.section] = [];
        }
        groupedSections[question.section].push(question);
      });

      // Sort questions within each section
      Object.keys(groupedSections).forEach((section) => {
        groupedSections[section].sort((a, b) => a.sort_order - b.sort_order);
      });

      setSections(groupedSections);
      setSectionNames(Object.keys(groupedSections));
    } catch (err: any) {
      console.error('Error loading onboarding template:', err);
      setError(err.message || 'Failed to load onboarding questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: number, value: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));

    // Clear validation error for this question
    if (validationErrors[questionId]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateSection = () => {
    const currentSection = sectionNames[activeStep];
    const currentQuestions = sections[currentSection] || [];
    const errors: Record<number, string> = {};

    currentQuestions.forEach((question) => {
      if (question.is_required && !answers[question.id]) {
        errors[question.id] = 'This field is required';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (!validateSection()) {
      return;
    }

    if (activeStep === sectionNames.length - 1) {
      // Last step - submit
      onComplete(answers);
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      onBack();
    } else {
      setActiveStep((prev) => prev - 1);
    }
  };

  const renderQuestionInput = (question: OnboardingQuestion) => {
    const value = answers[question.id] || '';
    const error = validationErrors[question.id];

    switch (question.question_type) {
      case 'text':
        return (
          <TextField
            fullWidth
            label={question.question_text}
            value={value}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder={question.placeholder}
            helperText={error || question.help_text}
            error={!!error}
            required={question.is_required}
            sx={{ mb: 3 }}
          />
        );

      case 'textarea':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            label={question.question_text}
            value={value}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder={question.placeholder}
            helperText={error || question.help_text}
            error={!!error}
            required={question.is_required}
            sx={{ mb: 3 }}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth sx={{ mb: 3 }} error={!!error} required={question.is_required}>
            <InputLabel>{question.question_text}</InputLabel>
            <Select
              value={value}
              label={question.question_text}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
            >
              <MenuItem value="">
                <em>Select an option</em>
              </MenuItem>
              {question.options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {(error || question.help_text) && (
              <FormHelperText>{error || question.help_text}</FormHelperText>
            )}
          </FormControl>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
        return (
          <FormControl fullWidth sx={{ mb: 3 }} error={!!error} required={question.is_required}>
            <Typography variant="subtitle1" gutterBottom>
              {question.question_text}
              {question.is_required && <span style={{ color: theme.palette.error.main }}> *</span>}
            </Typography>
            <FormGroup>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {question.options.map((option) => (
                  <Chip
                    key={option}
                    label={option}
                    onClick={() => {
                      const newValues = selectedValues.includes(option)
                        ? selectedValues.filter((v) => v !== option)
                        : [...selectedValues, option];
                      handleAnswer(question.id, newValues);
                    }}
                    color={selectedValues.includes(option) ? 'primary' : 'default'}
                    variant={selectedValues.includes(option) ? 'filled' : 'outlined'}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </FormGroup>
            {(error || question.help_text) && (
              <FormHelperText>{error || question.help_text}</FormHelperText>
            )}
          </FormControl>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!template || sectionNames.length === 0) {
    return (
      <Alert severity="warning">
        No onboarding questions found.
      </Alert>
    );
  }

  const currentSection = sectionNames[activeStep];
  const currentQuestions = sections[currentSection] || [];
  const sectionTitle = currentSection.charAt(0).toUpperCase() + currentSection.slice(1).replace('_', ' ');

  return (
    <Box>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {sectionNames.map((section) => (
          <Step key={section}>
            <StepLabel>{section.charAt(0).toUpperCase() + section.slice(1)}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          {sectionTitle}
        </Typography>

        {currentQuestions.map((question) => (
          <Box key={question.id}>
            {renderQuestionInput(question)}
          </Box>
        ))}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          sx={{
            px: 4,
            py: 1.5,
            textTransform: 'none',
            fontFamily: theme.typography.fontFamily,
          }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          sx={{
            px: 4,
            py: 1.5,
            textTransform: 'none',
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {activeStep === sectionNames.length - 1 ? 'Complete' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
}

