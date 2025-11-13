import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  Divider,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  InputAdornment,
  Snackbar,
  useTheme,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Api as ApiIcon,
  Psychology as AiIcon,
  Search as SeoIcon,
  Language as WordPressIcon,
  DragIndicator as DragIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  TrendingUp as TrendingUpIcon,
  IntegrationInstructions as IntegrationInstructionsIcon,
} from '@mui/icons-material';
import { useOpenAIModels } from '../hooks/useOpenAIModels';
import { 
  getSystemIntegrationStatus, 
  getDatabaseIntegrations,
  SystemIntegrationStatus
} from '../services/systemIntegrationApi';
import { integrationBuilderApi } from '../services/integrationBuilderApi';

interface Integration {
  id: string;
  name: string;
  provider: string;
  type: 'openai' | 'dataforseo' | 'wordpress' | 'google_analytics' | 'custom';
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, any>;
  lastTested?: string;
  createdAt: string;
  updatedAt: string;
  systemIntegrationStatus?: SystemIntegrationStatus;
  
  // NEW: Integration architecture fields
  integration_type: 'system' | 'account' | 'business';
  level: 'system' | 'account' | 'business';
  is_system_wide?: boolean;
  requires_user_config?: boolean;
  available_to_roles?: string[];
  is_enabled_for_agencies?: boolean;
  is_enabled_for_individuals?: boolean;
  is_enabled_for_businesses?: boolean;
  
  // Dynamic Integration fields
  is_dynamic?: boolean;
  platform_config?: {
    name: string;
    base_url: string;
    auth_type: string;
    color?: string;
    icon_url?: string;
    documentation_url?: string;
  };
  auth_config?: {
    type: string;
    credentials?: Array<{
      name: string;
      type: string;
      required: boolean;
      fixed: boolean;
      description: string;
      default?: any;
    }>;
  };
  operation_configs?: {
    operations?: any[];
  };
}

// Available account-level integrations - system integrations (OpenAI, DataForSEO) are managed separately
const availableIntegrations = [
  {
    type: 'wordpress' as const,
    name: 'WordPress',
    description: 'Sync content with WordPress sites including ACF and SEO data',
    icon: <WordPressIcon />,
    color: '#21759b',
    category: 'Content Management',
  },
  {
    type: 'google_analytics' as const,
    name: 'Google Analytics',
    description: 'Website traffic analysis and insights',
    icon: <TrendingUpIcon />,
    color: '#EA4335',
    category: 'Analytics',
  },
  {
    type: 'custom' as const,
    name: 'Custom API',
    description: 'Connect to any REST API endpoint',
    icon: <ApiIcon />,
    color: '#9c27b0',
    category: 'Custom',
  },
];

