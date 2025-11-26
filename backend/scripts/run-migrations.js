import { fileURLToPath } from 'url';
import path from 'path';
import { readdir } from 'fs/promises';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize(
  process.env.DB_NAME || 'vote2earn',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: console.log,
  }
);

async function runMigrations() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie avec succès.');

    const migrationsPath = path.join(__dirname, '../src/migrations');
    const migrationFiles = (await readdir(migrationsPath))
      .filter(file => file.endsWith('.js') && file !== 'index.js')
      .sort();

    for (const file of migrationFiles) {
      try {
        console.log(`Exécution de la migration: ${file}`);
        const filePath = path.join(migrationsPath, file);
        const fileUrl = new URL(`file://${filePath}`).href;
        
        const module = await import(fileUrl);
        
        if (typeof module.up === 'function') {
          await module.up(sequelize.getQueryInterface(), Sequelize);
          console.log(`Migration ${file} terminée avec succès.`);
        } else {
          console.warn(`La migration ${file} n'exporte pas de fonction 'up'.`);
        }
      } catch (error) {
        console.error(`Erreur lors de l'exécution de la migration ${file}:`, error);
        throw error;
      }
    }

    console.log('Toutes les migrations ont été exécutées avec succès !');
  } catch (error) {
    console.error('Erreur lors de l\'exécution des migrations:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runMigrations();
