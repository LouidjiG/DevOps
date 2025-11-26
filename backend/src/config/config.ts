export const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_tres_secret';
export const NODE_ENV = process.env.NODE_ENV || 'development';

export const DB_CONFIG = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'vote2earn',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  dialect: 'postgres',
  logging: NODE_ENV === 'development' ? console.log : false,
};

export const API_CONFIG = {
  port: parseInt(process.env.PORT || '5000', 10),
  baseUrl: process.env.BASE_URL || 'http://localhost:5000',
};

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};
