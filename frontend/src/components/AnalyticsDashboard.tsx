import React from 'react';
import { Typography, Paper, Button } from '@mui/material';
import { BarChart } from '@mui/icons-material';

const AnalyticsDashboard: React.FC = () => {
  return (
    <Paper sx={{ 
      p: 3, 
      borderRadius: 3,
      backgroundColor: 'background.paper',
      textAlign: 'center',
      minHeight: '400px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <BarChart sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Project performance metrics, team velocity, and completion analytics will appear here.
      </Typography>
      <Button variant="outlined">
        Coming Soon
      </Button>
    </Paper>
  );
};

export default AnalyticsDashboard;