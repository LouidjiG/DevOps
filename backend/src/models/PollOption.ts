import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';
import Poll from './Poll.js';

export interface PollOptionAttributes {
  id: string;
  text: string;
  pollId: string;
  voteCount: number;
  rewardPerVote: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PollOptionCreationAttributes extends Optional<PollOptionAttributes, 'id' | 'voteCount'> {
  pollId: string;
}

class PollOption extends Model<PollOptionAttributes, PollOptionCreationAttributes> implements PollOptionAttributes {
  declare id: string;
  declare text: string;
  declare pollId: string;
  declare voteCount: number;
  declare rewardPerVote: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

PollOption.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255],
      },
    },
    voteCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    rewardPerVote: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      validate: {
        min: 0.0001,
      },
    },
    pollId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'polls',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'PollOption',
    tableName: 'poll_options',
    timestamps: true,
  }
);

export default PollOption;
