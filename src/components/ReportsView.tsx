import React, { useState } from 'react';
import type { Order, Payment } from '../types';
import { 
  TrendingUp, 
  PackageCheck, 
  AlertTriangle, 
  BarChart2
} from 'lucide-react';

interface ReportsViewProps {
  orders: Order[];
  payments: Payment[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ orders, payments }) => {
  const [period, setPeriod] = useState<'mois' | 'annee'>('mois');

  const totalRevenus = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const totalReste = orders.reduce((acc, o) => acc + Number(o.remainingAmount || 0), 0);
  const commandesLivrees = orders.filter(o => o.status === 'livree').length;
  const commandesEnCours = orders.filter(o => o.status !== 'livree').length;

  return (
    <div className="animate-fade-in" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Rapports & Statistiques Atelier 📊
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Analyse financière et suivi de la productivité de votre atelier.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setPeriod('mois')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.85rem',
              backgroundColor: period === 'mois' ? 'var(--gold-primary)' : 'var(--bg-primary)',
              color: period === 'mois' ? '#FFF' : 'var(--text-main)',
              border: '1px solid var(--border-color)'
            }}
          >
            Ce Mois
          </button>
          <button 
            onClick={() => setPeriod('annee')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.85rem',
              backgroundColor: period === 'annee' ? 'var(--gold-primary)' : 'var(--bg-primary)',
              color: period === 'annee' ? '#FFF' : 'var(--text-main)',
              border: '1px solid var(--border-color)'
            }}
          >
            Cette Année 2026
          </button>
        </div>
      </div>

      {/* Cartes KPI Financières */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Chiffre d'Affaires</span>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: '#ECFDF5', color: '#059669' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem', wordBreak: 'break-all' }}>
            {totalRevenus.toLocaleString()} FCFA
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.25rem', fontWeight: 600 }}>
            ↑ +18% vs mois précédent
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--gold-light)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-gold)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--gold-dark)', fontWeight: 600 }}>Reste à Recouvrer (Acomptes)</span>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: '#FEF2F2', color: '#DC2626' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#DC2626', marginTop: '0.5rem', wordBreak: 'break-all' }}>
            {totalReste.toLocaleString()} FCFA
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gold-dark)', marginTop: '0.25rem', fontWeight: 600 }}>
            À encaisser aux livraisons
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Volume de Commandes</span>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: '#EFF6FF', color: '#2563EB' }}>
              <PackageCheck size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
            {orders.length} tenues
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {commandesLivrees} livrées • {commandesEnCours} en atelier
          </div>
        </div>
      </div>

      {/* Graphique Visuel des Revenus par Mois */}
      <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart2 size={20} color="var(--gold-dark)" /> Progression des Encaisses (FCFA)
        </h3>

        {/* Dynamic CSS Bar Chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', paddingTop: '2rem', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          {[
            { month: 'Jan', val: 320000, height: '40%' },
            { month: 'Fév', val: 450000, height: '60%' },
            { month: 'Mar', val: 390000, height: '50%' },
            { month: 'Avr', val: 520000, height: '70%' },
            { month: 'Mai', val: 610000, height: '85%' },
            { month: 'Juin', val: 580000, height: '80%' },
            { month: 'Juil', val: 690000, height: '95%' },
            { month: 'Août', val: totalRevenus, height: '100%' }
          ].map((bar, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--gold-dark)' }}>{(bar.val / 1000).toFixed(0)}k</span>
              <div style={{
                width: '100%',
                maxWidth: '40px',
                height: bar.height,
                background: i === 7 ? 'var(--gold-gradient)' : 'var(--bg-tertiary)',
                borderRadius: '6px 6px 0 0',
                transition: 'height 0.3s ease'
              }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{bar.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
