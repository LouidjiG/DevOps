import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { UserRole } from '../models/User.js';
import { protect } from '../middleware/auth.middleware.js';
import { logout } from '../controllers/auth.controller.js';

const router = Router();

router.post('/logout', protect, logout);

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function createToken(userId: string, role: string): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' } as jwt.SignOptions,
  );
}

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ message: "Le nom d'utilisateur doit contenir au moins 3 caractères" });
    }

    if (!email || typeof email !== 'string' || !validateEmail(email)) {
      return res.status(400).json({ message: 'Veuillez fournir un email valide' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }

    const hashedPassword = await User.hashPassword(password);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: UserRole.USER,
      balance: 0,
    });

    const plainUser = user.toJSON() as any;
    const token = createToken(plainUser.id, plainUser.role);

    return res.status(201).json({
      user: {
        id: plainUser.id,
        username: plainUser.username,
        email: plainUser.email,
        role: plainUser.role,
        balance: plainUser.balance,
      },
      token,
    });
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error);
    return res.status(500).json({
      message: "Erreur lors de l'inscription",
      error: error.message,
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !validateEmail(email)) {
      return res.status(400).json({ message: 'Veuillez fournir un email valide' });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: 'Le mot de passe est requis' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const userPassword = user.getDataValue('password');
    if (!userPassword) {
      return res.status(500).json({ message: "Erreur d'authentification" });
    }

    const isPasswordValid = await bcrypt.compare(password, userPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const plainUser = user.toJSON() as any;
    const token = createToken(plainUser.id, plainUser.role);

    return res.status(200).json({
      user: {
        id: plainUser.id,
        username: plainUser.username,
        email: plainUser.email,
        role: plainUser.role,
        balance: plainUser.balance,
      },
      token,
    });
  } catch (error: any) {
    console.error('Erreur lors de la connexion:', error);
    return res.status(500).json({
      message: 'Erreur lors de la connexion',
      error: error.message,
    });
  }
});

router.get('/me', protect, (req, res) => {
  const user = (req as any).user;

  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  return res.status(200).json(user);
});

export const authRoutes = router;
