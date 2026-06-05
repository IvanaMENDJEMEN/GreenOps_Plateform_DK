import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false); // Permet d'alterner entre Login et Register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    try {
      if (isRegister) {
        // --- CAS ACTION INSCRIPTION ---
        const response = await axios.post('http://localhost/auth/register', { email, password });
        setSuccess('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
        setIsRegister(false); // On bascule automatiquement sur l'écran de connexion
        setPassword('');
      } else {
        // --- CAS ACTION CONNEXION ---
        const response = await axios.post('http://localhost/auth/login', { email, password });
        const token = response.data.access_token;
        
        // On transmet le jeton JWT au composant parent (App.jsx)
        onLoginSuccess(token);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Erreur de connexion avec l'API Gateway.");
      }
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <h1 className="auth-title">🟢 GreenOps Platform</h1>
        <p className="auth-subtitle">
          {isRegister ? 'Créer un compte opérateur' : 'Authentification requise'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label>Adresse Email</label>
            <input 
              type="email" 
              placeholder="votre_nom@f2i.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="auth-button">
            {isRegister ? "S'inscrire" : "Se connecter"}
          </button>
        </form>

        <div className="auth-toggle">
          {isRegister ? (
            <span>Déjà un compte ? <button onClick={() => { setIsRegister(false); setError(''); }}>Se connecter</button></span>
          ) : (
            <span>Nouveau sur la plateforme ? <button onClick={() => { setIsRegister(true); setError(''); }}>Créer un compte</button></span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;