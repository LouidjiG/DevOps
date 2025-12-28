import { sequelize } from '../src/config/database.js';
import Poll from '../src/models/Poll.js';
import PollOption from '../src/models/PollOption.js';
import User from '../src/models/User.js';

const MOOOS_DATA = {
    adjectives: ['Incroyable', 'Futuriste', 'Complexe', 'Simple', 'Rapide', 'Lent', 'Génial', 'Mauvais', 'Étrange', 'Populaire', 'Innovant', 'Dépassé'],
    topics: ['Intelligence Artificielle', 'Blockchain', 'Cloud Computing', 'Web 3.0', 'Metaverse', 'No-Code', 'Cybersécurité', 'DevOps', 'IoT', 'Big Data', 'Machine Learning', 'Réalité Virtuelle'],
    actions: ['développer', 'apprendre', 'tester', 'déployer', 'sécuriser', 'analyser', 'optimiser', 'gérer', 'financer', 'vendre'],
    optionsList: [
        ['Oui', 'Non', 'Peut-être'],
        ['J\'adore', 'Je déteste', 'Indifférent'],
        ['Tout à fait d\'accord', 'Plutôt d\'accord', 'Plutôt pas d\'accord', 'Pas du tout d\'accord'],
        ['Très important', 'Important', 'Peu important', 'Pas important'],
        ['Quotidiennement', 'Hebdomadairement', 'Mensuellement', 'Jamais'],
        ['Rouge', 'Bleu', 'Vert', 'Jaune'],
        ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
        ['Matin', 'Après-midi', 'Soir', 'Nuit']
    ]
};

const getRandomElement = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

const generatePolls = (count: number) => {
    const polls = [];
    for (let i = 0; i < count; i++) {
        const topic = getRandomElement(MOOOS_DATA.topics);
        const adj = getRandomElement(MOOOS_DATA.adjectives);
        const action = getRandomElement(MOOOS_DATA.actions);

        const questionTemplates = [
            `Que pensez-vous de l'${topic} ?`,
            `Est-ce que ${topic} est vraiment ${adj} ?`,
            `Préférez-vous ${action} avec ${topic} ?`,
            `Quel est l'impact de ${topic} sur votre travail ?`,
            `L'avenir de ${topic} est-il ${adj} ?`
        ];

        polls.push({
            question: getRandomElement(questionTemplates) + ` #${i + 1}`,
            description: `Un sondage pour savoir si ${topic} est ${adj}.`,
            budget: Math.floor(Math.random() * 5000) + 100,
            reward: Math.floor(Math.random() * 50) + 1,
            options: getRandomElement(MOOOS_DATA.optionsList)
        });
    }
    return polls;
};

const addPolls = async () => {
    try {
        console.log('Connexion à la base de données...');
        await sequelize.authenticate();
        console.log('✅ Connecté.');

        const admin = await User.findOne({ where: { email: 'admin@example.com' } });
        if (!admin) {
            console.error('❌ Admin non trouvé (email: admin@example.com). Créez d\'abord un admin.');
            return;
        }

        const adminId = admin.getDataValue('id');
        console.log(`👤 Auteur des sondages: ${admin.getDataValue('username')} (${adminId})`);

        const pollsData = generatePolls(100);

        console.log(`🚀 Génération de ${pollsData.length} sondages...`);

        for (let i = 0; i < pollsData.length; i++) {
            const p = pollsData[i];

            if (i % 10 === 0) console.log(`Traitement sondage ${i + 1}/${pollsData.length}...`);

            const poll = await Poll.create({
                question: p.question,
                description: p.description,
                budget: p.budget,
                reward: p.reward,
                userId: adminId,
                isActive: true,
                endsAt: new Date(Date.now() + (Math.random() * 60 + 1) * 24 * 60 * 60 * 1000)
            });

            const pollId = poll.getDataValue('id');
            const rewardPerOption = (p.reward / 10).toFixed(2);

            for (const optText of p.options) {
                await PollOption.create({
                    text: optText,
                    pollId: pollId,
                    rewardPerVote: parseFloat(rewardPerOption)
                });
            }
        }

        console.log('\n✅ 100 sondages ont été créés avec succès !');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await sequelize.close();
        process.exit();
    }
};

addPolls();