export default function IntegrationsPage() {
  const theme = useTheme();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [_selectedIntegrationType, setSelectedIntegrationType] = useState<'openai' | 'dataforseo' | 'wordpress' | 'google_analytics' | 'custom' | null>(null);
  
  // Use OpenAI models hook
  const { loading: modelsLoading, getModelOptions, fetchModelsWithApiKey } = useOpenAIModels();
  
  // WordPress API key generation and display
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    apiKey: string;
    businessId: string;
    ryvrEndpoint: string;
    integrationId: string;
  } | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [fetchingModels, setFetchingModels] = useState(false);
  
  // System integration state
  const [systemIntegrationStatuses, setSystemIntegrationStatuses] = useState<Record<string, SystemIntegrationStatus>>({});
  const [databaseIntegrations, setDatabaseIntegrations] = useState<Integration[]>([]);
  const [businessIntegrations, setBusinessIntegrations] = useState<any[]>([]); // Configured instances

  // Dynamic integration configuration state
  const [configuringDynamicIntegration, setConfiguringDynamicIntegration] = useState<any | null>(null);
  const [dynamicIntegrationFormData, setDynamicIntegrationFormData] = useState<Record<string, any>>({});
  const [savingDynamicConfig, setSavingDynamicConfig] = useState(false);
  const [testingDynamicConnection, setTestingDynamicConnection] = useState(false);
  const [dynamicTestResult, setDynamicTestResult] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'openai' as 'openai' | 'dataforseo' | 'wordpress' | 'google_analytics' | 'custom',
    // OpenAI fields
    apiKey: '',
    model: 'gpt-4o-mini',
    temperature: 1.0,
    maxCompletionTokens: 32768,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    stopSequences: [] as string[],
    responseFormat: 'text' as 'text' | 'json_object',
    // DataForSEO fields
    login: '',
    password: '',
    useSandbox: true,
    // WordPress fields
    siteUrl: '',
    wpApiKey: '',
    syncPostTypes: ['post', 'page'],
    syncAcfFields: true,
    syncRankmathData: true,
    syncTaxonomies: true,
    twoWaySync: true,
    defaultAuthorId: '',
    // Custom fields
    baseUrl: '',
    headers: '{}',
    testMode: false,
  });

  // Load integrations on mount
  useEffect(() => {
    loadIntegrations();
    loadDatabaseIntegrations(); // Load actual database integrations for system integration functionality
    loadBusinessIntegrations(); // Load business-configured integration instances
  }, []);

  // Load system integration statuses when integrations change
  useEffect(() => {
    if (integrations.length > 0 || databaseIntegrations.length > 0) {
      loadSystemIntegrationStatuses();
    }
  }, [integrations, databaseIntegrations]);

  const loadIntegrations = () => {
    try {
      const saved = localStorage.getItem('integrations');
      if (saved) {
        setIntegrations(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load integrations:', error);
    }
  };

  const saveIntegrations = (newIntegrations: Integration[]) => {
    try {
      localStorage.setItem('integrations', JSON.stringify(newIntegrations));
      setIntegrations(newIntegrations);
    } catch (error) {
      console.error('Failed to save integrations:', error);
    }
  };

  const loadDatabaseIntegrations = async () => {
    try {
      const dbIntegrations = await getDatabaseIntegrations();
      
      // Transform database integrations to match our Integration interface
      const transformedIntegrations = dbIntegrations.map((dbIntegration: any) => ({
        id: dbIntegration.id.toString(),
        name: dbIntegration.name,
        provider: dbIntegration.provider,
        type: mapProviderToType(dbIntegration.provider),
        status: 'connected' as const, // Assume connected for database integrations
        config: {},
        lastTested: dbIntegration.last_health_check,
        createdAt: dbIntegration.created_at,
        updatedAt: dbIntegration.updated_at,
        
        // NEW: Integration architecture fields
        integration_type: dbIntegration.integration_type,
        level: dbIntegration.level,
        is_system_wide: dbIntegration.is_system_wide,
        requires_user_config: dbIntegration.requires_user_config,
        available_to_roles: dbIntegration.available_to_roles,
        is_enabled_for_agencies: dbIntegration.is_enabled_for_agencies,
        is_enabled_for_individuals: dbIntegration.is_enabled_for_individuals,
        is_enabled_for_businesses: dbIntegration.is_enabled_for_businesses,
        
        // Dynamic Integration fields
        is_dynamic: dbIntegration.is_dynamic,
        platform_config: dbIntegration.platform_config,
        auth_config: dbIntegration.auth_config,
        operation_configs: dbIntegration.operation_configs,
      }));
      
      setDatabaseIntegrations(transformedIntegrations);
    } catch (error) {
      console.error('Failed to load database integrations:', error);
    }
  };

  // Helper function to map provider names to types
  const mapProviderToType = (provider: string): 'openai' | 'dataforseo' | 'wordpress' | 'google_analytics' | 'custom' => {
    switch (provider.toLowerCase()) {
      case 'openai': return 'openai';
      case 'dataforseo': return 'dataforseo';
      case 'wordpress': return 'wordpress';
      case 'google_analytics': return 'google_analytics';
      default: return 'custom';
    }
  };

  const loadBusinessIntegrations = async () => {
    try {
      const businessId = localStorage.getItem('selected_business_id') || '1';
      const response = await fetch(
        `${(import.meta as any).env?.VITE_API_URL || 'https://ryvr-backend.onrender.com'}/api/v1/businesses/${businessId}/integrations`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('ryvr_token')}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setBusinessIntegrations(data);
        console.log('Loaded business integrations:', data);
      }
    } catch (error) {
      console.error('Failed to load business integrations:', error);
    }
  };


  const loadSystemIntegrationStatuses = async () => {
    try {
      const statuses: Record<string, SystemIntegrationStatus> = {};
      
      // Use database integrations for system integration status loading
      const integrationsToCheck = databaseIntegrations.length > 0 ? databaseIntegrations : integrations;
      
      for (const integration of integrationsToCheck) {
        try {
          const status = await getSystemIntegrationStatus(parseInt(integration.id));
          statuses[integration.id] = status;
        } catch (error) {
          console.error(`Failed to load system status for ${integration.name}:`, error);
        }
      }
      
      setSystemIntegrationStatuses(statuses);
    } catch (error) {
      console.error('Failed to load system integration statuses:', error);
    }
  };


  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const openDialog = (integration?: Integration, integrationType?: 'openai' | 'dataforseo' | 'wordpress' | 'google_analytics' | 'custom') => {
    if (integration) {
      setEditingIntegration(integration);
      setFormData({
        name: integration.name,
        type: integration.type,
        apiKey: integration.config.apiKey || '',
        model: integration.config.model || 'gpt-4o-mini',
        temperature: integration.config.temperature || 1.0,
        maxCompletionTokens: integration.config.maxCompletionTokens || integration.config.maxTokens || 32768,
        topP: integration.config.topP || 1.0,
        frequencyPenalty: integration.config.frequencyPenalty || 0.0,
        presencePenalty: integration.config.presencePenalty || 0.0,
        stopSequences: integration.config.stopSequences || [],
        responseFormat: integration.config.responseFormat || 'text',
        login: integration.config.login || '',
        password: integration.config.password || '',
        useSandbox: integration.config.useSandbox !== false,
        // WordPress fields
        siteUrl: integration.config.siteUrl || '',
        wpApiKey: integration.config.wpApiKey || '',
        syncPostTypes: integration.config.syncPostTypes || ['post', 'page'],
        syncAcfFields: integration.config.syncAcfFields !== false,
        syncRankmathData: integration.config.syncRankmathData !== false,
        syncTaxonomies: integration.config.syncTaxonomies !== false,
        twoWaySync: integration.config.twoWaySync !== false,
        defaultAuthorId: integration.config.defaultAuthorId || '',
        baseUrl: integration.config.baseUrl || '',
        headers: JSON.stringify(integration.config.headers || {}, null, 2),
        testMode: integration.config.testMode || false,
      });
    } else {
      setEditingIntegration(null);
      setSelectedIntegrationType(integrationType || null);
      setFormData({
        name: '',
        type: integrationType || 'openai',
        apiKey: '',
        model: 'gpt-4o-mini',
        temperature: 1.0,
        maxCompletionTokens: 32768,
        topP: 1.0,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        stopSequences: [],
        responseFormat: 'text',
        login: '',
        password: '',
        useSandbox: true,
        // WordPress fields
        siteUrl: '',
        wpApiKey: '',
        syncPostTypes: ['post', 'page'],
        syncAcfFields: true,
        syncRankmathData: true,
        syncTaxonomies: true,
        twoWaySync: true,
        defaultAuthorId: '',
        baseUrl: '',
        headers: '{}',
        testMode: false,
      });
    }
    setShowDialog(true);
    setTestResult(null);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingIntegration(null);
    setSelectedIntegrationType(null);
    setTestResult(null);
    setGeneratedCredentials(null);
    setShowCredentials(false);
    setCopySuccess('');
    setFormData({
      name: '',
      type: 'openai',
      apiKey: '',
      model: 'gpt-4o-mini',
      temperature: 1.0,
      maxCompletionTokens: 32768,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      stopSequences: [],
      responseFormat: 'text',
      login: '',
      password: '',
      useSandbox: true,
      siteUrl: '',
      wpApiKey: '',
      syncPostTypes: ['post', 'page'],
      syncAcfFields: true,
      syncRankmathData: true,
      syncTaxonomies: true,
      twoWaySync: true,
      defaultAuthorId: '',
      baseUrl: '',
      headers: '{}',
      testMode: false
    });
  };

  const handleFetchModels = async () => {
    if (!formData.apiKey || !formData.apiKey.trim()) {
      alert('Please enter an API key first');
      return;
    }

    setFetchingModels(true);
    try {
      const models = await fetchModelsWithApiKey(formData.apiKey);
      console.log('✅ Fetched', models.length, 'models from OpenAI API');
      
      // Optionally set the first model as default
      if (models.length > 0) {
        setFormData(prev => ({ ...prev, model: models[0].id }));
      }
      
      alert(`Successfully fetched ${models.length} models from OpenAI!`);
    } catch (error) {
      console.error('❌ Failed to fetch models:', error);
      alert('Failed to fetch models. Please check your API key.');
    } finally {
      setFetchingModels(false);
    }
  };

  // Generate API key for WordPress integration
  const generateWordPressCredentials = (integrationId: string) => {
    const apiKey = `ryvr_wp_${Math.random().toString(36).substring(2, 15)}${Date.now().toString(36)}`;
    const businessId = '1'; // This should come from user context or be configurable
    const ryvrEndpoint = window.location.origin + '/api/v1'; // Use current domain
    
    return {
      apiKey,
      businessId,
      ryvrEndpoint,
      integrationId
    };
  };

  // Copy to clipboard functionality
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(`${label} copied!`);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      setCopySuccess('Failed to copy');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  const handleSave = () => {
    try {
      const config: Record<string, any> = {};
      
      if (formData.type === 'openai') {
        config.apiKey = formData.apiKey;
        config.model = formData.model;
        config.temperature = formData.temperature;
        config.maxCompletionTokens = formData.maxCompletionTokens;
        config.topP = formData.topP;
        config.frequencyPenalty = formData.frequencyPenalty;
        config.presencePenalty = formData.presencePenalty;
        config.stopSequences = formData.stopSequences;
        config.responseFormat = formData.responseFormat;
      } else if (formData.type === 'dataforseo') {
        config.login = formData.login;
        config.password = formData.password;
        config.useSandbox = formData.useSandbox;
      } else if (formData.type === 'wordpress') {
        // Generate API key if this is a new WordPress integration
        const wpApiKey = editingIntegration?.config.wpApiKey || `ryvr_wp_${Math.random().toString(36).substring(2, 15)}${Date.now().toString(36)}`;
        
        config.siteUrl = formData.siteUrl;
        config.wpApiKey = wpApiKey;
        config.syncPostTypes = formData.syncPostTypes;
        config.syncAcfFields = formData.syncAcfFields;
        config.syncRankmathData = formData.syncRankmathData;
        config.syncTaxonomies = formData.syncTaxonomies;
        config.twoWaySync = formData.twoWaySync;
        config.defaultAuthorId = formData.defaultAuthorId;
      } else if (formData.type === 'custom') {
        config.baseUrl = formData.baseUrl;
        config.headers = JSON.parse(formData.headers);
      }

      const integration: Integration = {
        id: editingIntegration?.id || `integration_${Date.now()}`,
        name: formData.name,
        provider: formData.type, // Use type as provider for local integrations
        type: formData.type,
        status: 'disconnected',
        config,
        lastTested: editingIntegration?.lastTested,
        createdAt: editingIntegration?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        // Required new properties for Integration interface
        integration_type: 'account', // Local integrations are account-level
        level: 'account',
        is_system_wide: false,
        requires_user_config: true,
        available_to_roles: ['admin', 'agency', 'individual'],
        is_enabled_for_agencies: true,
        is_enabled_for_individuals: true,
        is_enabled_for_businesses: true,
      };

      const newIntegrations = editingIntegration
        ? integrations.map(i => i.id === editingIntegration.id ? integration : i)
        : [...integrations, integration];

      saveIntegrations(newIntegrations);
      
      // For WordPress integrations, generate and show credentials
      if (formData.type === 'wordpress' && !editingIntegration) {
        const credentials = generateWordPressCredentials(integration.id);
        // Update the config with the generated API key
        integration.config.wpApiKey = credentials.apiKey;
        setGeneratedCredentials(credentials);
        setShowCredentials(true);
        // Don't close dialog immediately for WordPress - show credentials first
      } else {
        closeDialog();
      }
    } catch (error: any) {
      console.error('Failed to save integration:', error);
      alert('Failed to save integration: ' + error.message);
    }
  };

  const handleDelete = (integrationId: string) => {
    if (window.confirm('Are you sure you want to delete this integration?')) {
      const newIntegrations = integrations.filter(i => i.id !== integrationId);
      saveIntegrations(newIntegrations);
    }
  };

  // Removed - no longer needed as Edit/Delete are on All Integrations page

  const handleConfigureDynamicIntegration = async (integration: any) => {
    setConfiguringDynamicIntegration(integration);
    
    // Load existing credentials if available
    const businessId = localStorage.getItem('selected_business_id') || '1';
    try {
      const response = await fetch(
        `${(import.meta as any).env?.VITE_API_URL || 'https://ryvr-backend.onrender.com'}/api/v1/businesses/${businessId}/integrations`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('ryvr_token')}`,
          },
        }
      );
      
      if (response.ok) {
        const businessIntegrations = await response.json();
        const existing = businessIntegrations.find((bi: any) => bi.integration_id === parseInt(integration.id));
        
        if (existing && existing.credentials) {
          // Load existing credentials
          setDynamicIntegrationFormData(existing.credentials);
          return;
        }
      }
    } catch (error) {
      console.error('Failed to load existing credentials:', error);
    }
    
    // Initialize form data with empty values for each credential field
    const initialData: Record<string, any> = {};
    if (integration.auth_config?.credentials) {
      integration.auth_config.credentials.forEach((cred: any) => {
        initialData[cred.name] = cred.default || '';
      });
    }
    setDynamicIntegrationFormData(initialData);
  };

  const handleDynamicIntegrationFieldChange = (fieldName: string, value: any) => {
    setDynamicIntegrationFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSaveDynamicIntegrationConfig = async () => {
    if (!configuringDynamicIntegration) return;
    
    // Get instance name from form data
    const instanceName = dynamicIntegrationFormData.instance_name;
    if (!instanceName || !instanceName.trim()) {
      alert('Please enter an instance name for this integration');
      return;
    }
    
    // Get business ID from localStorage or use a default
    // In a multi-tenant system, this should come from BusinessContext
    const businessId = localStorage.getItem('selected_business_id') || '1';

    try {
      setSavingDynamicConfig(true);

      // Separate credentials from other form data
      const credentialNames = configuringDynamicIntegration.auth_config?.credentials?.map((c: any) => c.name) || [];
      const credentials: Record<string, any> = {};
      
      Object.entries(dynamicIntegrationFormData).forEach(([key, value]) => {
        if (credentialNames.includes(key)) {
          credentials[key] = value;
        }
      });

      // Create business integration
      const response = await fetch(
        `${(import.meta as any).env?.VITE_API_URL || 'https://ryvr-backend.onrender.com'}/api/v1/businesses/${businessId}/integrations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('ryvr_token')}`,
          },
          body: JSON.stringify({
            business_id: parseInt(businessId),
            integration_id: parseInt(configuringDynamicIntegration.id),
            instance_name: instanceName.trim(), // NEW: Required field
            credentials: credentials,
            is_active: true
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save integration configuration');
      }

      alert(`${instanceName} configured successfully!`);
      setConfiguringDynamicIntegration(null);
      setDynamicIntegrationFormData({});
      setDynamicTestResult(null);

      // Reload integrations
      await loadDatabaseIntegrations();
      await loadBusinessIntegrations(); // Reload business integrations to show the new one

    } catch (error: any) {
      console.error('Failed to save configuration:', error);
      alert(`Failed to save configuration: ${error.message}`);
    } finally {
      setSavingDynamicConfig(false);
    }
  };

  const handleTestDynamicConnection = async () => {
    if (!configuringDynamicIntegration) return;

    try {
      setTestingDynamicConnection(true);
      setDynamicTestResult(null);

      // Get the test operation (marked with is_test_operation) or fall back to first operation
      const operations = configuringDynamicIntegration.operation_configs?.operations || [];
      const testOperation = operations.find((op: any) => op.is_test_operation) || operations[0];
      
      if (!testOperation) {
        setDynamicTestResult({
          success: false,
          error: 'No operations available for testing'
        });
        return;
      }

      // Separate credentials from operation parameters and filter out empty optional parameters
      const credentialNames = configuringDynamicIntegration.auth_config?.credentials?.map((c: any) => c.name) || [];
      const credentials: Record<string, any> = {};
      const operationParams: Record<string, any> = {};
      
      Object.entries(dynamicIntegrationFormData).forEach(([key, value]) => {
        // Skip empty values for optional parameters
        if (value === '' || value === null || value === undefined) {
          const param = testOperation.parameters?.find((p: any) => p.name === key);
          if (param && !param.required) {
            return; // Skip this optional parameter
          }
        }
        
        if (credentialNames.includes(key)) {
          credentials[key] = value;
        } else {
          operationParams[key] = value;
        }
      });
      
      // Test using the integration builder test endpoint
      const result = await integrationBuilderApi.testOperation(
        configuringDynamicIntegration.id,
        testOperation.id,
        operationParams,
        undefined,
        credentials
      );

      setDynamicTestResult(result);

    } catch (error: any) {
      console.error('Test failed:', error);
      setDynamicTestResult({
        success: false,
        error: error.response?.data?.detail || error.message || 'Test failed'
      });
    } finally {
      setTestingDynamicConnection(false);
    }
  };

  const handleTest = async (integration: Integration) => {
    setTesting(true);
    setTestResult(null);

    try {
      let result;

      if (integration.type === 'openai') {
        // Test OpenAI integration
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${integration.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: integration.config.model,
            messages: [{ role: 'user', content: 'Hello, this is a test message.' }],
            max_completion_tokens: 50,
            temperature: 1.0,
          })
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        result = {
          success: true,
          message: 'OpenAI integration test successful',
          response: data.choices[0]?.message?.content,
        };
      } else if (integration.type === 'dataforseo') {
        // Test DataForSEO integration
        const baseUrl = integration.config.useSandbox 
          ? 'https://sandbox.dataforseo.com' 
          : 'https://api.dataforseo.com';
        
        const auth = btoa(`${integration.config.login}:${integration.config.password}`);
        
        const response = await fetch(`${baseUrl}/v3/serp/google/organic/live/advanced`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([{
            keyword: 'test',
            location_code: 2840,
            language_code: 'en',
            depth: 1
          }])
        });

        if (!response.ok) {
          throw new Error(`DataForSEO API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        result = {
          success: true,
          message: 'DataForSEO integration test successful',
          response: data.tasks?.[0]?.result || 'Test completed',
        };
      } else {
        result = {
          success: true,
          message: 'Custom integration configured (manual testing required)',
          response: 'Configuration saved successfully',
        };
      }

      // Update integration status
      const newIntegrations = integrations.map(i => 
        i.id === integration.id 
          ? { ...i, status: 'connected' as const, lastTested: new Date().toISOString() }
          : i
      );
      saveIntegrations(newIntegrations);

      setTestResult(result);
    } catch (error: any) {
      console.error('Integration test failed:', error);
      
      // Update integration status to error
      const newIntegrations = integrations.map(i => 
        i.id === integration.id 
          ? { ...i, status: 'error' as const, lastTested: new Date().toISOString() }
          : i
      );
      saveIntegrations(newIntegrations);

      setTestResult({
        success: false,
        message: 'Integration test failed',
        error: error.message,
      });
    } finally {
      setTesting(false);
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'openai': return <AiIcon />;
      case 'dataforseo': return <SeoIcon />;
      case 'google_analytics': return <TrendingUpIcon />;
      case 'wordpress': return <WordPressIcon />;
      default: return <ApiIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'success';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const filteredIntegrations = selectedTab === 0 
    ? integrations 
    : integrations.filter(i => {
        if (selectedTab === 1) return i.type === 'wordpress';
        if (selectedTab === 2) return i.type === 'google_analytics';
        if (selectedTab === 3) return i.type === 'custom';
        return true;
      });

  return (
    <AdminLayout 
      title="Integrations"
      subtitle="Add and manage your API integrations for workflows"
    >
      <Box>

      {/* Available Integrations */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Available Integrations
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Click on any integration block to configure and add it to your workspace
        </Typography>
        
        <Grid container spacing={2}>
          {availableIntegrations.map((integration) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={integration.type}>
              <Paper
                elevation={2}
                onClick={() => openDialog(undefined, integration.type)}
                sx={{
                  p: 2,  // Reduced from 3 to 2
                  height: '140px',  // Fixed smaller height
                  cursor: 'pointer',
                  border: '2px solid transparent',
                  transition: 'all 0.2s ease-in-out',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    borderColor: integration.color,
                    backgroundColor: `${integration.color}10`,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 20px ${integration.color}20`,
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ color: integration.color, mr: 1, fontSize: '1.2rem' }}>
                    {integration.icon}
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    {integration.name}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, flex: 1, fontSize: '0.75rem' }}>
                  {integration.description}
                </Typography>
                <Chip
                  label={integration.category}
                  size="small"
                  sx={{
                    bgcolor: `${integration.color}20`,
                    color: integration.color,
                    fontSize: '0.65rem',
                    height: '20px',
                    alignSelf: 'flex-start',
                  }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* System Integrations (Read-Only) */}
      {databaseIntegrations.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            System Integrations
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            These integrations are configured by the admin and available to all users
          </Typography>
          
          <Grid container spacing={2}>
            {databaseIntegrations
              .filter(i => i.integration_type === 'system')
              .map((integration) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={integration.id}>
                  <Card 
                    sx={{ 
                      height: '140px',  // Fixed smaller height
                      border: systemIntegrationStatuses[integration.id]?.is_system_integration ? 2 : 1,
                      borderColor: systemIntegrationStatuses[integration.id]?.is_system_integration 
                        ? 'success.main' 
                        : 'divider',
                      opacity: systemIntegrationStatuses[integration.id]?.is_system_integration ? 1 : 0.6
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {getIntegrationIcon(integration.type)}
                        <Typography variant="subtitle2" sx={{ ml: 1, flex: 1, fontWeight: 600 }}>
                          {integration.name}
                        </Typography>
                        {systemIntegrationStatuses[integration.id]?.is_system_integration ? (
                          <CheckIcon color="success" fontSize="small" />
                        ) : (
                          <Chip label="Inactive" size="small" color="default" />
                        )}
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        {systemIntegrationStatuses[integration.id]?.is_system_integration 
                          ? 'Active - Ready to use in workflows' 
                          : 'Contact admin to enable'
                        }
                      </Typography>
                      
                      <Typography variant="body2" sx={{ 
                        color: systemIntegrationStatuses[integration.id]?.is_system_integration 
                          ? 'success.main' 
                          : 'text.disabled',
                        fontWeight: 500,
                        fontSize: '0.75rem'
                      }}>
                        {systemIntegrationStatuses[integration.id]?.is_system_integration ? '✓ Available' : '○ Not configured'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>
      )}

      {/* Dynamic Integrations (Built with Integration Builder) */}
      {databaseIntegrations.some(i => i.is_dynamic) && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Dynamic Integrations
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Custom integrations built with the Integration Builder
          </Typography>
          
          <Grid container spacing={2}>
            {databaseIntegrations
              .filter(i => i.is_dynamic)
              .map((integration: any) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={integration.id}>
                  <Card 
                    sx={{ 
                      height: '180px',
                      border: 2,
                      borderColor: integration.platform_config?.color || 'primary.main',
                      position: 'relative',
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {integration.platform_config?.icon_url ? (
                          <Box 
                            component="img" 
                            src={integration.platform_config.icon_url}
                            alt={integration.name}
                            sx={{ width: 24, height: 24, mr: 1 }}
                          />
                        ) : (
                          <ApiIcon sx={{ mr: 1, color: integration.platform_config?.color || 'primary.main' }} />
                        )}
                        <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 600 }}>
                          {integration.name}
                        </Typography>
                        <Chip 
                          label="Dynamic" 
                          size="small" 
                          sx={{ 
                            bgcolor: `${integration.platform_config?.color || '#5f5eff'}20`,
                            color: integration.platform_config?.color || 'primary.main',
                            fontSize: '0.65rem',
                            height: '20px',
                          }} 
                        />
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        {integration.operation_configs?.operations?.length || 0} operations available
                      </Typography>
                      
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Auth: {integration.platform_config?.auth_type || 'N/A'}
                      </Typography>
                      
                      <Box sx={{ flex: 1 }} />
                      
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        {integration.platform_config?.documentation_url && (
                          <Button
                            size="small"
                            href={integration.platform_config.documentation_url}
                            target="_blank"
                            sx={{ fontSize: '0.7rem', px: 1, py: 0.5 }}
                          >
                            Docs
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<SettingsIcon fontSize="small" />}
                          onClick={() => handleConfigureDynamicIntegration(integration)}
                          sx={{ fontSize: '0.7rem', px: 1, py: 0.5 }}
                        >
                          Configure
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>
      )}

      {/* Your Configured Business Integrations */}
      {businessIntegrations.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Your Configured Integrations
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Integration instances you've configured for this business
          </Typography>
          
          <Grid container spacing={2}>
            {businessIntegrations.map((businessIntegration) => {
              // Find the parent integration for icon and details
              const parentIntegration = databaseIntegrations.find(
                (di) => di.id === businessIntegration.integration_id.toString()
              );
              
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={businessIntegration.id}>
                  <Card 
                    sx={{ 
                      height: '160px',
                      border: 2,
                      borderColor: 'success.main',
                      position: 'relative',
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {parentIntegration?.platform_config?.icon_url ? (
                          <Box 
                            component="img" 
                            src={parentIntegration.platform_config.icon_url}
                            alt={businessIntegration.instance_name}
                            sx={{ width: 24, height: 24, mr: 1 }}
                          />
                        ) : (
                          <IntegrationInstructionsIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                        )}
                        <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                          {businessIntegration.instance_name}
                        </Typography>
                        <CheckIcon color="success" fontSize="small" />
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        {parentIntegration?.name || 'Integration'}
                      </Typography>
                      
                      <Chip 
                        label={businessIntegration.is_active ? 'Active' : 'Inactive'}
                        color={businessIntegration.is_active ? 'success' : 'default'}
                        size="small"
                        sx={{ fontSize: '0.65rem', height: '20px', alignSelf: 'flex-start' }}
                      />
                      
                      <Box sx={{ flex: 1 }} />
                      
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            // TODO: Add edit functionality
                            alert('Edit functionality coming soon!');
                          }}
                          sx={{ fontSize: '0.7rem', px: 1, py: 0.5 }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={async () => {
                            if (confirm(`Delete ${businessIntegration.instance_name}?`)) {
                              try {
                                const businessId = localStorage.getItem('selected_business_id') || '1';
                                const response = await fetch(
                                  `${(import.meta as any).env?.VITE_API_URL || 'https://ryvr-backend.onrender.com'}/api/v1/businesses/${businessId}/integrations/${businessIntegration.id}`,
                                  {
                                    method: 'DELETE',
                                    headers: {
                                      'Authorization': `Bearer ${localStorage.getItem('ryvr_token')}`,
                                    },
                                  }
                                );
                                
                                if (response.ok) {
                                  await loadBusinessIntegrations();
                                  alert('Integration deleted successfully!');
                                } else {
                                  throw new Error('Failed to delete integration');
                                }
                              } catch (error: any) {
                                alert(`Failed to delete: ${error.message}`);
                              }
                            }
                          }}
                          sx={{ fontSize: '0.7rem', px: 1, py: 0.5 }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Configured Integrations */}
      {integrations.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Your Local Integrations
          </Typography>
          
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={selectedTab} onChange={handleTabChange}>
              <Tab label="All Integrations" />
              <Tab label="WordPress" />
              <Tab label="Google Analytics" />
              <Tab label="Custom" />
            </Tabs>
          </Box>

          {/* Integration Cards */}
          <Grid container spacing={2}>
            {filteredIntegrations.map((integration) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={integration.id}>
                <Card sx={{ position: 'relative', height: '160px' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <DragIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: '1rem' }} />
                      {getIntegrationIcon(integration.type)}
                      <Typography variant="subtitle2" sx={{ ml: 0.5, flex: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                        {integration.name}
                      </Typography>
                      <Chip
                        label={integration.status}
                        color={getStatusColor(integration.status)}
                        size="small"
                        sx={{ fontSize: '0.65rem', height: '20px' }}
                      />
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, fontSize: '0.75rem' }}>
                      {integration.type.charAt(0).toUpperCase() + integration.type.slice(1)} Integration
                    </Typography>
                    
                    <Box sx={{ flex: 1 }} />  {/* Spacer */}
                    
                    {integration.lastTested && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        Last tested: {new Date(integration.lastTested).toLocaleString()}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button
                        size="small"
                        onClick={() => handleTest(integration)}
                        disabled={testing}
                        variant="outlined"
                        sx={{ fontSize: '0.65rem', px: 1, py: 0.25, minWidth: 'auto' }}
                      >
                        Test
                      </Button>
                      <Button
                        size="small"
                        onClick={() => openDialog(integration)}
                        variant="outlined"
                        sx={{ fontSize: '0.65rem', px: 1, py: 0.25, minWidth: 'auto' }}
                      >
                        Edit
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(integration.id)}
                        color="error"
                        sx={{ p: 0.25 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {integrations.length === 0 && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 4, 
          bgcolor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.03)' 
            : 'rgba(0, 0, 0, 0.02)', 
          borderRadius: 2 
        }}>
          <SettingsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No integrations configured yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start by clicking on one of the available integrations above
          </Typography>
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingIntegration ? 'Edit Integration' : 'Add New Integration'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Integration Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
              placeholder="e.g., My OpenAI Account, Production DataForSEO"
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Integration Type</InputLabel>
              <Select
                value={formData.type}
                label="Integration Type"
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <MenuItem value="openai">OpenAI</MenuItem>
                <MenuItem value="dataforseo">DataForSEO</MenuItem>
                <MenuItem value="wordpress">WordPress</MenuItem>
                <MenuItem value="custom">Custom API</MenuItem>
              </Select>
            </FormControl>

            {/* OpenAI Configuration */}
            {formData.type === 'openai' && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main' }}>
                  OpenAI Configuration
                </Typography>
                
                <TextField
                  fullWidth
                  label="API Key"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  sx={{ mb: 2 }}
                  helperText="Get your API key from platform.openai.com"
                />

                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Default Model</InputLabel>
                    <Select
                      value={formData.model}
                      label="Default Model"
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      disabled={modelsLoading || fetchingModels}
                    >
                      {getModelOptions().map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                          {option.description && (
                            <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                              ({option.description})
                            </Typography>
                          )}
                        </MenuItem>
                      ))}
                      {getModelOptions().length === 0 && (
                        <MenuItem value="gpt-4o-mini">GPT-4o Mini (Fallback)</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                  <Button
                    variant="outlined"
                    onClick={handleFetchModels}
                    disabled={!formData.apiKey || fetchingModels || modelsLoading}
                    sx={{ minWidth: 'auto', px: 2, py: 1.75 }}
                  >
                    {fetchingModels ? '...' : '🔄'}
                  </Button>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  💡 Enter your API key above, then click 🔄 to fetch live models from OpenAI
                </Typography>

                <TextField
                  fullWidth
                  type="number"
                  label="Default Temperature"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                  sx={{ mb: 2 }}
                  inputProps={{ min: 0, max: 2, step: 0.1 }}
                  helperText="0 = focused, 2 = creative"
                />

                <TextField
                  fullWidth
                  type="number"
                  label="Default Max Completion Tokens"
                  value={formData.maxCompletionTokens}
                  onChange={(e) => setFormData({ ...formData, maxCompletionTokens: parseInt(e.target.value) })}
                  sx={{ mb: 2 }}
                  inputProps={{ min: 1, max: 32768, step: 1 }}
                  helperText="Maximum response length (1-32768 tokens)"
                />

                <TextField
                  fullWidth
                  type="number"
                  label="Default Top P"
                  value={formData.topP}
                  onChange={(e) => setFormData({ ...formData, topP: parseFloat(e.target.value) })}
                  sx={{ mb: 2 }}
                  inputProps={{ min: 0, max: 1, step: 0.1 }}
                  helperText="Nucleus sampling parameter (0-1, controls diversity)"
                />

                <TextField
                  fullWidth
                  type="number"
                  label="Default Frequency Penalty"
                  value={formData.frequencyPenalty}
                  onChange={(e) => setFormData({ ...formData, frequencyPenalty: parseFloat(e.target.value) })}
                  sx={{ mb: 2 }}
                  inputProps={{ min: -2, max: 2, step: 0.1 }}
                  helperText="Reduces repetition (-2 to 2, 0 = neutral)"
                />

                <TextField
                  fullWidth
                  type="number"
                  label="Default Presence Penalty"
                  value={formData.presencePenalty}
                  onChange={(e) => setFormData({ ...formData, presencePenalty: parseFloat(e.target.value) })}
                  sx={{ mb: 2 }}
                  inputProps={{ min: -2, max: 2, step: 0.1 }}
                  helperText="Encourages new topics (-2 to 2, 0 = neutral)"
                />

                <TextField
                  fullWidth
                  label="Default Stop Sequences"
                  value={formData.stopSequences.join(', ')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    stopSequences: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                  })}
                  sx={{ mb: 2 }}
                  placeholder="Enter stop sequences separated by commas"
                  helperText="Sequences where the API will stop generating (e.g., \\n, END, ###)"
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Default Response Format</InputLabel>
                  <Select
                    value={formData.responseFormat}
                    label="Default Response Format"
                    onChange={(e) => setFormData({ ...formData, responseFormat: e.target.value as 'text' | 'json_object' })}
                  >
                    <MenuItem value="text">Text</MenuItem>
                    <MenuItem value="json_object">JSON Object</MenuItem>
                  </Select>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Format for AI responses (JSON for structured data)
                  </Typography>
                </FormControl>
              </Box>
            )}

            {/* DataForSEO Configuration */}
            {formData.type === 'dataforseo' && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main' }}>
                  DataForSEO Configuration
                </Typography>
                
                <TextField
                  fullWidth
                  label="Login"
                  value={formData.login}
                  onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                  sx={{ mb: 2 }}
                  helperText="Your DataForSEO account login"
                />

                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  sx={{ mb: 2 }}
                  helperText="Your DataForSEO account password"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.useSandbox}
                      onChange={(e) => setFormData({ ...formData, useSandbox: e.target.checked })}
                    />
                  }
                  label="Use Sandbox Mode (recommended for testing)"
                  sx={{ mb: 2 }}
                />
              </Box>
            )}

            {/* WordPress Configuration */}
            {formData.type === 'wordpress' && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main' }}>
                  WordPress Configuration
                </Typography>
                
                <TextField
                  fullWidth
                  label="WordPress Site URL"
                  value={formData.siteUrl}
                  onChange={(e) => setFormData({ ...formData, siteUrl: e.target.value })}
                  sx={{ mb: 2 }}
                  placeholder="https://yoursite.com"
                  helperText="Full URL of your WordPress site"
                />

                {editingIntegration && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    API credentials have already been generated for this integration.
                  </Alert>
                )}

                {!editingIntegration && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    🔑 API credentials will be automatically generated after saving this integration.
                    You'll then copy these to your WordPress plugin settings.
                  </Alert>
                )}

                <TextField
                  fullWidth
                  label="Default Author ID (Optional)"
                  type="number"
                  value={formData.defaultAuthorId}
                  onChange={(e) => setFormData({ ...formData, defaultAuthorId: e.target.value })}
                  sx={{ mb: 2 }}
                  helperText="WordPress user ID for posts created by RYVR"
                />

                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Synchronization Options
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.syncAcfFields}
                      onChange={(e) => setFormData({ ...formData, syncAcfFields: e.target.checked })}
                    />
                  }
                  label="Sync ACF Custom Fields"
                  sx={{ mb: 1, display: 'block' }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.syncRankmathData}
                      onChange={(e) => setFormData({ ...formData, syncRankmathData: e.target.checked })}
                    />
                  }
                  label="Sync RankMath SEO Data"
                  sx={{ mb: 1, display: 'block' }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.syncTaxonomies}
                      onChange={(e) => setFormData({ ...formData, syncTaxonomies: e.target.checked })}
                    />
                  }
                  label="Sync Categories & Tags"
                  sx={{ mb: 1, display: 'block' }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.twoWaySync}
                      onChange={(e) => setFormData({ ...formData, twoWaySync: e.target.checked })}
                    />
                  }
                  label="Enable Two-Way Sync"
                  sx={{ mb: 2, display: 'block' }}
                />

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  💡 <strong>Setup Process:</strong><br />
                  1. Configure your WordPress site URL and sync preferences above<br />
                  2. Save this integration to generate API credentials<br />
                  3. Install the RYVR WordPress plugin on your site<br />
                  4. Copy the generated credentials to your WordPress plugin settings
                </Typography>
              </Box>
            )}

            {/* Custom API Configuration */}
            {formData.type === 'custom' && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main' }}>
                  Custom API Configuration
                </Typography>
                
                <TextField
                  fullWidth
                  label="Base URL"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  sx={{ mb: 2 }}
                  placeholder="https://api.example.com"
                  helperText="The base URL for your API"
                />

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Headers (JSON)"
                  value={formData.headers}
                  onChange={(e) => setFormData({ ...formData, headers: e.target.value })}
                  sx={{ mb: 2 }}
                  helperText="Additional headers in JSON format"
                />
              </Box>
            )}

            {/* Test Results */}
            {testResult && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Test Results
                </Typography>
                <Alert 
                  severity={testResult.success ? 'success' : 'error'}
                  sx={{ mb: 1 }}
                >
                  {testResult.message}
                </Alert>
                {testResult.error && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    Error: {testResult.error}
                  </Typography>
                )}
                {testResult.response && (
                  <Box sx={{ 
                    bgcolor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.03)', 
                    p: 2, 
                    borderRadius: 1, 
                    mt: 1,
                    border: `1px solid ${theme.palette.divider}`
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      Response:
                    </Typography>
                    <pre style={{ fontSize: '12px', margin: '8px 0 0 0', whiteSpace: 'pre-wrap' }}>
                      {typeof testResult.response === 'string' 
                        ? testResult.response 
                        : JSON.stringify(testResult.response, null, 2)}
                    </pre>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          {!editingIntegration && (
            <Button
              onClick={() => handleTest({
                id: 'test',
                name: formData.name,
                provider: formData.type,
                type: formData.type,
                status: 'disconnected',
                config: formData.type === 'openai' ? {
                  apiKey: formData.apiKey,
                  model: formData.model,
                  temperature: formData.temperature,
                  maxCompletionTokens: formData.maxCompletionTokens,
                  topP: formData.topP,
                  frequencyPenalty: formData.frequencyPenalty,
                  presencePenalty: formData.presencePenalty,
                  stopSequences: formData.stopSequences,
                  responseFormat: formData.responseFormat,
                } : formData.type === 'dataforseo' ? {
                  login: formData.login,
                  password: formData.password,
                  useSandbox: formData.useSandbox,
                } : formData.type === 'wordpress' ? {
                  siteUrl: formData.siteUrl,
                  wpApiKey: formData.wpApiKey,
                  syncPostTypes: formData.syncPostTypes,
                  syncAcfFields: formData.syncAcfFields,
                  syncRankmathData: formData.syncRankmathData,
                  syncTaxonomies: formData.syncTaxonomies,
                  twoWaySync: formData.twoWaySync,
                  defaultAuthorId: formData.defaultAuthorId,
                } : {
                  baseUrl: formData.baseUrl,
                  headers: JSON.parse(formData.headers || '{}'),
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                // Required new properties for Integration interface
                integration_type: 'account',
                level: 'account',
                is_system_wide: false,
                requires_user_config: true,
                available_to_roles: ['admin', 'agency', 'individual'],
                is_enabled_for_agencies: true,
                is_enabled_for_individuals: true,
                is_enabled_for_businesses: true,
              })}
              disabled={testing || !formData.name}
              variant="outlined"
            >
              {testing ? 'Testing...' : 'Test'}
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={!formData.name || 
                     (formData.type === 'openai' && !formData.apiKey) || 
                     (formData.type === 'dataforseo' && (!formData.login || !formData.password)) ||
                     (formData.type === 'wordpress' && !formData.siteUrl)}
          >
            {editingIntegration ? 'Save Changes' : 'Add Integration'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* WordPress Credentials Display */}
      <Dialog 
        open={showCredentials && generatedCredentials !== null} 
        onClose={() => {
          setShowCredentials(false);
          setGeneratedCredentials(null);
          closeDialog();
        }}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CheckIcon color="success" />
            WordPress Integration Created Successfully!
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 3 }}>
            Your WordPress integration has been created. Copy these credentials to your WordPress plugin settings.
          </Alert>
          
          <Typography variant="h6" sx={{ mb: 2 }}>
            📋 Copy these settings to your WordPress plugin:
          </Typography>
          
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="RYVR API Endpoint"
              value={generatedCredentials?.ryvrEndpoint || ''}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => copyToClipboard(generatedCredentials?.ryvrEndpoint || '', 'API Endpoint')}
                      edge="end"
                    >
                      <CopyIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
              label="Business ID"
              value={generatedCredentials?.businessId || ''}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => copyToClipboard(generatedCredentials?.businessId || '', 'Business ID')}
                      edge="end"
                    >
                      <CopyIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
              label="API Key"
              type={showApiKey ? 'text' : 'password'}
              value={generatedCredentials?.apiKey || ''}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => setShowApiKey(!showApiKey)}
                      edge="end"
                    >
                      {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                    <IconButton 
                      onClick={() => copyToClipboard(generatedCredentials?.apiKey || '', 'API Key')}
                      edge="end"
                    >
                      <CopyIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          <Accordion sx={{ mt: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">📝 WordPress Plugin Setup Instructions</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Typography variant="body2">
                  <strong>Step 1:</strong> Install the RYVR WordPress plugin on your site
                </Typography>
                <Typography variant="body2">
                  <strong>Step 2:</strong> Go to WordPress Admin → RYVR → Settings
                </Typography>
                <Typography variant="body2">
                  <strong>Step 3:</strong> Paste the credentials above into the corresponding fields:
                </Typography>
                <Box component="ul" sx={{ pl: 3 }}>
                  <li>RYVR API Endpoint → "API Endpoint" field</li>
                  <li>Business ID → "Business ID" field</li>
                  <li>API Key → "API Key" field</li>
                </Box>
                <Typography variant="body2">
                  <strong>Step 4:</strong> Test the connection in the WordPress plugin
                </Typography>
                <Typography variant="body2">
                  <strong>Step 5:</strong> Configure your sync preferences and save
                </Typography>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setShowCredentials(false);
              setGeneratedCredentials(null);
              closeDialog();
            }}
            variant="contained"
          >
            Got it!
          </Button>
        </DialogActions>
      </Dialog>


      {/* Copy Success Snackbar */}
      <Snackbar
        open={!!copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess('')}
        message={copySuccess}
      />

      {/* Dynamic Integration Configuration Dialog */}
      <Dialog 
        open={!!configuringDynamicIntegration} 
        onClose={() => {
          setConfiguringDynamicIntegration(null);
          setDynamicTestResult(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Configure {configuringDynamicIntegration?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Instance Name Field - REQUIRED */}
            <TextField
              fullWidth
              label="Instance Name"
              value={dynamicIntegrationFormData.instance_name || ''}
              onChange={(e) => handleDynamicIntegrationFieldChange('instance_name', e.target.value)}
              required
              placeholder="e.g., Client A Brevo, Personal SendGrid"
              helperText="Give this integration instance a unique name"
              sx={{ mb: 3 }}
            />
            
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Authentication
            </Typography>
            
            {configuringDynamicIntegration?.auth_config?.credentials?.map((credential: any) => {
              const isPassword = credential.type === 'password' || credential.name.toLowerCase().includes('key') || credential.name.toLowerCase().includes('secret');
              
              return (
                <TextField
                  key={credential.name}
                  fullWidth
                  label={credential.name}
                  type={isPassword ? 'password' : 'text'}
                  value={dynamicIntegrationFormData[credential.name] || ''}
                  onChange={(e) => handleDynamicIntegrationFieldChange(credential.name, e.target.value)}
                  required={credential.required}
                  helperText={credential.description}
                  sx={{ mb: 2 }}
                />
              );
            })}
            
            {configuringDynamicIntegration?.auth_config?.credentials?.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No authentication required for this integration.
              </Typography>
            )}

            {/* Operation Parameters */}
            {(() => {
              const operations = configuringDynamicIntegration?.operation_configs?.operations || [];
              const testOperation = operations.find((op: any) => op.is_test_operation) || operations[0];
              
              if (!testOperation) return null;
              
              // Show all non-fixed parameters (not just body location)
              const configurableParams = testOperation.parameters?.filter((p: any) => !p.fixed) || [];
              
              if (configurableParams.length === 0) return null;
              
              return (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Operation Parameters
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    Configure values for {testOperation.name} ({configurableParams.length} parameters)
                  </Typography>
                  
                  {configurableParams.map((param: any) => {
                    const helperText = [
                      param.description,
                      `Location: ${param.location}`,
                      param.required ? '(Required)' : '(Optional)'
                    ].filter(Boolean).join(' • ');
                    
                    if (param.type === 'select') {
                      return (
                        <FormControl key={param.name} fullWidth sx={{ mb: 2 }}>
                          <InputLabel>
                            {param.name}
                            {param.required && <span style={{ color: 'error.main' }}> *</span>}
                          </InputLabel>
                          <Select
                            value={dynamicIntegrationFormData[param.name] ?? param.default ?? ''}
                            onChange={(e) => handleDynamicIntegrationFieldChange(param.name, e.target.value)}
                            label={param.name + (param.required ? ' *' : '')}
                          >
                            {(param.options || []).map((opt: string) => (
                              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                            ))}
                          </Select>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.5, display: 'block' }}>
                            {helperText}
                          </Typography>
                        </FormControl>
                      );
                    } else if (param.type === 'number') {
                      return (
                        <TextField
                          key={param.name}
                          fullWidth
                          type="number"
                          label={param.name + (param.required ? ' *' : '')}
                          value={dynamicIntegrationFormData[param.name] ?? param.default ?? ''}
                          onChange={(e) => handleDynamicIntegrationFieldChange(param.name, parseFloat(e.target.value) || '')}
                          required={param.required}
                          helperText={helperText}
                          sx={{ mb: 2 }}
                        />
                      );
                    } else if (param.type === 'boolean') {
                      return (
                        <Box key={param.name} sx={{ mb: 2 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={dynamicIntegrationFormData[param.name] ?? param.default ?? false}
                                onChange={(e) => handleDynamicIntegrationFieldChange(param.name, e.target.checked)}
                              />
                            }
                            label={param.name + (param.required ? ' *' : '')}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
                            {helperText}
                          </Typography>
                        </Box>
                      );
                    } else {
                      // text or string
                      return (
                        <TextField
                          key={param.name}
                          fullWidth
                          multiline={param.type === 'text'}
                          rows={param.type === 'text' ? 3 : 1}
                          label={param.name + (param.required ? ' *' : '')}
                          value={dynamicIntegrationFormData[param.name] ?? param.default ?? ''}
                          onChange={(e) => handleDynamicIntegrationFieldChange(param.name, e.target.value)}
                          required={param.required}
                          helperText={helperText}
                          sx={{ mb: 2 }}
                        />
                      );
                    }
                  })}
                </Box>
              );
            })()}

            {/* Test Result */}
            {dynamicTestResult && (
              <Alert 
                severity={dynamicTestResult.success ? 'success' : 'error'}
                sx={{ mt: 2 }}
              >
                {dynamicTestResult.success 
                  ? '✓ Connection test successful!' 
                  : `✗ Test failed: ${dynamicTestResult.error}`}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setConfiguringDynamicIntegration(null);
            setDynamicTestResult(null);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleTestDynamicConnection}
            disabled={testingDynamicConnection || !configuringDynamicIntegration?.operation_configs?.operations?.length}
          >
            {testingDynamicConnection ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button 
            onClick={handleSaveDynamicIntegrationConfig} 
            variant="contained"
            disabled={savingDynamicConfig}
          >
            {savingDynamicConfig ? 'Saving...' : 'Save Configuration'}
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </AdminLayout>
  );
} 