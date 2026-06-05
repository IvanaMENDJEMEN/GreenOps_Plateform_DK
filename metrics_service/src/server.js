// 1. Importation des outils nécessaires
const express = require('express');
const dotenv = require('dotenv');
const Redis = require('ioredis'); // L'outil pour parler à Redis
const { PrismaClient } = require('@prisma/client'); // L'outil pour parler à PostgreSQL

// 2. Configuration initiale
dotenv.config();
const app = express();
const prisma = new PrismaClient();

// Connexion à Redis (il utilise le port par défaut 6379)
const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
});

app.use(express.json()); // Traducteur de requêtes JSON

const PORT = process.env.METRICS_SERVICE_PORT || 8002;

// ==========================================
// ROUTE DE RECEPTION DES METRIQUES (Collector)
// ==========================================
// C'est cette adresse que les scripts et serveurs surveillés vont appeler
app.post('/metrics/collector', async(req, res) => {
    const { resourceId, metricType, value } = req.body;

    // Validation : on s'assure que toutes les données obligatoires sont présentes
    if (!resourceId || !metricType || value === undefined) {
        return res.status(400).json({ error: "Données incomplètes (resourceId, metricType, value requis)." });
    }

    try {
        // ACTION 1 : Enregistrer la métrique dans PostgreSQL pour l'historique à long terme
        const newMetric = await prisma.metric.create({
            data: {
                resourceId,
                metricType,
                value: parseFloat(value)
            }
        });

        // ACTION 2 : Publier la métrique en temps réel dans Redis
        // On envoie un message texte (JSON) dans un "canal" appelé "energy-metrics"
        const payload = {
            resourceId,
            metricType,
            value,
            timestamp: newMetric.timestamp
        };

        // Le système Pub/Sub de Redis diffuse l'information instantanément
        await redisClient.publish('energy-metrics', JSON.stringify(payload));

        // On répond positivement au collecteur
        return res.status(201).json({
            message: "Métrique enregistrée et propagée avec succès !",
            metric: newMetric
        });

    } catch (error) {
        console.error("Erreur metrics-service:", error);
        return res.status(500).json({ error: "Erreur technique lors de l'enregistrement." });
    }
});

// ==========================================
// ROUTE DE LECTURE : Historique des données
// ==========================================
// Permettra au frontend React d'afficher les graphiques historiques
app.get('/metrics/history/:resourceId', async(req, res) => {
    const { resourceId } = req.params;

    try {
        // On récupère les 100 derniers relevés pour ce serveur précis, du plus récent au plus ancien
        const history = await prisma.metric.findMany({
            where: { resourceId: resourceId },
            orderBy: { timestamp: 'desc' },
            take: 100
        });

        return res.json(history);
    } catch (error) {
        return res.status(500).json({ error: "Erreur lors de la récupération de l'historique." });
    }
});

// Endpoint obligatoire pour la supervision Prometheus
app.get('/metrics', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send('metrics_service_heartbeat 1.0\n');
});

app.listen(PORT, () => {
    console.log(`[metrics-service] opérationnel sur le port ${PORT}`);
});