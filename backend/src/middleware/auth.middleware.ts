import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

interface JwtPayload {
  id: string;
  role: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : undefined;

    if (!token) {
      return res.status(401).json({
        message: 'Vous devez être connecté pour accéder à cette ressource',
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return res.status(500).json({ message: 'Configuration JWT manquante' });
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    } catch (error) {
      return res.status(401).json({ message: 'Token invalide ou expiré' });
    }

    const currentUser = await User.findByPk(decoded.id);
    if (!currentUser) {
      return res.status(401).json({ message: "L'utilisateur n'existe plus" });
    }

    (req as any).user = {
      id: currentUser.getDataValue('id'),
      username: currentUser.getDataValue('username'),
      email: currentUser.getDataValue('email'),
      role: currentUser.getDataValue('role'),
      balance: currentUser.getDataValue('balance'),
    };

    next();
  } catch (error) {
    console.error('Erreur dans le middleware protect:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la vérification du token' });
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({
        message: "Vous n'avez pas la permission d'effectuer cette action",
      });
    }

    next();
  };
};
