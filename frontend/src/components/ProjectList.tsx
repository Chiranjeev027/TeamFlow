// teamflow/frontend/src/components/ProjectList.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Dialog, 
  TextField, 
  // CircularProgress replaced by Skeleton
  Avatar, 
  AvatarGroup, 
  IconButton, 
  LinearProgress, 
  Skeleton,
  alpha,
  Chip
} from '@mui/material';
import { Add, MoreHoriz, People, CalendarToday } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Project {
  _id: string;
  name: string;
  description: string;
  owner: { _id: string; name: string; email: string };
  members: Array<{ _id: string; name: string; email: string }>;
  createdAt: string;
}

interface ProjectListProps {
  onProjectCreated?: () => void;
}

interface ProjectAnalytics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  highPriorityTasks: number;
  overdueTasks: number;
  completionRate: number;
}

const ProjectList: React.FC<ProjectListProps> = ({ onProjectCreated }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectProgress, setProjectProgress] = useState<Record<string, number>>({});
  const [projectAnalytics, setProjectAnalytics] = useState<Record<string, ProjectAnalytics>>({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch projects');
      
      const data = await response.json();
      setProjects(data);
      // compute progress for each project (batch request)
      const progressObj: Record<string, number> = {};
      try {
        const ids = data.map((p: Project) => p._id);
        const token = localStorage.getItem('token');
        const resp = await fetch('/api/projects/analytics/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ projectIds: ids })
        });

        if (resp.ok) {
            const analyticsMap = await resp.json();
            for (const id of ids) {
              progressObj[id] = analyticsMap[id]?.completionRate || 0;
            }
            setProjectAnalytics(analyticsMap);
          } else {
          // If batch fails, fall back to zero progress for all
          ids.forEach((id: string) => { progressObj[id] = 0; });
        }
      } catch (err) {
        data.forEach((p: Project) => { progressObj[p._id] = 0; });
        setProjectAnalytics({});
      }
      setProjectProgress(progressObj);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to create project');
      
      const newProject = await response.json();
      setProjects([...projects, newProject]);
      setFormData({ name: '', description: '' });
      setOpen(false);
      
      // Call the callback to ensure we stay on the projects view
      if (onProjectCreated) {
        onProjectCreated();
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const getRandomColor = () => {
    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" sx={{ width: '100%' }}>
        <Box sx={{ width: '100%' }}>
          <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2, mb: 2 }} />
          <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2, mb: 2 }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: 4,
          borderRadius: 3,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Typography variant="h3" fontWeight="700" gutterBottom>
            My Projects
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Welcome back, {user?.name}!
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8, mt: 1 }}>
            Manage your team projects and collaborate seamlessly
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
          sx={{
            bgcolor: 'white',
            color: 'primary.main',
            px: 3,
            py: 1.5,
            borderRadius: 3,
            fontWeight: 600,
            fontSize: '1rem',
            boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.3)',
            '&:hover': {
              bgcolor: 'grey.100',
              transform: 'translateY(-2px)',
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)',
            },
            transition: 'all 0.3s ease',
            position: 'relative',
            zIndex: 2
          }}
        >
          NEW PROJECT
        </Button>

        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: alpha('#fff', 0.1),
            zIndex: 1
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            borderRadius: '50%',
            bgcolor: alpha('#fff', 0.1),
            zIndex: 1
          }}
        />
      </Box>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            },
            gap: 3,
            width: '100%'
          }}
        >
          {projects.map((project) => (
            <Card 
              key={project._id}
              sx={{ 
                cursor: 'pointer', 
                height: '100%',
                border: '1px solid',
                borderColor: 'grey.200',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
                  borderColor: 'primary.light',
                }
              }}
              onClick={() => handleProjectClick(project._id)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: getRandomColor(),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1.2rem'
                    }}
                  >
                    {project.name.charAt(0).toUpperCase()}
                  </Box>
                  <IconButton size="small">
                    <MoreHoriz />
                  </IconButton>
                </Box>

                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {project.name}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {project.description || 'No description provided'}
                </Typography>
                {/* Project progress */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress variant="determinate" value={projectProgress[project._id] || 0} sx={{ height: 8, borderRadius: 2 }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {projectProgress[project._id] || 0}%
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <People sx={{ fontSize: 18, color: 'grey.500' }} />
                    <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.8rem' } }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {project.owner?.name?.charAt(0).toUpperCase() || 'O'}
                      </Avatar>
                      {project.members.slice(0, 3).map((member) => (
                        <Avatar key={member._id} sx={{ bgcolor: 'secondary.main' }}>
                          {member?.name?.charAt(0).toUpperCase() || 'M'}
                        </Avatar>
                      ))}
                    </AvatarGroup>
                    {project.members.length > 3 && (
                      <Typography variant="caption" color="grey.500">
                        +{project.members.length - 3}
                      </Typography>
                    )}
                  </Box>
                  {/* Overdue / high priority indicators */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    {projectAnalytics[project._id]?.overdueTasks > 0 && (
                      <Chip size="small" color="error" label={`Overdue: ${projectAnalytics[project._id].overdueTasks}`} />
                    )}
                    {projectAnalytics[project._id]?.highPriorityTasks > 0 && (
                      <Chip size="small" color="warning" label={`High: ${projectAnalytics[project._id].highPriorityTasks}`} />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarToday sx={{ fontSize: 16, color: 'grey.500' }} />
                    <Typography variant="caption" color="grey.500">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        // Empty State
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 12,
            bgcolor: 'grey.50',
            borderRadius: 3,
            border: '2px dashed',
            borderColor: 'grey.300'
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3
            }}
          >
            <Add sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography variant="h5" fontWeight="600" gutterBottom color="grey.700">
            No projects yet
          </Typography>
          <Typography variant="body1" color="grey.600" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
            Create your first project to get started with organizing your tasks and collaborating with your team.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 600,
              boxShadow: '0 10px 25px -5px rgb(99 102 241 / 0.5)',
            }}
          >
            CREATE PROJECT
          </Button>
        </Box>
      )}

      {/* Create Project Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <Box component="form" onSubmit={createProject} p={3}>
          <Typography variant="h5" fontWeight="600" gutterBottom>
            Create New Project
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start a new project to organize your tasks and collaborate with your team.
          </Typography>
          
          <TextField
            fullWidth
            label="Project Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
            placeholder="Describe your project goals, objectives, and team..."
          />
          <Box mt={4} display="flex" gap={2} justifyContent="flex-end">
            <Button 
              onClick={() => setOpen(false)}
              sx={{ 
                px: 3,
                borderRadius: 2
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{ 
                px: 3,
                borderRadius: 2
              }}
            >
              Create Project
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default ProjectList;