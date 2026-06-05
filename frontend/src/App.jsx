import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import MetricCard from './components/MetricCard';
import './App.css';

function App() {
  // L'état central de la session utilisateur
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fonction appelée par le composant Login.jsx en cas de succès
  const handleLoginSuccess = (receivedToken) => {
    localStorage.setItem('token', receivedToken); // Sauvegarde locale pour éviter de se reconnecter en actualisant
    setToken(receivedToken);
  };

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setMetrics([]);
  };

  // Charger les métriques uniquement si l'utilisateur est authentifié (a un token)
  useEffect(() => {
    if (!token) return;

    setLoading(true);
    
    // Bonne pratique : On passe le jeton JWT dans les en-têtes HTTP de sécurité
    axios.get('http://localhost/metrics/history/serveur-prod-01', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => {
        setMetrics(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des données", error);
        // Si le token est expiré ou invalide, on déconnecte de force l'utilisateur
        if (error.response && error.response.status === 401) {
          handleLogout();
        }
        setLoading(false);
      });
  }, [token]); // Le useEffect s'exécute à chaque fois que le statut du "token" change

  // --- CONDITION AFFICHAGE : SI PAS DE TOKEN, ON RESTE SUR LE LOGIN ---
  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // --- CAS SÉCURISÉ : ON ACCÈDE AU DASHBOARD ---
  return (
    <div className="app-container">
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="app-title">🟢 GreenOps Platform</h1>
          <p className="app-subtitle">Dashboard d'éco-efficience de l'infrastructure</p>
        </div>
        <button 
          onClick={handleLogout}
          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Déconnexion
        </button>
      </header>

      {loading ? (
        <div className="loading-text">Chargement sécurisé des données...</div>
      ) : (
        <div className="dashboard-grid">
          
          {/* Composant carte avec la liste des métriques */}
          <MetricCard metricsList={metrics} />

          {/* Deuxième bloc : Statut */}
          <div className="metric-card">
            <h2 className="card-title" style={{ color: '#fca5a5' }}>Statut Alertes</h2>
            <p className="app-subtitle">Surveillance active des canaux Redis.</p>
            <div className="status-badge-ok" style={{ background: '#064e3b', color: '#34d399', padding: '1rem', borderRadius: '4px', textAlign: 'center', marginTop: '1rem', fontWeight: 'bold' }}>
              Système Stable & Optimisé
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default App;