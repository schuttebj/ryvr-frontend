import React, { useState, useEffect, useCallback } from 'react';
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  LinearProgress,
  Alert,
  Snackbar,
  Menu,
  MenuList,
  ListItemIcon,
  ListItemText,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Folder as FolderIcon,
  Business as BusinessIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  AutoAwesome as SummaryIcon,
  DriveFileMove as MoveIcon,
  Storage as StorageIcon,
  Clear as ClearIcon,
  MoreVert as MoreIcon,
  Description as FileIcon,
  PictureAsPdf as PdfIcon,
  TextSnippet as TextIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import BusinessSelector from '../components/common/BusinessSelector';
import { fileApi, FileItem, StorageUsageResponse } from '../services/fileApi';

// Import layout based on user role
import AdminLayout from '../components/layout/AdminLayout';
import AgencyLayout from '../components/layout/AgencyLayout';
import BusinessLayout from '../components/layout/BusinessLayout';

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

// File Upload Component
interface FileUploadProps {
  onUpload: (file: File, businessId?: number, tags?: string[]) => void;
  loading: boolean;
  selectedBusinessId?: number;
}

const FileUploadCard: React.FC<FileUploadProps> = ({ onUpload, loading, selectedBusinessId }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string>('');
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (fileApi.isSupportedFileType(file)) {
        setSelectedFile(file);
      }
    }
  }, []);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (fileApi.isSupportedFileType(file)) {
        setSelectedFile(file);
      }
    }
  };
  
  const handleUpload = () => {
    if (selectedFile) {
      const fileTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      onUpload(selectedFile, selectedBusinessId, fileTags);
      setSelectedFile(null);
      setTags('');
    }
  };
  
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <UploadIcon sx={{ mr: 1 }} />
          Upload Files
        </Typography>
        
        {/* Drag and Drop Area */}
        <Box
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          sx={{
            border: `2px dashed ${dragActive ? 'primary.main' : 'divider'}`,
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            bgcolor: dragActive ? 'action.hover' : 'background.default',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            mb: 2,
            '&:hover': {
              bgcolor: 'action.hover',
              borderColor: 'primary.main'
            }
          }}
          component="label"
        >
          <input
            type="file"
            onChange={handleFileSelect}
            hidden
            accept=".txt,.pdf,.docx,.doc,.md,.rtf"
          />
          <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            {selectedFile ? selectedFile.name : 'Drop files here or click to browse'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Supported: PDF, Word, Text files (Max 100MB)
          </Typography>
        </Box>
        
        {/* Tags Input */}
        {selectedFile && (
          <>
            <TextField
              fullWidth
              label="Tags (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., contract, important, client-docs"
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Selected: {selectedFile.name} ({fileApi.formatFileSize(selectedFile.size)})
              </Typography>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
              >
                {loading ? 'Uploading...' : 'Upload File'}
              </Button>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// File List Component
interface FileListProps {
  files: FileItem[];
  loading: boolean;
  onFileAction: (action: string, file: FileItem) => void;
}

const FileList: React.FC<FileListProps> = ({ files, loading, onFileAction }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, file: FileItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedFile(file);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFile(null);
  };
  
  const handleMenuAction = (action: string) => {
    if (selectedFile) {
      onFileAction(action, selectedFile);
    }
    handleMenuClose();
  };
  
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf': return <PdfIcon color="error" />;
      case 'docx':
      case 'doc': return <FileIcon color="primary" />;
      default: return <TextIcon color="success" />;
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (files.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <FolderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No files uploaded yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload your first file to get started
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Grid container spacing={2}>
        {files.map((file) => {
          const statusInfo = fileApi.getProcessingStatusInfo(file.processing_status);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={file.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => theme.shadows[4],
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
                      {getFileIcon(file.file_type)}
                      <Box sx={{ ml: 1, minWidth: 0, flex: 1 }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={file.original_name}
                        >
                          {file.original_name}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleMenuOpen(e, file)}
                      sx={{ ml: 1 }}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {fileApi.formatFileSize(file.file_size)} • {file.file_type.toUpperCase()}
                  </Typography>
                  
                  <Chip 
                    label={statusInfo.label} 
                    size="small" 
                    color={statusInfo.color as any}
                    sx={{ mb: 1 }}
                  />
                  
                  {file.business_id && (
                    <Chip 
                      icon={<BusinessIcon />}
                      label="Business File" 
                      size="small" 
                      variant="outlined"
                      sx={{ mb: 1, ml: 1 }}
                    />
                  )}
                  
                  {file.tags && file.tags.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {file.tags.slice(0, 2).map((tag, index) => (
                        <Chip 
                          key={index}
                          label={tag} 
                          size="small" 
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                      {file.tags.length > 2 && (
                        <Chip 
                          label={`+${file.tags.length - 2}`}
                          size="small" 
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      )}
                    </Box>
                  )}
                  
                  {file.summary && file.summary !== "Auto-generated summary unavailable. Content preview: ..." && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: 'success.light', borderRadius: 1, border: '1px solid', borderColor: 'success.main' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <SummaryIcon sx={{ fontSize: 16, color: 'success.dark', mr: 0.5 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.dark' }}>
                          AI Summary
                        </Typography>
                      </Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'success.dark',
                          fontSize: '0.8rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                        onClick={() => {
                          // Create a simple dialog/alert with full summary
                          alert(`Full Summary:\n\n${file.summary}`);
                        }}
                        title="Click to view full summary"
                      >
                        {file.summary}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      
      {/* File Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList>
          <MenuItem onClick={() => handleMenuAction('view')}>
            <ListItemIcon><ViewIcon /></ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleMenuAction('download')}>
            <ListItemIcon><DownloadIcon /></ListItemIcon>
            <ListItemText>Download</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleMenuAction('summary')}>
            <ListItemIcon><SummaryIcon /></ListItemIcon>
            <ListItemText>Generate Summary</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleMenuAction('edit')}>
            <ListItemIcon><EditIcon /></ListItemIcon>
            <ListItemText>Edit Info</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleMenuAction('move')}>
            <ListItemIcon><MoveIcon /></ListItemIcon>
            <ListItemText>Move File</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleMenuAction('delete')} sx={{ color: 'error.main' }}>
            <ListItemIcon><DeleteIcon color="error" /></ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  );
};

// Storage Usage Component
interface StorageUsageProps {
  usage: StorageUsageResponse | null;
  loading: boolean;
}

const StorageUsage: React.FC<StorageUsageProps> = ({ usage, loading }) => {
  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <StorageIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Storage Usage</Typography>
          </Box>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }
  
  if (!usage) return null;
  
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <StorageIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Storage Usage</Typography>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {usage.total_gb.toFixed(2)} GB of {usage.limit_gb} GB used
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {usage.usage_percentage.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={Math.min(usage.usage_percentage, 100)}
            color={usage.usage_percentage > 90 ? 'error' : usage.usage_percentage > 70 ? 'warning' : 'primary'}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Files: {usage.file_count}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Business: {fileApi.formatFileSize(usage.business_files_bytes)}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Main Files Page Component
export default function FilesPage() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | undefined>();
  
  // State for files
  const [accountFiles, setAccountFiles] = useState<FileItem[]>([]);
  const [businessFiles, setBusinessFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // Storage usage
  const [storageUsage, setStorageUsage] = useState<StorageUsageResponse | null>(null);
  const [storageLoading, setStorageLoading] = useState(false);
  
  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('');
  
  // Snackbar for notifications
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Load files based on current tab
  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      if (tabValue === 0) {
        // Account files
        const response = await fileApi.listAccountFiles(searchQuery || undefined, fileTypeFilter || undefined);
        setAccountFiles(response.files);
      } else if (tabValue === 1 && selectedBusinessId) {
        // Business files
        const response = await fileApi.listBusinessFiles(selectedBusinessId, searchQuery || undefined, fileTypeFilter || undefined);
        setBusinessFiles(response.files);
      }
    } catch (error) {
      console.error('Error loading files:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load files',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [tabValue, selectedBusinessId, searchQuery, fileTypeFilter]);
  
  // Load storage usage
  const loadStorageUsage = useCallback(async () => {
    setStorageLoading(true);
    try {
      const usage = await fileApi.getStorageUsage();
      setStorageUsage(usage);
    } catch (error) {
      console.error('Error loading storage usage:', error);
    } finally {
      setStorageLoading(false);
    }
  }, []);
  
  // Load data on mount and when dependencies change
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);
  
  useEffect(() => {
    loadStorageUsage();
  }, [loadStorageUsage]);
  
  // Handle file upload
  const handleFileUpload = async (file: File, businessId?: number, tags: string[] = []) => {
    setUploadLoading(true);
    try {
      if (businessId) {
        await fileApi.uploadBusinessFile(businessId, file, true, tags);
      } else {
        await fileApi.uploadAccountFile(file, true, tags);
      }
      
      setSnackbar({
        open: true,
        message: 'File uploaded successfully!',
        severity: 'success'
      });
      
      // Refresh files and storage
      loadFiles();
      loadStorageUsage();
    } catch (error) {
      console.error('Upload error:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Upload failed',
        severity: 'error'
      });
    } finally {
      setUploadLoading(false);
    }
  };
  
  // Handle file actions
  const handleFileAction = async (action: string, file: FileItem) => {
    try {
      switch (action) {
        case 'download':
          const blob = await fileApi.downloadFile(file.id);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.original_name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          break;
          
        case 'delete':
          if (window.confirm(`Are you sure you want to delete "${file.original_name}"?`)) {
            await fileApi.deleteFile(file.id);
            setSnackbar({
              open: true,
              message: 'File deleted successfully',
              severity: 'success'
            });
            loadFiles();
            loadStorageUsage();
          }
          break;
          
        case 'summary':
          await fileApi.generateSummary(file.id, true);
          setSnackbar({
            open: true,
            message: 'Summary generated successfully',
            severity: 'success'
          });
          loadFiles();
          break;
          
        default:
          console.log(`Action ${action} not implemented yet`);
      }
    } catch (error) {
      console.error(`Error with action ${action}:`, error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : `Failed to ${action} file`,
        severity: 'error'
      });
    }
  };
  
  // Get layout component based on user role
  const getLayoutComponent = () => {
    if (!user) return AdminLayout;
    
    if (user.role === 'admin') return AdminLayout;
    if (user.role === 'agency_owner' || user.role === 'agency_manager' || user.role === 'agency_viewer') {
      return AgencyLayout;
    }
    return BusinessLayout;
  };
  
  const LayoutComponent = getLayoutComponent();
  const currentFiles = tabValue === 0 ? accountFiles : businessFiles;
  
  const pageContent = (
    <Box>
      {/* Storage Usage */}
      <StorageUsage usage={storageUsage} loading={storageLoading} />
      
      {/* File Upload */}
      <FileUploadCard 
        onUpload={handleFileUpload}
        loading={uploadLoading}
        selectedBusinessId={tabValue === 1 ? selectedBusinessId : undefined}
      />
      
      {/* Search and Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setSearchQuery('')} size="small">
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>File Type</InputLabel>
                <Select
                  value={fileTypeFilter}
                  onChange={(e) => setFileTypeFilter(e.target.value)}
                  label="File Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="docx">Word</MenuItem>
                  <MenuItem value="txt">Text</MenuItem>
                  <MenuItem value="md">Markdown</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={loadFiles}
                startIcon={<SearchIcon />}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* File Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab 
              icon={<FolderIcon />} 
              label="Account Files" 
              iconPosition="start"
              sx={{ minHeight: 60 }}
            />
            <Tab 
              icon={<BusinessIcon />} 
              label="Business Files" 
              iconPosition="start"
              sx={{ minHeight: 60 }}
              disabled={!selectedBusinessId}
            />
          </Tabs>
        </Box>
        
        <CardContent>
          {/* Business Selector for Business Tab */}
          {tabValue === 1 && (
            <Box sx={{ mb: 3 }}>
              <BusinessSelector 
                variant="compact"
                onBusinessChange={(businessId) => setSelectedBusinessId(businessId ? Number(businessId) : undefined)}
              />
            </Box>
          )}
          
          {/* File List */}
          <TabPanel value={tabValue} index={0}>
            <FileList 
              files={currentFiles}
              loading={loading}
              onFileAction={handleFileAction}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            {selectedBusinessId ? (
              <FileList 
                files={currentFiles}
                loading={loading}
                onFileAction={handleFileAction}
              />
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>
                Please select a business to view its files
              </Alert>
            )}
          </TabPanel>
        </CardContent>
      </Card>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
  
  return (
    <LayoutComponent 
      title="File Management"
      subtitle="Upload, organize, and manage your files with AI-powered summarization"
    >
      {pageContent}
    </LayoutComponent>
  );
}
