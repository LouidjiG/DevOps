import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcryptjs';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  VENDOR = 'vendor'
}

interface UserAttributes {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role' | 'balance' | 'createdAt' | 'updatedAt'> { }

class User extends Model<UserAttributes, UserCreationAttributes> {
  public getId(): string {
    return this.getDataValue('id');
  }

  public getPassword(): string {
    return this.getDataValue('password');
  }

  public async setPassword(password: string): Promise<void> {
    const hashedPassword = await User.hashPassword(password);
    this.setDataValue('password', hashedPassword);
  }

  public static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  public async comparePassword(candidatePassword: string): Promise<boolean> {
    try {
      console.log('=== comparePassword ===');
      console.log('Candidate password:', candidatePassword);

      const storedPassword = this.getPassword();
      console.log('Stored password from getter:', storedPassword);

      if (!candidatePassword) {
        console.error('Aucun mot de passe fourni pour la comparaison');
        return false;
      }

      if (!storedPassword) {
        console.error('Aucun mot de passe stocké pour cet utilisateur');
        return false;
      }

      const isMatch = await bcrypt.compare(candidatePassword, storedPassword);
      console.log('Passwords match:', isMatch);
      return isMatch;

    } catch (error) {
      console.error('Erreur lors de la comparaison des mots de passe:', error);
      return false;
    }
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100],
      },
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      defaultValue: UserRole.USER,
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: {
        min: 0,
      },
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
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true
  }
);

export default User;
