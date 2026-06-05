// 1. Importation des modules
const express = require('express');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client'); // Importation du traducteur Prisma

// 2. Configuration
dotenv.config();
const app = express();
const prisma = new PrismaClient(); // Initialisation de Prisma

app.use(express.json()); // Traducteur automatique des requêtes JSON

const PORT = process.env.AUTH_SERVICE_PORT || 8001;
const JWT_SECRET = process.env.JWT_SECRET_KEY || 'ma_cle_secrete_super_longue_et_aleatoire';

// ==========================================
// 1. ROUTE D'INSCRIPTION (Register)
// ==========================================
app.post('/auth/register', async(req, res) => {
    const { email, password } = req.body;

    // Validation simple : on vérifie que l'email et le mot de passe sont fournis
    if (!email || !password) {
        return res.status(400).json({ error: "Veuillez fournir un email et un mot de passe." });
    }

    try {
        // A. On vérifie si l'utilisateur existe déjà dans la base de données
        const userExists = await prisma.user.findUnique({
            where: { email: email }
        });

        if (userExists) {
            return res.status(400).json({ error: "Cet email est déjà utilisé." });
        }

        // B. Sécurité : On hache (crypte) le mot de passe
        // Le chiffre 10 représente le "salt round" (la puissance du cryptage)
        const hashedPassword = await bcrypt.hash(password, 10);

        // C. On enregistre le nouvel utilisateur dans PostgreSQL via Prisma
        const newUser = await prisma.user.create({
            data: {
                email: email,
                passwordHash: hashedPassword
                    // Le rôle sera "user" par défaut comme défini dans notre schéma
            }
        });

        // D. On répond au client avec succès (sans afficher le mot de passe crypté)
        return res.status(201).json({
            message: "Utilisateur créé avec succès !",
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erreur technique lors de l'inscription." });
    }
});

// ==========================================
// 2. ROUTE DE CONNEXION (Login)
// ==========================================
app.post('/auth/login', async(req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Veuillez fournir un email et un mot de passe." });
    }

    try {
        // A. On cherche l'utilisateur dans la base de données par son email
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        // B. Si l'utilisateur n'existe pas
        if (!user) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect." });
        }

        // C. On compare le mot de passe tapé avec le mot de passe crypté en BDD
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect." });
        }

        // D. Si tout est bon, on génère un jeton JWT
        // Ce jeton contient l'ID du user, son email et son rôle, et expire dans 1 heure
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role },
            JWT_SECRET, { expiresIn: '1h' }
        );

        // E. On renvoie le jeton au client
        return res.json({
            message: "Connexion réussie !",
            access_token: token,
            token_type: "bearer"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erreur technique lors de la connexion." });
    }
});

// ==========================================
// 3. EXPOSITION DES METRIQUES (Prometheus)
// ==========================================
app.get('/metrics', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send('auth_service_heartbeat 1.0\n');
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`[auth-service] opérationnel sur le port ${PORT}`);
});