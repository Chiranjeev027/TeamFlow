// teamflow/frontend/src/components/TaskComments.tsx
import React, { useState } from 'react';
import { FiSend } from 'react-icons/fi';
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
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-3">
        Comments ({comments.length})
      </h3>

      {/* Add Comment */}
      <div className="flex gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <textarea
            className="input-field resize-none"
            rows={2}
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={addComment}
              disabled={!newComment.trim()}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Comment
              <FiSend className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="card p-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {comment.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-sm">{comment.user.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(comment.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskComments;