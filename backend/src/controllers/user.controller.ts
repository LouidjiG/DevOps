import { Request, Response } from 'express';
import User from '../models/User.js';

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    await user.destroy();
    
    res.status(200).json({ 
      success: true, 
      message: 'Utilisateur supprimé avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur :', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la suppression de l\'utilisateur',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};
