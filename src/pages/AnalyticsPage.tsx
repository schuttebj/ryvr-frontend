import { Box, Typography, Card, CardContent } from '@mui/material';

export default function AnalyticsPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Analytics
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="body1">
            Analytics and reporting interface coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
} 