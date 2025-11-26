interface AppErrorData {
  errors?: any[];
  [key: string]: any;
}

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  data?: AppErrorData;

  constructor(message: string, statusCode: number, data?: AppErrorData) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.data = data;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const catchAsync = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    fn(req, res, next).catch(next);
  };
};

export const globalErrorHandler = (err: any, req: any, res: any, next: any) => {
  console.error('Erreur serveur:', err);

  res.status(500).json({
    message: 'Erreur serveur',
    error: err?.message || 'Une erreur inattendue est survenue',
  });
};
