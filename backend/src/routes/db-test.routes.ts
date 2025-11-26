import { Router } from 'express';
import { sequelize } from '../config/database.js';
import User from '../models/User.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    await sequelize.authenticate();
    const users = await User.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'ok',
      dbConnected: true,
      users,
    });
  } catch (error) {
    console.error('Erreur lors du test de connexion BDD:', error);
    res.status(500).json({
      status: 'error',
      dbConnected: false,
      message: 'Impossible de se connecter à la base de données',
      error: (error as Error).message,
    });
  }
});

export const dbTestRoutes = router;
