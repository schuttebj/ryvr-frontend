import { Box, Typography, Card, CardContent } from '@mui/material';
import AdminLayout from '../components/layout/AdminLayout';

export default function AnalyticsPage() {
  return (
    <AdminLayout 
      title="Analytics"
      subtitle="View platform analytics and insights"
    >
      <Box>
      
      <Card>
        <CardContent>
          <Typography variant="body1">
            Analytics and reporting interface coming soon...
          </Typography>
        </CardContent>
      </Card>
      </Box>
    </AdminLayout>
  );
} 