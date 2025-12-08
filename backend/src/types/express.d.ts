// Type definitions for custom Express Request properties
import { Request as ExpressRequest } from 'express';
import { Document } from 'mongoose';

// User interface matching the database model
interface UserData {
    _id: any;
    name: string;
    email: string;
    role?: string;
}

export interface AuthRequest extends ExpressRequest {
    user?: Document & UserData;
    headers: any;
    params: any;
    query: any;
    body: any;
}
