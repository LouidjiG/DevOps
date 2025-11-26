import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { UserRole } from '../models/User.js';
import { JWT_SECRET } from '../config/config.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role?: string;
      };
    }
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Un utilisateur avec cet email existe déjà.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: UserRole.USER,
      balance: 0
    });

    const token = jwt.sign(
      { id: user.getDataValue('id'), role: user.getDataValue('role') },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userResponse = user.get({ plain: true });
    delete (userResponse as any).password;

    res.status(201).json({
      status: 'success',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue lors de l\'inscription.'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Email ou mot de passe incorrect.'
      });
    }

    const userPassword = user.getDataValue('password');
    const isMatch = await bcrypt.compare(password, userPassword);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Identifiants invalides.'
      });
    }

    const token = jwt.sign(
      { 
        id: user.getDataValue('id'), 
        role: user.getDataValue('role') 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userResponse = user.get({ plain: true }) as any;
    if (userResponse && userResponse.password) {
      delete userResponse.password;
    }

    res.json({
      status: 'success',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue lors de la connexion.'
    });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Non autorisé. Aucun utilisateur connecté.'
      });
    }

    const userData = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!userData) {
      return res.status(404).json({
        status: 'error',
        message: 'Utilisateur non trouvé.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: userData
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération du profil utilisateur.'
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Déconnexion réussie. Veuillez supprimer le token côté client.'
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la déconnexion.'
    });
  }
};
