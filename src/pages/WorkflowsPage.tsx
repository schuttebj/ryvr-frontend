import { Box, Typography, Card, CardContent } from '@mui/material';

export default function WorkflowsPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Workflows
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="body1">
            Workflow builder and management interface coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
} 