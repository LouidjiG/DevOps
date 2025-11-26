import { sequelize } from '../config/database.js';
import User from './User.js';
import Poll from './Poll.js';
import PollOption from './PollOption.js';
import Vote from './Vote.js';

const setupAssociations = () => {
  User.hasMany(Poll, {
    foreignKey: 'userId',
    as: 'polls',
    onDelete: 'CASCADE',
  });
  Poll.belongsTo(User, {
    foreignKey: 'userId',
    as: 'creator',
  });

  Poll.hasMany(PollOption, {
    foreignKey: 'pollId',
    as: 'pollOptions',
    onDelete: 'CASCADE',
  });
  PollOption.belongsTo(Poll, {
    foreignKey: 'pollId',
    as: 'parentPoll',
  });
  Poll.hasMany(Vote, {
    foreignKey: 'pollId',
    as: 'votes'
  });

  Vote.belongsTo(Poll, {
    foreignKey: 'pollId',
    as: 'poll'
  });

  User.hasMany(Vote, {
    foreignKey: 'userId',
    as: 'votes',
    onDelete: 'CASCADE',
  });
  Vote.belongsTo(User, {
    foreignKey: 'userId',
    as: 'voter',
  });

  PollOption.hasMany(Vote, {
    foreignKey: 'pollOptionId',
    as: 'votes',
    onDelete: 'CASCADE',
  });
  Vote.belongsTo(PollOption, {
    foreignKey: 'pollOptionId',
    as: 'option',
  });
};

const initModels = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Modèles synchronisés avec la base de données');
  } catch (error) {
    console.error('Erreur lors de la synchronisation des modèles:', error);
    throw error;
  }
};

export {
  User,
  Poll,
  PollOption,
  Vote,
  sequelize,
  setupAssociations,
  initModels,
};

export default {
  User,
  Poll,
  PollOption,
  Vote,
  sequelize,
  setupAssociations,
  initModels,
};
