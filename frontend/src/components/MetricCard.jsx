import React from 'react';
import './MetricCard.css'; // On importe le CSS dédié à ce composant

function MetricCard({ metricsList }) {
  return (
    <div className="metric-card">
      <h2 className="card-title">Derniers Relevés Énergétiques</h2>
      <div className="metrics-list">
        {metricsList.length === 0 ? (
          <p className="no-data">Aucune donnée reçue pour le moment.</p>
        ) : (
          metricsList.slice(0, 5).map((metric) => (
            <div key={metric.id} className="metric-item">
              <span className="metric-type">{metric.metricType}</span>
              <span className="metric-value">{metric.value} Watts</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MetricCard;