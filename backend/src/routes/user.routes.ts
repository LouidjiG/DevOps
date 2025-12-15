import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { Vote, Poll, PollOption } from '../models/index.js';

const router = Router();

router.get('/my-votes', protect, async (req: Request, res: Response) => {
  try {
    const votes = await Vote.findAll({
      where: { userId: req.user?.id },
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
      order: [['createdAt', 'DESC']]
    });

    const formattedVotes = votes.map(vote => {
      const voteWithAssociations = vote as Vote & {
        poll: Poll;
        pollOption: PollOption;
      };

      return {
        id: vote.id,
        question: voteWithAssociations.poll?.question || 'Unknown Poll',
        optionText: voteWithAssociations.pollOption?.text || 'Unknown Option',
        votedAt: vote.createdAt,
        reward: vote.rewardAmount
      };
    });

    res.json({ status: 'success', data: formattedVotes });
  } catch (error) {
    console.error('Error fetching user votes:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch user votes' });
  }
});

export { router as userRoutes };

export default router;