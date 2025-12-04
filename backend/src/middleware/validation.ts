import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateRegistration = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const validateProject = [
  body('name').notEmpty().withMessage('Project name is required'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
];

export const validateTask = [
  body('title').notEmpty().withMessage('Task title is required'),
  body('project').isMongoId().withMessage('Valid project ID is required'),
  body('status').isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
  body('priority').isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }
  next();
};
