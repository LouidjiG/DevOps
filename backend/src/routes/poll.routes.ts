import { Request, Response, Router } from 'express';
import { Op, Transaction } from 'sequelize';
import { sequelize } from '../config/database.js';
import { protect } from '../middleware/auth.middleware.js';
import Poll from '../models/Poll.js';
import PollOption from '../models/PollOption.js';
import User from '../models/User.js';
import Vote from '../models/Vote.js';

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

const router = Router();

router.use(protect);

router.post('/', async (req: Request, res: Response) => {
  try {
    const { question, description, options, reward, endsAt } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Utilisateur non authentifié.'
      });
    }

    const user = await User.findByPk(userId);
    if (!user || user.getDataValue('role') !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Seuls les administrateurs peuvent créer des sondages.'
      });
    }

    if (!question || !Array.isArray(options) || options.length < 2 || reward === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Données de sondage invalides. Vérifiez la question, les options et la récompense.'
      });
    }

    const rewardValue = Number(reward);
    if (isNaN(rewardValue) || rewardValue <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'La récompense doit être un nombre positif.'
      });
    }

    const userBalance = user.getDataValue('balance');
    const budgetValue = Number(rewardValue);
    const isAdmin = user.getDataValue('role') === 'admin';

    if (isNaN(budgetValue) || budgetValue <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Le budget doit être un nombre positif.'
      });
    }

    if (!isAdmin && userBalance < budgetValue) {
      return res.status(400).json({
        status: 'error',
        message: 'Solde insuffisant pour créer ce sondage.'
      });
    }

    const result = await sequelize.transaction(async (t: Transaction) => {
      console.log('Début de la transaction de création de sondage');

      console.log('Création du sondage avec les données:', {
        question,
        description: description || null,
        budget: budgetValue,
        reward: rewardValue,
        userId,
        isActive: true,
        endsAt: endsAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      const poll = await Poll.create(
        {
          question: question as string,
          description: description || null,
          budget: budgetValue,
          reward: rewardValue,
          userId: userId as string,
          isActive: true,
          endsAt: endsAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        {
          transaction: t,
          returning: true
        }
      );

      console.log('Sondage créé avec succès. ID du sondage:', poll.id);
      console.log('Données du sondage créé:', poll.toJSON());

      if (!Array.isArray(options)) {
        throw new Error('Les options doivent être un tableau de chaînes de caractères');
      }

      console.log('Création des options du sondage:', options);

      const pollOptions = [];

      const pollId = poll.getDataValue('id');

      if (!pollId) {
        throw new Error('L\'ID du sondage n\'a pas été correctement généré');
      }

      console.log('ID du sondage pour les options (via getDataValue):', pollId);

      for (const text of options) {
        try {
          console.log('Création de l\'option avec le texte:', text);

          const optionData = {
            text: String(text),
            pollId: pollId,
            voteCount: 0,
            rewardPerVote: 0.0001
          };

          console.log('Données de l\'option à créer:', optionData);

          const option = await PollOption.create({
            text: String(text),
            pollId: pollId,
            voteCount: 0,
            rewardPerVote: 0.0001
          }, {
            transaction: t,
            returning: true
          });

          console.log('Option créée avec succès:', option.toJSON());
          pollOptions.push(option);
        } catch (err) {
          console.error('Erreur lors de la création de l\'option:', err);
          throw err;
        }
      }

      return { poll, options: pollOptions };
    });

    res.status(201).json({
      status: 'success',
      data: {
        poll: result.poll,
        options: result.options
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création du sondage:', error);
    res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue lors de la création du sondage.'
    });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const userId = req.user?.id;

    const polls = await Poll.findAndCountAll({
      where: {
        isActive: true,
        endsAt: { [Op.gt]: new Date() }
      },
      include: [
        {
          model: PollOption,
          as: 'pollOptions',
          attributes: ['id', 'text', 'voteCount']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username']
        },
        {
          model: Vote,
          as: 'votes',
          where: { userId },
          required: false,
          attributes: ['id']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: Number(offset)
    });

    const pollsWithVoteStatus = polls.rows.map(poll => {
      const pollData = poll.get({ plain: true }) as any;
      return {
        ...pollData,
        hasVoted: Array.isArray(pollData.votes) && pollData.votes.length > 0
      };
    });

    res.json({
      status: 'success',
      data: pollsWithVoteStatus,
      meta: {
        total: polls.count,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des sondages:', error);
    res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue lors de la récupération des sondages.'
    });
  }
});

router.get('/:pollId', async (req: Request, res: Response) => {
  try {
    const { pollId } = req.params;

    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(pollId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Format d\'ID de sondage invalide. Un UUID est attendu.'
      });
    }

    const poll = await Poll.findByPk(pollId, {
      include: [
        {
          model: PollOption,
          as: 'pollOptions',
          attributes: ['id', 'text', 'voteCount', 'rewardPerVote']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username']
        }
      ]
    });

    if (!poll) {
      return res.status(404).json({
        status: 'error',
        message: 'Sondage non trouvé.'
      });
    }

    res.json({
      status: 'success',
      data: poll
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du sondage:', error);
    res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue lors de la récupération du sondage.'
    });
  }
});

router.post('/:pollId/vote', async (req: Request, res: Response) => {
  try {
    const { pollId } = req.params;
    const { optionId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Utilisateur non authentifié.'
      });
    }

    if (!optionId) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de l\'option manquant.'
      });
    }

    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(optionId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Format d\'ID d\'option invalide. Un UUID est attendu.'
      });
    }

    const poll = await Poll.findOne({
      where: {
        id: pollId,
        isActive: true,
        endsAt: { [Op.gt]: new Date() }
      }
    });

    if (!poll) {
      return res.status(404).json({
        status: 'error',
        message: 'Sondage introuvable ou terminé.'
      });
    }

    const existingVote = await Vote.findOne({
      where: {
        userId,
        pollId
      }
    });

    if (existingVote) {
      return res.status(400).json({
        status: 'error',
        message: 'Vous avez déjà voté à ce sondage.'
      });
    }

    const option = await PollOption.findOne({
      where: {
        id: optionId,
        pollId
      }
    });

    if (!option) {
      return res.status(404).json({
        status: 'error',
        message: 'Option de vote invalide.'
      });
    }

    await sequelize.transaction(async (t: Transaction) => {
      const existingVote = await Vote.findOne({
        where: {
          userId,
          pollId
        },
        transaction: t
      });

      if (existingVote) {
        throw new Error('Vous avez déjà voté à ce sondage.');
      }

      await Vote.create(
        {
          userId,
          pollId,
          pollOptionId: optionId,
          rewardAmount: poll.reward
        },
        { transaction: t }
      );

      await option.increment('voteCount', { by: 1, transaction: t });

      await User.increment('balance', {
        by: poll.reward,
        where: { id: userId },
        transaction: t
      });
    });

    res.json({
      status: 'success',
      message: 'Vote enregistré avec succès.'
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du vote:', error);
    res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue lors de l\'enregistrement de votre vote.'
    });
  }
});

