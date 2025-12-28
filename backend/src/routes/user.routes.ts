import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { Vote, Poll, PollOption } from '../models/index.js';

const router = Router();

router.get('/my-votes', protect, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'User not authenticated' });
    }

    const { limit = 10, offset = 0 } = req.query;

    const votes = await Vote.findAndCountAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Poll,
          attributes: ['id', 'question'],
        },
        {
          model: PollOption,
          attributes: ['text']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: Number(offset)
    });

    const formattedVotes = votes.rows.map(vote => {
      const votePlain = vote.get({ plain: true }) as any;

      return {
        id: vote.id,
        question: voteWithAssociations.poll?.question || 'Unknown Poll',
        optionText: voteWithAssociations.pollOption?.text || 'Unknown Option',
        votedAt: vote.createdAt,
        reward: vote.rewardAmount
      };
    });

    res.json({
      status: 'success',
      data: formattedVotes,
      meta: {
        total: votes.count,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching user votes:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch user votes' });
  }
});

router.get('/', protect, async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Access denied. Admin only.' });
    }

    const { limit = 20, offset = 0, search } = req.query;
    const whereCondition: any = {};

    if (search) {
      whereCondition.username = { [Op.iLike]: `%${search}%` };
    }

    const users = await User.findAndCountAll({
      where: whereCondition,
      attributes: { exclude: ['password'] },
      limit: Number(limit),
      offset: Number(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: users.rows,
      meta: {
        total: users.count,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch users' });
  }
});

router.get('/stats', protect, async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Access denied. Admin only.' });
    }

    const [userCount, pollCount, voteCount, balanceSum] = await Promise.all([
      User.count(),
      Poll.count(),
      Vote.count(),
      User.sum('balance')
    ]);

    res.json({
      status: 'success',
      data: {
        users: userCount,
        polls: pollCount,
        votes: voteCount,
        totalBalance: balanceSum || 0
      }
    });

  } catch (error) {
    console.error('Error fetching global stats:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch stats' });
  }
});

export { router as userRoutes };

export default router;