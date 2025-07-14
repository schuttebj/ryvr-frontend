import { Box, Typography, Card, CardContent } from '@mui/material';

export default function ClientsPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Clients
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="body1">
            Client management interface coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
} 