router.post('/admin/add-credit', async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id;
    const { userId, amount } = req.body;

    const admin = await User.findByPk(adminId);
    if (!admin || admin.getDataValue('role') !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Accès refusé. Seuls les administrateurs peuvent effectuer cette action.'
      });
    }

    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'ID utilisateur manquant.'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Utilisateur non trouvé.'
      });
    }

    const creditAmount = Number(amount) || 0;
    if (isNaN(creditAmount) || creditAmount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Le montant doit être un nombre positif.'
      });
    }

    await User.increment('balance', {
      by: creditAmount,
      where: { id: userId }
    });

    const updatedUser = await User.findByPk(userId);

    res.json({
      status: 'success',
      message: `Crédit ajouté avec succès. Nouveau solde: ${updatedUser?.getDataValue('balance')}`,
      balance: updatedUser?.getDataValue('balance')
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de crédit:', error);
    res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue lors de l\'ajout de crédit.'
    });
  }
});

router.get('/created', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { limit = 20, offset = 0 } = req.query;

    const polls = await Poll.findAndCountAll({
      where: { userId },
      include: [
        {
          model: PollOption,
          as: 'pollOptions',
          attributes: ['id', 'text', 'voteCount']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: Number(offset)
    });

    res.json({
      status: 'success',
      data: polls.rows,
      meta: {
        total: polls.count,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de vos sondages:', error);
    res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue lors de la récupération de vos sondages.'
    });
  }
});

export const pollRoutes = router;
