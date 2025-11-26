import { sequelize } from '../src/config/database.js';
import User, { UserRole } from '../src/models/User.js';
import bcrypt from 'bcryptjs';

const createAdmin = async () => {
  try {
    console.log('Tentative de connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');

    console.log('Synchronisation des modèles...');
    await sequelize.sync({ force: false });
    console.log('✅ Modèles synchronisés.');

    console.log('Vérification de l\'existence de l\'admin...');
    const adminExists = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (adminExists) {
      console.log('ℹ️ Un administrateur existe déjà avec cet email:');
      console.log('ID:', adminExists.getDataValue('id'));
      console.log('Pour le réinitialiser, supprimez-le de la base de données et réessayez.');
      return;
    }

    console.log('Création du nouvel administrateur...');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      balance: 0,
      password: hashedPassword
    });

    console.log('✅ Administrateur créé avec succès:');
    console.log('Email: admin@example.com');
    console.log('Mot de passe: admin123');
    console.log('\n⚠️ IMPORTANT: Changez ce mot de passe après la première connexion!');
    
    const createdUser = await User.findOne({
      where: { email: 'admin@example.com' },
      attributes: { include: ['password'] }
    });
    
    if (createdUser) {
      console.log('\n🔍 Détails de l\'utilisateur créé:');
      console.log('ID:', createdUser.getDataValue('id'));
      console.log('Email:', createdUser.getDataValue('email'));
      console.log('Mot de passe (début):', createdUser.getDataValue('password')?.substring(0, 20) + '...');
      console.log('Est haché ?', createdUser.getDataValue('password')?.startsWith('$2a$') || createdUser.getDataValue('password')?.startsWith('$2b$'));
    }

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:');
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

createAdmin();