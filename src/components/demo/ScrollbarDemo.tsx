/**
 * Scrollbar Demo Component
 * Demonstrates the different scrollbar variants for testing purposes
 */

import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import GlassScrollContainer, { 
  TableScrollContainer, 
  SidebarScrollContainer, 
  ContentScrollContainer,
  OverlayScrollContainer,
  PrimaryScrollContainer 
} from '../common/GlassScrollContainer';

const longContent = Array.from({ length: 50 }, (_, i) => `This is line ${i + 1} of the scrollable content. `).join('\n');

export default function ScrollbarDemo() {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Glassmorphism Scrollbar Demo
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Demonstration of different scrollbar variants with glass effects
      </Typography>

      <Grid container spacing={3}>
        {/* Default Scrollbar */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Default Glass Scrollbar
              </Typography>
              <GlassScrollContainer maxHeight="200px">
                <Typography variant="body2" whiteSpace="pre-line">
                  {longContent}
                </Typography>
              </GlassScrollContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Thin Scrollbar */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thin Scrollbar (Sidebar Style)
              </Typography>
              <SidebarScrollContainer maxHeight="200px">
                <Typography variant="body2" whiteSpace="pre-line">
                  {longContent}
                </Typography>
              </SidebarScrollContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Thick Scrollbar */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thick Scrollbar (Content Style)
              </Typography>
              <ContentScrollContainer maxHeight="200px">
                <Typography variant="body2" whiteSpace="pre-line">
                  {longContent}
                </Typography>
              </ContentScrollContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Overlay Scrollbar */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overlay Scrollbar (Hover to Show)
              </Typography>
              <OverlayScrollContainer maxHeight="200px">
                <Typography variant="body2" whiteSpace="pre-line">
                  {longContent}
                </Typography>
              </OverlayScrollContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Primary Themed Scrollbar */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Primary Themed Scrollbar
              </Typography>
              <PrimaryScrollContainer maxHeight="200px">
                <Typography variant="body2" whiteSpace="pre-line">
                  {longContent}
                </Typography>
              </PrimaryScrollContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Table Scrollbar */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Table Scrollbar
              </Typography>
              <TableScrollContainer maxHeight="200px">
                <Typography variant="body2" whiteSpace="pre-line">
                  {longContent}
                </Typography>
              </TableScrollContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Scrollbar Features */}
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Scrollbar Features
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Light Mode Features
                </Typography>
                <ul>
                  <li>Semi-transparent dark scrollbar with glass effect</li>
                  <li>Smooth hover animations with increased opacity</li>
                  <li>Backdrop blur for premium feel</li>
                  <li>No scroll arrows for clean appearance</li>
                  <li>Responsive size changes on hover</li>
                </ul>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Dark Mode Features
                </Typography>
                <ul>
                  <li>Semi-transparent light scrollbar with glass effect</li>
                  <li>Enhanced contrast for better visibility</li>
                  <li>Consistent glassmorphism aesthetic</li>
                  <li>Smooth transitions and hover effects</li>
                  <li>Matches dark theme color scheme</li>
                </ul>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
