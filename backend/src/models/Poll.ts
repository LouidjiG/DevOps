import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';
import User from './User.js';
import PollOption from './PollOption.js';
import Vote from './Vote.js';

export interface PollAttributes {
  id: string;
  question: string;
  description: string | null;
  budget: number;
  reward: number;
  isActive: boolean;
  endsAt: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PollCreationAttributes extends Optional<PollAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> { }

class Poll extends Model<PollAttributes, PollCreationAttributes> implements PollAttributes {
  declare id: string;
  declare question: string;
  declare description: string | null;
  declare budget: number;
  declare reward: number;
  declare isActive: boolean;
  declare endsAt: Date;
  declare userId: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  public async isActivePoll(): Promise<boolean> {
    return this.getDataValue('isActive') && new Date() < new Date(this.getDataValue('endsAt'));
  }

  public async getTotalVotes(): Promise<number> {
    const options = await PollOption.findAll({
      where: { pollId: this.getDataValue('id') },
      include: [{
        model: Vote,
        attributes: [],
      }],
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('votes.id')), 'voteCount']
      ],
      group: ['PollOption.id'],
      raw: true,
    });

    return options.reduce((total, option) => {
      const voteCount = option.get('voteCount');
      return total + (typeof voteCount === 'string' ? parseInt(voteCount, 10) : (voteCount || 0));
    }, 0);
  }
}

Poll.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    question: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [5, 255],
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
        isNumeric: true,
      },
    },
    reward: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      validate: {
        min: 0,
        isNumeric: true,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    endsAt: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        isAfter: new Date().toISOString(),
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Poll',
    tableName: 'polls',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (poll: Poll) => {
        if (new Date(poll.endsAt) <= new Date()) {
          throw new Error('La date de fin doit être dans le futur');
        }
      },
      beforeUpdate: async (poll: Poll) => {
        if (poll.changed('endsAt') && new Date(poll.endsAt) <= new Date()) {
          throw new Error('La date de fin doit être dans le futur');
        }
      },
    },
  }
);

export default Poll;
