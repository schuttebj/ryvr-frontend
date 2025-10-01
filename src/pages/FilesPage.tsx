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
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Folder as FolderIcon,
  Business as BusinessIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  AutoAwesome as SummaryIcon,
  Storage as StorageIcon,
  Clear as ClearIcon,
  Description as FileIcon,
  PictureAsPdf as PdfIcon,
  TextSnippet as TextIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
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
  uploadProgress?: { stage: string; percent: number };
  selectedBusinessId?: number;
  onClose?: () => void;
}

const FileUploadModal: React.FC<FileUploadProps> = ({ onUpload, loading, uploadProgress, selectedBusinessId, onClose }) => {
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
      if (onClose) onClose();
    }
  };
  
  return (
    <Box>
      {/* Drag and Drop Area - Full Width with flex display fix */}
      <Box
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        sx={{
          border: dragActive ? '2px dashed' : '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'divider',
          borderRadius: 2,
          p: 6,
          textAlign: 'center',
          bgcolor: dragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          mb: 2,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
          '&:hover': {
            bgcolor: 'action.hover',
            borderColor: 'primary.main'
          }
        }}
      >
        <input
          type="file"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="file-upload-input"
          accept=".txt,.pdf,.docx,.doc,.md,.rtf"
        />
        <label htmlFor="file-upload-input" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <UploadIcon sx={{ fontSize: 56, color: dragActive ? 'primary.main' : 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color={dragActive ? 'primary.main' : 'text.primary'} sx={{ mb: 1 }}>
            {selectedFile ? selectedFile.name : 'Drop files here or click to browse'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supported: PDF, Word, Text files (Max 100MB)
          </Typography>
        </label>
      </Box>
      
      {/* Upload Progress */}
      {loading && uploadProgress && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {uploadProgress.stage}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {uploadProgress.percent}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={uploadProgress.percent} 
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
      )}
      
      {/* Tags Input */}
      {selectedFile && !loading && (
        <>
          <TextField
            fullWidth
            label="Tags (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., contract, important, client-docs"
            size="small"
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={loading}
              startIcon={<UploadIcon />}
            >
              Upload File
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

// File Row Component with Collapsible Summary
interface FileRowProps {
  file: FileItem;
  onFileAction: (action: string, file: FileItem) => void;
}

const FileRow: React.FC<FileRowProps> = ({ file, onFileAction }) => {
  const [open, setOpen] = useState(false);
  
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf': return <PdfIcon color="error" />;
      case 'docx':
      case 'doc': return <FileIcon color="primary" />;
      default: return <TextIcon color="success" />;
    }
  };
  
  const statusInfo = fileApi.getProcessingStatusInfo(file.processing_status);
  const hasSummary = file.summary && file.summary !== "Auto-generated summary unavailable. Content preview: ...";
  
  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' }, '&:hover': { bgcolor: 'action.hover' } }}>
        <TableCell sx={{ width: 50 }}>
          <IconButton
            size="small"
            onClick={() => setOpen(!open)}
            disabled={!hasSummary}
          >
            {open ? <ArrowUpIcon /> : <ArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ width: 50 }}>
          {getFileIcon(file.file_type)}
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {file.original_name}
          </Typography>
          {file.tags && file.tags.length > 0 && (
            <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {file.tags.map((tag, index) => (
                <Chip key={index} label={tag} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
              ))}
            </Box>
          )}
        </TableCell>
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {fileApi.formatFileSize(file.file_size)}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip 
            label={statusInfo.label} 
            size="small" 
            color={statusInfo.color as any}
          />
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {file.business_id && (
              <Chip 
                icon={<BusinessIcon />}
                label="Business" 
                size="small" 
                variant="outlined"
                sx={{ height: 22 }}
              />
            )}
            {file.is_embedded !== undefined && (
              <Tooltip title={file.embedding_summary || 'Embedding status'}>
                <Chip 
                  label={file.is_embedded ? `✓ ${file.chunks_with_embeddings || 0} chunks` : 'Not embedded'}
                  size="small" 
                  color={file.is_embedded ? 'success' : 'default'}
                  variant={file.is_embedded ? 'filled' : 'outlined'}
                  sx={{ height: 22, fontSize: '0.7rem' }}
                />
              </Tooltip>
            )}
          </Box>
        </TableCell>
        <TableCell align="right">
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Tooltip title="Download">
              <IconButton size="small" onClick={() => onFileAction('download', file)}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Generate Summary">
              <IconButton size="small" onClick={() => onFileAction('summary', file)}>
                <SummaryIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => onFileAction('delete', file)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>
      {hasSummary && (
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ py: 2, px: 3, bgcolor: 'background.default', borderRadius: 1, my: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SummaryIcon sx={{ fontSize: 18, color: 'primary.main', mr: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    AI Summary
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {file.summary}
                </Typography>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

// File List Component
interface FileListProps {
  files: FileItem[];
  loading: boolean;
  onFileAction: (action: string, file: FileItem) => void;
}

const FileList: React.FC<FileListProps> = ({ files, loading, onFileAction }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (files.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <FolderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No files uploaded yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload your first file to get started
        </Typography>
      </Box>
    );
  }
  
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'background.default' }}>
            <TableCell sx={{ width: 50 }} />
            <TableCell sx={{ width: 50 }} />
            <TableCell sx={{ fontWeight: 600 }}>File Name</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Processing</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Context & Embeddings</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {files.map((file) => (
            <FileRow key={file.id} file={file} onFileAction={onFileAction} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Compact Storage Usage Component
interface StorageUsageProps {
  usage: StorageUsageResponse | null;
  loading: boolean;
}

const StorageUsage: React.FC<StorageUsageProps> = ({ usage, loading }) => {
  if (loading) {
    return (
      <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StorageIcon sx={{ fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>Storage Usage</Typography>
        </Box>
        <LinearProgress sx={{ mt: 1, height: 4, borderRadius: 2 }} />
      </Box>
    );
  }
  
  if (!usage) return null;
  
  return (
    <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StorageIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Storage: {usage.total_gb.toFixed(2)} / {usage.limit_gb} GB
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {usage.file_count} files
          </Typography>
          <Chip 
            label={`${usage.usage_percentage.toFixed(1)}%`} 
            size="small"
            color={usage.usage_percentage > 90 ? 'error' : usage.usage_percentage > 70 ? 'warning' : 'primary'}
            sx={{ fontWeight: 600, height: 24 }}
          />
        </Box>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={Math.min(usage.usage_percentage, 100)}
        color={usage.usage_percentage > 90 ? 'error' : usage.usage_percentage > 70 ? 'warning' : 'primary'}
        sx={{ height: 4, borderRadius: 2 }}
      />
    </Box>
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
  const [uploadProgress, setUploadProgress] = useState<{ stage: string; percent: number } | undefined>();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  
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
        // Business files - fetch with embedding status
        try {
          console.log('📊 Fetching files with embedding status for business:', selectedBusinessId);
          const embeddingResponse = await fileApi.getFilesWithEmbeddings(selectedBusinessId);
          
          console.log('✅ Embedding response:', {
            totalFiles: embeddingResponse.total_files,
            embeddedFiles: embeddingResponse.embedded_files,
            notEmbeddedFiles: embeddingResponse.not_embedded_files,
            embeddingPercentage: embeddingResponse.embedding_percentage + '%'
          });
          
          // Merge embedding data with file data
          const filesWithEmbeddings = embeddingResponse.files.map((file: any) => {
            const mapped = {
              ...file,
              // Map the backend field names to match FileItem interface
              id: file.file_id || file.id,
              file_name: file.filename || file.file_name || '',
              original_name: file.filename || file.original_name || ''
            };
            
            if (file.is_embedded) {
              console.log('✓ File embedded:', file.filename, `(${file.chunks_with_embeddings} chunks, ${file.embedding_coverage}% coverage)`);
            } else {
              console.log('○ File not embedded:', file.filename);
            }
            
            return mapped;
          });
          
          setBusinessFiles(filesWithEmbeddings);
        } catch (embeddingError) {
          // Fallback to regular file list if embeddings endpoint fails
          console.warn('⚠️ Failed to fetch embedding status, using regular file list:', embeddingError);
          const response = await fileApi.listBusinessFiles(selectedBusinessId, searchQuery || undefined, fileTypeFilter || undefined);
          setBusinessFiles(response.files);
        }
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
    // Refresh storage usage every 30 seconds for live updates
    const interval = setInterval(() => {
      loadStorageUsage();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loadStorageUsage]);
  
  // Handle file upload with progress tracking
  const handleFileUpload = async (file: File, businessId?: number, tags: string[] = []) => {
    setUploadLoading(true);
    setUploadProgress({ stage: 'Uploading file...', percent: 0 });
    
    console.log('🚀 Starting file upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      businessId,
      tags
    });
    
    try {
      // Simulate upload progress
      setUploadProgress({ stage: 'Uploading file...', percent: 30 });
      
      let uploadResult;
      if (businessId) {
        console.log('📤 Uploading to business:', businessId);
        uploadResult = await fileApi.uploadBusinessFile(businessId, file, true, tags);
      } else {
        console.log('📤 Uploading to account');
        uploadResult = await fileApi.uploadAccountFile(file, true, tags);
      }
      
      console.log('✅ Upload successful:', uploadResult);
      
      setUploadProgress({ stage: 'Generating summary...', percent: 60 });
      console.log('📝 Generating AI summary...');
      
      // Wait a bit for backend processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUploadProgress({ stage: 'Creating embeddings...', percent: 85 });
      console.log('🧠 Creating vector embeddings...');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUploadProgress({ stage: 'Complete!', percent: 100 });
      console.log('✨ File processing complete!');
      
      setSnackbar({
        open: true,
        message: 'File uploaded and processed successfully!',
        severity: 'success'
      });
      
      // Refresh files and storage
      console.log('🔄 Refreshing file list and storage...');
      await Promise.all([loadFiles(), loadStorageUsage()]);
      
      console.log('✅ All operations complete');
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Upload failed',
        severity: 'error'
      });
    } finally {
      setUploadLoading(false);
      setUploadProgress(undefined);
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
      {/* Storage Usage & Upload Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <StorageUsage usage={storageUsage} loading={storageLoading} />
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<UploadIcon />}
          onClick={() => setUploadModalOpen(true)}
          sx={{ minWidth: 160, height: 'fit-content' }}
        >
          Upload File
        </Button>
      </Box>
      
      {/* Upload Modal */}
      <Dialog 
        open={uploadModalOpen} 
        onClose={() => !uploadLoading && setUploadModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <UploadIcon sx={{ mr: 1 }} />
            Upload File
          </Box>
        </DialogTitle>
        <DialogContent>
          <FileUploadModal
            onUpload={handleFileUpload}
            loading={uploadLoading}
            uploadProgress={uploadProgress}
            selectedBusinessId={tabValue === 1 ? selectedBusinessId : undefined}
            onClose={() => setUploadModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
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
