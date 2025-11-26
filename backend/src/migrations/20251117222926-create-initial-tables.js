'use strict';

/** @type {import('sequelize-cli').Migration} */

export const up = async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('user', 'admin'),
        defaultValue: 'user',
      },
      balance: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.createTable('polls', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      question: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      budget: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      endsAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.createTable('poll_options', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      text: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      voteCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      rewardPerVote: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
      },
      pollId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'polls',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.createTable('votes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      pollOptionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'poll_options',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      pollId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'polls',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      rewardAmount: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('votes', ['userId', 'pollId'], {
      unique: true,
      name: 'votes_user_poll_unique',
    });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('votes');
  await queryInterface.dropTable('poll_options');
  await queryInterface.dropTable('polls');
  await queryInterface.dropTable('users');
};
