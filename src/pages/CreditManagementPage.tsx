import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Alert,
  Stack,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  CreditCard as CreditIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  History as HistoryIcon,
  ShoppingCart as PurchaseIcon,
  AccountBalance as BalanceIcon,
  Timeline as UsageIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { TableScrollContainer } from '../components/common/GlassScrollContainer';

interface CreditPool {
  id: number;
  entity_type: 'user' | 'agency' | 'business';
  entity_id: number;
  entity_name: string;
  balance: number;
  allocated_amount?: number;
  usage_30d: number;
  last_transaction: string;
  status: 'active' | 'low' | 'depleted' | 'suspended';
}

interface CreditTransaction {
  id: number;
  type: 'purchase' | 'allocation' | 'usage' | 'refund' | 'bonus';
  amount: number;
  description: string;
  entity_name?: string;
  workflow_name?: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

interface CreditPackage {
  id: number;
  name: string;
  credits: number;
  price: number;
  bonus_credits?: number;
  popular?: boolean;
  description: string;
}

export default function CreditManagementPage() {
  const { user } = useAuth();
  
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [creditPools, setCreditPools] = useState<CreditPool[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [isAllocateDialogOpen, setIsAllocateDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [allocationAmount, setAllocationAmount] = useState(0);
  const [selectedPool, setSelectedPool] = useState<CreditPool | null>(null);

  // Mock data - replace with real API calls
  const fetchCreditData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock credit pools based on user role
      const mockPools: CreditPool[] = [];
      
      if (user?.role === 'admin') {
        mockPools.push(
          {
            id: 1,
            entity_type: 'user',
            entity_id: 1,
            entity_name: 'System Pool',
            balance: 50000,
            usage_30d: 12500,
            last_transaction: '2024-03-15T14:30:00Z',
            status: 'active'
          }
        );
      }
      
      if (user?.role?.includes('agency')) {
        mockPools.push(
          {
            id: 2,
            entity_type: 'agency',
            entity_id: 1,
            entity_name: 'Digital Marketing Agency',
            balance: 8500,
            usage_30d: 6200,
            last_transaction: '2024-03-15T12:15:00Z',
            status: 'active'
          },
          {
            id: 3,
            entity_type: 'business',
            entity_id: 1,
            entity_name: 'Tech Startup Inc',
            balance: 1200,
            allocated_amount: 2000,
            usage_30d: 800,
            last_transaction: '2024-03-15T10:45:00Z',
            status: 'active'
          },
          {
            id: 4,
            entity_type: 'business',
            entity_id: 2,
            entity_name: 'Local Restaurant',
            balance: 150,
            allocated_amount: 1000,
            usage_30d: 850,
            last_transaction: '2024-03-14T16:20:00Z',
            status: 'low'
          }
        );
      } else {
        mockPools.push(
          {
            id: 5,
            entity_type: 'user',
            entity_id: 2,
            entity_name: 'My Account',
            balance: 2450,
            usage_30d: 1875,
            last_transaction: '2024-03-15T09:30:00Z',
            status: 'active'
          },
          {
            id: 6,
            entity_type: 'business',
            entity_id: 3,
            entity_name: 'My Marketing Agency',
            balance: 1200,
            usage_30d: 650,
            last_transaction: '2024-03-15T11:15:00Z',
            status: 'active'
          }
        );
      }
      
      setCreditPools(mockPools);
      
      // Mock transactions
      const mockTransactions: CreditTransaction[] = [
        {
          id: 1,
          type: 'usage',
          amount: -25,
          description: 'SEO Content Analysis workflow execution',
          workflow_name: 'SEO Content Analysis',
          timestamp: '2024-03-15T14:30:00Z',
          status: 'completed'
        },
        {
          id: 2,
          type: 'allocation',
          amount: -500,
          description: 'Allocated credits to Tech Startup Inc',
          entity_name: 'Tech Startup Inc',
          timestamp: '2024-03-15T12:15:00Z',
          status: 'completed'
        },
        {
          id: 3,
          type: 'purchase',
          amount: 5000,
          description: 'Purchased Professional package',
          timestamp: '2024-03-14T16:45:00Z',
          status: 'completed'
        },
        {
          id: 4,
          type: 'usage',
          amount: -12,
          description: 'Social Media Post Generation',
          workflow_name: 'Social Media Generator',
          timestamp: '2024-03-14T15:20:00Z',
          status: 'completed'
        },
        {
          id: 5,
          type: 'bonus',
          amount: 200,
          description: 'New user bonus credits',
          timestamp: '2024-03-13T10:00:00Z',
          status: 'completed'
        }
      ];
      
      setTransactions(mockTransactions);
      
      // Mock credit packages
      const mockPackages: CreditPackage[] = [
        {
          id: 1,
          name: 'Starter',
          credits: 1000,
          price: 10,
          description: 'Perfect for small projects'
        },
        {
          id: 2,
          name: 'Professional',
          credits: 5000,
          price: 45,
          bonus_credits: 500,
          popular: true,
          description: 'Most popular for growing businesses'
        },
        {
          id: 3,
          name: 'Enterprise',
          credits: 15000,
          price: 120,
          bonus_credits: 2000,
          description: 'For large-scale operations'
        },
        {
          id: 4,
          name: 'Ultimate',
          credits: 50000,
          price: 350,
          bonus_credits: 8000,
          description: 'Maximum value for agencies'
        }
      ];
      
      setPackages(mockPackages);
      
    } catch (err: any) {
      console.error('Failed to fetch credit data:', err);
      setError(err.message || 'Failed to load credit data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreditData();
  }, []);

  const handlePurchase = async (pkg: CreditPackage) => {
    try {
      // Simulate purchase API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add credits to main pool
      const updatedPools = creditPools.map(pool => {
        if (pool.entity_type === 'user' || (pool.entity_type === 'agency' && user?.role?.includes('agency'))) {
          return { ...pool, balance: pool.balance + pkg.credits + (pkg.bonus_credits || 0) };
        }
        return pool;
      });
      
      setCreditPools(updatedPools);
      setIsPurchaseDialogOpen(false);
      setSelectedPackage(null);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  const handleAllocate = async () => {
    try {
      // Simulate allocation API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update pools
      const updatedPools = creditPools.map(pool => {
        if (pool.id === selectedPool?.id) {
          return { ...pool, balance: pool.balance + allocationAmount };
        }
        // Deduct from agency/user pool
        if (pool.entity_type === 'agency' || pool.entity_type === 'user') {
          return { ...pool, balance: pool.balance - allocationAmount };
        }
        return pool;
      });
      
      setCreditPools(updatedPools);
      setIsAllocateDialogOpen(false);
      setAllocationAmount(0);
      setSelectedPool(null);
    } catch (error) {
      console.error('Allocation failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'low': return 'warning';
      case 'depleted': case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase': case 'bonus': return <AddIcon color="success" />;
      case 'usage': case 'allocation': return <RemoveIcon color="error" />;
      case 'refund': return <CheckIcon color="info" />;
      default: return <CreditIcon />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
        <Button onClick={fetchCreditData} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  const totalBalance = creditPools.reduce((sum, pool) => sum + pool.balance, 0);
  const totalUsage = creditPools.reduce((sum, pool) => sum + pool.usage_30d, 0);

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Credit Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor usage, allocate credits, and purchase additional credits
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => setActiveTab(1)}
          >
            View History
          </Button>
          <Button
            variant="contained"
            startIcon={<PurchaseIcon />}
            onClick={() => setIsPurchaseDialogOpen(true)}
          >
            Purchase Credits
          </Button>
        </Stack>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <BalanceIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {totalBalance.toLocaleString()}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Balance
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <UsageIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {totalUsage.toLocaleString()}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Usage (30 days)
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {((totalBalance / (totalBalance + totalUsage)) * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Efficiency Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {Math.ceil(totalBalance / (totalUsage / 30))}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Days Remaining
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Credit Pools" />
          <Tab label="Transaction History" />
          <Tab label="Purchase Credits" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {creditPools.map((pool) => (
            <Grid item xs={12} md={6} lg={4} key={pool.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: getStatusColor(pool.status) + '.main', mr: 2 }}>
                        {pool.entity_type === 'business' ? <BusinessIcon /> : <CreditIcon />}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {pool.entity_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {pool.entity_type.charAt(0).toUpperCase() + pool.entity_type.slice(1)}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={pool.status} 
                      color={getStatusColor(pool.status)} 
                      size="small"
                    />
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      {pool.balance.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Available credits
                    </Typography>
                  </Box>
                  
                  {pool.allocated_amount && (
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Allocation Progress
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={((pool.allocated_amount - pool.balance) / pool.allocated_amount) * 100}
                        sx={{ borderRadius: 2, height: 8 }}
                      />
                      <Typography variant="caption" color="text.secondary" mt={1} display="block">
                        {pool.allocated_amount - pool.balance} / {pool.allocated_amount} used
                      </Typography>
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      30-day usage:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {pool.usage_30d.toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Last activity:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {new Date(pool.last_transaction).toLocaleDateString()}
                    </Typography>
                  </Box>
                  
                  {(user?.role?.includes('agency') || user?.role === 'admin') && pool.entity_type === 'business' && (
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setSelectedPool(pool);
                        setIsAllocateDialogOpen(true);
                      }}
                      sx={{ mt: 2 }}
                    >
                      Allocate Credits
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 1 && (
        <TableScrollContainer maxHeight="70vh">
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {getTransactionIcon(transaction.type)}
                        <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
                          {transaction.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {transaction.description}
                      </Typography>
                      {(transaction.entity_name || transaction.workflow_name) && (
                        <Typography variant="caption" color="text.secondary">
                          {transaction.entity_name || transaction.workflow_name}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        fontWeight="bold"
                        color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                      >
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={transaction.status} 
                        size="small"
                        color={transaction.status === 'completed' ? 'success' : transaction.status === 'failed' ? 'error' : 'warning'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TableScrollContainer>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          {packages.map((pkg) => (
            <Grid item xs={12} sm={6} md={3} key={pkg.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  position: 'relative',
                  border: pkg.popular ? 2 : 1,
                  borderColor: pkg.popular ? 'primary.main' : 'divider',
                }}
              >
                {pkg.popular && (
                  <Chip 
                    label="Most Popular" 
                    color="primary" 
                    size="small"
                    sx={{ 
                      position: 'absolute', 
                      top: -8, 
                      left: '50%', 
                      transform: 'translateX(-50%)',
                      fontWeight: 'bold'
                    }}
                  />
                )}
                <CardContent sx={{ textAlign: 'center', pt: pkg.popular ? 3 : 2 }}>
                  <Typography variant="h5" fontWeight="bold" mb={1}>
                    {pkg.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    {pkg.description}
                  </Typography>
                  
                  <Typography variant="h3" fontWeight="bold" color="primary.main" mb={1}>
                    ${pkg.price}
                  </Typography>
                  
                  <Typography variant="h6" mb={1}>
                    {pkg.credits.toLocaleString()} credits
                  </Typography>
                  
                  {pkg.bonus_credits && (
                    <Typography variant="body2" color="success.main" mb={2}>
                      + {pkg.bonus_credits.toLocaleString()} bonus credits
                    </Typography>
                  )}
                  
                  <Typography variant="caption" color="text.secondary" mb={3} display="block">
                    ${(pkg.price / (pkg.credits + (pkg.bonus_credits || 0)) * 1000).toFixed(2)} per 1K credits
                  </Typography>
                  
                  <Button 
                    variant={pkg.popular ? "contained" : "outlined"}
                    fullWidth
                    size="large"
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setIsPurchaseDialogOpen(true);
                    }}
                  >
                    Purchase
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Purchase Dialog */}
      <Dialog open={isPurchaseDialogOpen} onClose={() => setIsPurchaseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Purchase {selectedPackage?.name} Package
        </DialogTitle>
        <DialogContent>
          {selectedPackage && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Alert severity="info">
                You're about to purchase {selectedPackage.credits.toLocaleString()} credits
                {selectedPackage.bonus_credits && ` + ${selectedPackage.bonus_credits.toLocaleString()} bonus credits`}
                {' '}for ${selectedPackage.price}.
              </Alert>
              
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                  Package Details:
                </Typography>
                <Stack spacing={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Base credits:</Typography>
                    <Typography>{selectedPackage.credits.toLocaleString()}</Typography>
                  </Box>
                  {selectedPackage.bonus_credits && (
                    <Box display="flex" justifyContent="space-between">
                      <Typography>Bonus credits:</Typography>
                      <Typography color="success.main">+{selectedPackage.bonus_credits.toLocaleString()}</Typography>
                    </Box>
                  )}
                  <Divider />
                  <Box display="flex" justifyContent="space-between">
                    <Typography fontWeight="bold">Total credits:</Typography>
                    <Typography fontWeight="bold">
                      {(selectedPackage.credits + (selectedPackage.bonus_credits || 0)).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography fontWeight="bold">Total price:</Typography>
                    <Typography fontWeight="bold" color="primary.main">
                      ${selectedPackage.price}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPurchaseDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => selectedPackage && handlePurchase(selectedPackage)} 
            variant="contained"
          >
            Confirm Purchase
          </Button>
        </DialogActions>
      </Dialog>

      {/* Allocate Credits Dialog */}
      <Dialog open={isAllocateDialogOpen} onClose={() => setIsAllocateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Allocate Credits to {selectedPool?.entity_name}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              Current balance: {selectedPool?.balance.toLocaleString()} credits
            </Alert>
            
            <TextField
              fullWidth
              type="number"
              label="Credits to Allocate"
              value={allocationAmount}
              onChange={(e) => setAllocationAmount(Number(e.target.value))}
              inputProps={{ min: 0, max: 10000 }}
            />
            
            <Typography variant="body2" color="text.secondary">
              This will transfer credits from your main pool to the selected business pool.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAllocateDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAllocate} 
            variant="contained"
            disabled={allocationAmount <= 0}
          >
            Allocate Credits
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
