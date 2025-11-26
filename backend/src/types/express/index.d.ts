declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export interface AuthenticatedRequest extends Express.Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}
