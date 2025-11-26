import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';
import User from './User.js';
import Poll from './Poll.js';
import PollOption from './PollOption.js';

export interface VoteAttributes {
  id: string;
  userId: string;
  pollOptionId: string;
  pollId: string;
  rewardAmount: number;
  createdAt?: Date;
}

export interface VoteCreationAttributes extends Optional<VoteAttributes, 'id'> {}

class Vote extends Model<VoteAttributes, VoteCreationAttributes> implements VoteAttributes {
  public id!: string;
  public userId!: string;
  public pollOptionId!: string;
  public pollId!: string;
  public rewardAmount!: number;
  public readonly createdAt!: Date;
  
  public readonly poll?: Poll;
  public readonly pollOption?: PollOption;
}

Vote.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      field: 'user_id',
    },
    pollOptionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'poll_options',
        key: 'id',
      },
      onDelete: 'CASCADE',
      field: 'poll_option_id',
    },
    pollId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'polls',
        key: 'id',
      },
      onDelete: 'CASCADE',
      field: 'poll_id',
    },
    rewardAmount: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      validate: {
        min: 0,
      },
      field: 'reward_amount',
    },
  },
  {
    sequelize,
    modelName: 'Vote',
    tableName: 'votes',
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'poll_id'],
      },
    ],
  }
);

export default Vote;
