import React from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Chip,
  Button,
  Box,
  Typography,
  Menu,
  MenuItem
} from '@mui/material';
import {
  MoreVert,
  Wifi,
  WifiOff,
  AdminPanelSettings,
  Engineering,
  Visibility,
  Edit,
  Delete
} from '@mui/icons-material';
import { PersonAdd } from '@mui/icons-material';

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

interface TeamMembersListProps {
  members: TeamMember[];
  onInviteMember: () => void;
}

const TeamMembersList: React.FC<TeamMembersListProps> = ({ members, onInviteMember }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = React.useState<TeamMember | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, member: TeamMember) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <AdminPanelSettings color="primary" />;
      case 'member': return <Engineering color="secondary" />;
      case 'viewer': return <Visibility color="action" />;
      default: return <Engineering />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'primary';
      case 'member': return 'secondary';
      case 'viewer': return 'default';
      default: return 'default';
    }
  };

  const formatLastSeen = (lastSeen: string) => {
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Box>
      {members.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No team members yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start by inviting team members to collaborate on projects.
          </Typography>
          {onInviteMember && (
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" onClick={onInviteMember} startIcon={<PersonAdd />}>
                Invite Member
              </Button>
            </Box>
          )}
        </Box>
      ) : (
        <List>
          {members.map((member) => (
            <ListItem
              key={member._id}
              secondaryAction={
                <IconButton onClick={(e) => handleMenuOpen(e, member)}>
                  <MoreVert />
                </IconButton>
              }
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                mb: 1,
                '&:hover': {
                  backgroundColor: 'action.hover',
                }
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: member.isOnline ? 'success.main' : 'grey.400',
                    border: member.isOnline ? '2px solid' : 'none',
                    borderColor: 'success.light'
                  }}
                >
                  {member.name.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle1" fontWeight="600">
                      {member.name}
                    </Typography>
                    <Chip
                      icon={getRoleIcon(member.role)}
                      label={member.role.toUpperCase()}
                      size="small"
                      color={getRoleColor(member.role)}
                      variant="outlined"
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {member.isOnline ? (
                        <Wifi color="success" fontSize="small" />
                      ) : (
                        <WifiOff color="disabled" fontSize="small" />
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {member.isOnline ? 'Online' : `Last seen ${formatLastSeen(member.lastSeen)}`}
                      </Typography>
                    </Box>
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {member.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {member.projects} projects
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      {member.tasksCompleted} tasks completed
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
          <MenuItem onClick={handleMenuClose}>
            <Edit sx={{ mr: 1 }} />
            Edit Role {selectedMember ? `for ${selectedMember.name}` : ''}
          </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Remove from Team
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TeamMembersList;