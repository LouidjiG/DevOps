import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../../.env');
console.log(`Chargement du fichier .env depuis: ${envPath}`);
dotenv.config({ path: envPath });

console.log('Variables d\'environnement chargées:');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);

const requiredEnvVars = [
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'DB_NAME',
  'DB_USER',
  'DB_HOST',
  'DB_PORT'
];

for (const envVar of requiredEnvVars) {
  if (process.env[envVar] === undefined) {
    throw new Error(`La variable d'environnement ${envVar} est requise.`);
  }
}

const sequelize = new Sequelize({
  database: process.env.DB_NAME as string,
  username: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST as string,
  port: parseInt(process.env.DB_PORT as string, 10),
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  benchmark: process.env.NODE_ENV === 'development',
  dialectOptions: process.env.DB_SSL === 'true' ? {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  } : {},
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

if (process.env.NODE_ENV !== 'test') {
  testConnection();
}

export { sequelize, testConnection };

export default {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
  },
  test: {
    username: process.env.TEST_DB_USER || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'postgres',
    database: process.env.TEST_DB_NAME || 'vote2earn_test',
    host: process.env.TEST_DB_HOST || 'localhost',
    port: parseInt(process.env.TEST_DB_PORT || '5432', 10),
    dialect: 'postgres',
  },
  production: {
    username: process.env.PROD_DB_USER || process.env.DB_USER,
    password: process.env.PROD_DB_PASSWORD || process.env.DB_PASSWORD,
    database: process.env.PROD_DB_NAME || process.env.DB_NAME,
    host: process.env.PROD_DB_HOST || process.env.DB_HOST,
    port: parseInt(process.env.PROD_DB_PORT || process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    dialectOptions: process.env.DB_SSL === 'true' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    } : {},
  },
};
