import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar
} from '@mui/material';
import {
  TrendingUp,
  EmojiEvents,
  CheckCircle
} from '@mui/icons-material';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  isOnline: boolean;
  lastSeen: string;
  projects: number;
  tasksCompleted: number;
  avatar?: string;
}

interface TeamPerformanceProps {
  members: TeamMember[];
}

const TeamPerformance: React.FC<TeamPerformanceProps> = ({ members }) => {
  const totalTasks = members.reduce((acc, member) => acc + member.tasksCompleted, 0);
  const avgTasksPerMember = totalTasks / (members.length || 1);
  const topPerformer = members.reduce((prev, current) => 
    (prev.tasksCompleted > current.tasksCompleted) ? prev : current
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Team Performance
      </Typography>

      {/* Stats Cards - Using Flexbox instead of Grid */}
      <Box sx={{ 
        display: 'flex', 
        gap: 3, 
        mb: 3, 
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'flex-start' }
      }}>
        <Card sx={{ flex: 1, minWidth: { xs: 'auto', sm: 200 } }}>
          <CardContent>
            <TrendingUp color="primary" />
            <Typography variant="h6" sx={{ mt: 1 }}>
              Total Tasks Completed
            </Typography>
            <Typography variant="h4" color="primary">
              {totalTasks}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: { xs: 'auto', sm: 200 } }}>
          <CardContent>
            <CheckCircle color="success" />
            <Typography variant="h6" sx={{ mt: 1 }}>
              Average per Member
            </Typography>
            <Typography variant="h4" color="success.main">
              {Math.round(avgTasksPerMember)}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: { xs: 'auto', sm: 200 } }}>
          <CardContent>
            <EmojiEvents color="warning" />
            <Typography variant="h6" sx={{ mt: 1 }}>
              Top Performer
            </Typography>
            <Typography variant="h6" color="warning.main">
              {topPerformer.name}
            </Typography>
            <Typography variant="body2">
              {topPerformer.tasksCompleted} tasks
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Member Performance
          </Typography>
          <List>
            {members.map((member) => (
              <ListItem key={member._id} divider>
                <ListItemIcon>
                  <Avatar sx={{ width: 40, height: 40 }}>
                    {member.name.charAt(0)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1">
                        {member.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {member.tasksCompleted} tasks
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((member.tasksCompleted / (topPerformer.tasksCompleted || 1)) * 100, 100)}
                      sx={{ mt: 1, height: 8, borderRadius: 4 }}
                    />
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TeamPerformance;