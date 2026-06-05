const express = require('express');
const dotenv = require('dotenv');
const Redis = require('ioredis');
const { PrismaClient } = require('@prisma/client');

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
const PORT = process.env.ALERTS_SERVICE_PORT || 8003;

// -------------------------------------------------------------
// EN COULISSES : ÉCOUTE EN TEMPS RÉEL VIA REDIS (SUBSCRIBE)
// -------------------------------------------------------------
// On crée un client Redis dédié uniquement à l'écoute des messages
const redisSubscriber = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
});

// On s'abonne au canal "energy-metrics" ouvert par le metrics-service
redisSubscriber.subscribe('energy-metrics', (err, count) => {
    if (err) console.error("Échec de l'abonnement Redis", err);
    else console.log(`[alerts-service] Abonné avec succès au canal Redis (Total abonnements: ${count})`);
});

// Cette fonction s'exécute AUTOMATIQUEMENT dès qu'un message arrive dans Redis
redisSubscriber.on('message', async(channel, message) => {
    if (channel === 'energy-metrics') {
        // On traduit le texte reçu en objet JavaScript
        const metricData = JSON.parse(message);
        const { resourceId, metricType, value } = metricData;

        try {
            // 1. On cherche en BDD si un seuil existe pour ce type de métrique
            const threshold = await prisma.threshold.findUnique({
                where: { metricType: metricType }
            });

            // 2. Si un seuil existe et que la valeur reçue dépasse la limite
            if (threshold && value > threshold.maxLimit) {
                console.log(`⚠️ ALERTE : ${resourceId} consomme ${value}W (Limite: ${threshold.maxLimit}W)`);

                // 3. On enregistre l'alerte dans PostgreSQL
                await prisma.alert.create({
                    data: {
                        resourceId,
                        metricType,
                        value: parseFloat(value),
                        thresholdVal: threshold.maxLimit,
                        status: "TRIGGERED"
                    }
                });
            }
        } catch (error) {
            console.error("Erreur lors de la vérification du seuil :", error);
        }
    }
});

// -------------------------------------------------------------
// ROUTES DE L'API REST (Pour l'interface React)
// -------------------------------------------------------------

// Route pour configurer ou modifier un seuil de surveillance
app.post('/alerts/thresholds', async(req, res) => {
    const { metricType, maxLimit } = req.body;
    try {
        // On crée ou on met à jour si ça existe déjà (Upsert)
        const threshold = await prisma.Threshold.upsert({
            where: { metricType },
            update: { maxLimit: parseFloat(maxLimit) },
            create: { metricType, maxLimit: parseFloat(maxLimit) }
        });
        return res.json({ message: "Seuil mis à jour !", threshold });
    } catch (error) {
        return res.status(500).json({ error: "Erreur lors de la configuration du seuil." });
    }
});

// Route pour lister toutes les alertes déclenchées
app.get('/alerts', async(req, res) => {
    try {
        const alerts = await prisma.Alert.findMany({ orderBy: { triggeredAt: 'desc' } });
        return res.json(alerts);
    } catch (error) {
        return res.status(500).json({ error: "Erreur lors de la récupération des alertes." });
    }
});

// Endpoint obligatoire pour la supervision Prometheus
app.get('/metrics', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send('alerts_service_heartbeat 1.0\n');
});

app.listen(PORT, () => {
    console.log(`[alerts-service] opérationnel sur le port ${PORT}`);
});