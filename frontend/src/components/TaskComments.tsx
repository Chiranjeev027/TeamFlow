// teamflow/frontend/src/components/TaskComments.tsx
import React, { useState } from 'react';
import { Box, TextField, Button, Avatar, Typography, Paper } from '@mui/material';
import { Send } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface Comment {
  id: string;
  content: string;
  user: { name: string; email: string };
  createdAt: string;
}

interface TaskCommentsProps {
  taskId: string;
}

const TaskComments: React.FC<TaskCommentsProps> = ({ taskId: _taskId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();

  const addComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      user: { name: user?.name || '', email: user?.email || '' },
      createdAt: new Date().toISOString()
    };
    
    setComments([comment, ...comments]);
    setNewComment('');
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600 }}>
        Comments ({comments.length})
      </Typography>

      {/* Add Comment */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Avatar sx={{ width: 32, height: 32, mt: 1 }}>
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            variant="outlined"
            size="small"
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button
              variant="contained"
              endIcon={<Send />}
              onClick={addComment}
              disabled={!newComment.trim()}
              size="small"
            >
              Comment
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Comments List */}
      {comments.map((comment) => (
        <Paper key={comment.id} sx={{ p: 2, mb: 1 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {comment.user.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle2" fontWeight="600">
                  {comment.user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(comment.createdAt).toLocaleTimeString()}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {comment.content}
              </Typography>
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default TaskComments;