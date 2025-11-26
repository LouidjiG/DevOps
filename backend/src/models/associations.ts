import { sequelize } from '../config/database.js';
import User from './User.js';
import Poll from './Poll.js';
import PollOption from './PollOption.js';
import Vote from './Vote.js';

const defineAssociations = () => {
  User.hasMany(Poll, {
    foreignKey: 'userId',
    as: 'polls'
  });
  
  Poll.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  Poll.hasMany(PollOption, {
    foreignKey: 'pollId',
    as: 'options',
    onDelete: 'CASCADE',
    hooks: true
  });

  PollOption.belongsTo(Poll, {
    foreignKey: 'pollId',
    as: 'poll'
  });

  User.belongsToMany(PollOption, {
    through: Vote,
    foreignKey: 'userId',
    otherKey: 'optionId',
    as: 'votedOptions'
  });

  PollOption.belongsToMany(User, {
    through: Vote,
    foreignKey: 'optionId',
    otherKey: 'userId',
    as: 'voters'
  });

  Vote.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  Vote.belongsTo(PollOption, {
    foreignKey: 'optionId',
    as: 'option'
  });

  PollOption.hasMany(Vote, {
    foreignKey: 'optionId',
    as: 'votes'
  });

  User.hasMany(Vote, {
    foreignKey: 'userId',
    as: 'votes'
  });
};

export default defineAssociations;
