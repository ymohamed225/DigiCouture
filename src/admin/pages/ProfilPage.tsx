import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Key,
  Lock,
  Phone,
  Mail,
  Smartphone,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  Laptop,
  Sparkles,
  Save,
  LogOut
} from 'lucide-react';

export const ProfilPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profil' | 'securite' | 'sessions'>('profil');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form State - Super Admin Profile
  const [fullName, setFullName] = useState('Yacouba Mohamed');
  const [email, setEmail] = useState('admin@digicouture.app');
  const [phone, setPhone] = useState('+225 0707705067');
  const [role] = useState('Super Administrateur Système');
  const [timezone, setTimezone] = useState('Africa/Abidjan (GMT+0)');

  // Form State - Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Sessions State
  const [sessions, setSessions] = useState([
    {
      id: 'sess-1',
      device: 'Chrome sur Windows 11',
      location: "Abidjan, Côte d'Ivoire (IP: 154.73.14.92)",
      isCurrent: true,
      lastActive: 'En cours (Session actuelle)',
    },
    {
      id: 'sess-2',
      device: 'Safari sur iPhone 15 Pro',
      location: "Abidjan, Côte d'Ivoire (IP: 154.73.14.95)",
      isCurrent: false,
      lastActive: 'Il y a 3 heures',
    },
  ]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('Informations de profil mises à jour avec succès.');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Veuillez saisir votre mot de passe actuel.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('La confirmation du mot de passe ne correspond pas.');
      return;
    }

    setSuccessMessage('Votre mot de passe Super Admin a été modifié avec succès.');
    setSavedSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleRevokeSessions = () => {
    setSessions(sessions.filter((s) => s.isCurrent));
    setSuccessMessage('Toutes les autres sessions distantes ont été révoquées.');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={styles.avatarBox}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#D4AF37' }}>YM</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#F5F5F5', margin: 0 }}>
                {fullName}
              </h1>
              <span style={styles.badgeGold}>
                <Sparkles size={11} color="#D4AF37" /> Super Admin
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#8B8B94', marginTop: 4, margin: 0 }}>
              {role} • {email}
            </p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div style={styles.alertSuccess}>
          <CheckCircle2 size={16} color="#22C55E" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={styles.tabRow}>
        {[
          { id: 'profil', label: 'Profil & Identité', icon: <User size={14} /> },
          { id: 'securite', label: 'Sécurité & 2FA', icon: <ShieldCheck size={14} /> },
          { id: 'sessions', label: 'Sessions & Appareils', icon: <Laptop size={14} /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            style={{
              ...styles.tabBtn,
              ...(activeTab === t.id ? styles.tabBtnActive : {}),
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Profil & Identité */}
      {activeTab === 'profil' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            <User size={18} color="#D4AF37" /> Informations Personnelles & Rôle
          </h2>
          <p style={styles.cardDesc}>
            Gérez vos coordonnées de contact administrateur et paramètres régionaux.
          </p>

          <form onSubmit={handleProfileSave} style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nom complet</label>
              <div style={styles.inputWrapper}>
                <User size={16} color="#8B8B94" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Adresse Email (Accès Admin)</label>
              <div style={styles.inputWrapper}>
                <Mail size={16} color="#8B8B94" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Téléphone WhatsApp (Alertes & 2FA)</label>
              <div style={styles.inputWrapper}>
                <Phone size={16} color="#8B8B94" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Fuseau Horaire</label>
              <div style={styles.inputWrapper}>
                <Globe size={16} color="#8B8B94" />
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  style={styles.select}
                >
                  <option value="Africa/Abidjan (GMT+0)">Africa/Abidjan (GMT+0)</option>
                  <option value="Africa/Dakar (GMT+0)">Africa/Dakar (GMT+0)</option>
                  <option value="Europe/Paris (GMT+1)">Europe/Paris (GMT+1)</option>
                </select>
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: 12 }}>
              <button type="submit" style={styles.primaryBtn}>
                <Save size={15} /> Enregistrer le profil
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Sécurité & 2FA */}
      {activeTab === 'securite' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Password Change Form */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <Key size={18} color="#D4AF37" /> Changer le mot de passe Admin
            </h2>
            <p style={styles.cardDesc}>
              Mettez à jour votre mot de passe d'accès au panneau Super Admin DigiCouture.
            </p>

            {passwordError && (
              <div style={styles.alertError}>
                <AlertCircle size={16} color="#EF4444" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} style={styles.formGrid}>
              <div style={{ ...styles.inputGroup, gridColumn: '1 / -1' }}>
                <label style={styles.label}>Mot de passe actuel</label>
                <div style={styles.inputWrapper}>
                  <Lock size={16} color="#8B8B94" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={styles.input}
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Nouveau mot de passe</label>
                <div style={styles.inputWrapper}>
                  <Lock size={16} color="#8B8B94" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={styles.input}
                    placeholder="Au moins 8 caractères"
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirmer le nouveau mot de passe</label>
                <div style={styles.inputWrapper}>
                  <Lock size={16} color="#8B8B94" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={styles.input}
                    placeholder="Identique au nouveau"
                  />
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: 12 }}>
                <button type="submit" style={styles.primaryBtn}>
                  <Lock size={15} /> Mettre à jour le mot de passe
                </button>
              </div>
            </form>
          </div>

          {/* 2FA Status */}
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={styles.cardTitle}>
                  <Smartphone size={18} color="#D4AF37" /> Authentification à deux facteurs (2FA)
                </h2>
                <p style={styles.cardDesc}>
                  Exigez la validation d'un code OTP WhatsApp lors de la connexion.
                </p>
              </div>
              <button
                onClick={() => {
                  setTwoFactorEnabled(!twoFactorEnabled);
                  setSuccessMessage(`Double authentification ${!twoFactorEnabled ? 'activée' : 'désactivée'}.`);
                  setSavedSuccess(true);
                  setTimeout(() => setSavedSuccess(false), 3500);
                }}
                style={{
                  ...styles.toggleBtn,
                  background: twoFactorEnabled ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: twoFactorEnabled ? '#22C55E' : '#24242A',
                  color: twoFactorEnabled ? '#22C55E' : '#8B8B94',
                }}
              >
                {twoFactorEnabled ? 'Activé (WhatsApp OTP)' : 'Désactivé'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Sessions Actives */}
      {activeTab === 'sessions' && (
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={styles.cardTitle}>
                <Laptop size={18} color="#D4AF37" /> Appareils & Sessions Connectées
              </h2>
              <p style={styles.cardDesc}>
                Consultez la liste des appareils actuellement authentifiés avec vos identifiants.
              </p>
            </div>
            {sessions.length > 1 && (
              <button onClick={handleRevokeSessions} style={styles.dangerBtn}>
                <LogOut size={14} /> Révoquer les autres sessions
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sessions.map((sess) => (
              <div key={sess.id} style={styles.sessionItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={styles.sessionIconBox}>
                    <Laptop size={20} color="#D4AF37" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#F5F5F5' }}>
                        {sess.device}
                      </span>
                      {sess.isCurrent && (
                        <span style={styles.badgeGreen}>Session Actuelle</span>
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: '#8B8B94', display: 'block', marginTop: 2 }}>
                      {sess.location}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: '#8B8B94', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> {sess.lastActive}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '28px 36px',
    maxWidth: 1000,
    margin: '0 auto',
  },
  header: {
    marginBottom: 28,
  },
  avatarBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(18, 18, 22, 0.8) 100%)',
    border: '1px solid rgba(212, 175, 55, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeGold: {
    padding: '4px 10px',
    borderRadius: 20,
    background: 'rgba(212, 175, 55, 0.12)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  badgeGreen: {
    padding: '2px 8px',
    borderRadius: 12,
    background: 'rgba(34, 197, 94, 0.15)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    color: '#22C55E',
    fontSize: 10,
    fontWeight: 700,
  },
  alertSuccess: {
    background: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.25)',
    borderRadius: 10,
    padding: '12px 16px',
    color: '#22C55E',
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  alertError: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: 10,
    padding: '12px 16px',
    color: '#EF4444',
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  tabRow: {
    display: 'flex',
    gap: 8,
    borderBottom: '1px solid #24242A',
    paddingBottom: 12,
    marginBottom: 28,
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    borderRadius: 8,
    background: 'transparent',
    border: '1px solid transparent',
    color: '#8B8B94',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tabBtnActive: {
    background: '#121216',
    border: '1px solid #24242A',
    color: '#D4AF37',
  },
  card: {
    background: '#121216',
    border: '1px solid #24242A',
    borderRadius: 12,
    padding: 28,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#F5F5F5',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  cardDesc: {
    fontSize: 13,
    color: '#8B8B94',
    marginTop: 4,
    marginBottom: 24,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 20,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: '#8B8B94',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#0B0B0D',
    border: '1px solid #24242A',
    borderRadius: 8,
    padding: '10px 14px',
  },
  input: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#F5F5F5',
    fontSize: 13,
    width: '100%',
  },
  select: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#F5F5F5',
    fontSize: 13,
    width: '100%',
    cursor: 'pointer',
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    borderRadius: 8,
    background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)',
    border: 'none',
    color: '#0B0B0D',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  },
  dangerBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 8,
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  toggleBtn: {
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  sessionItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    background: '#0B0B0D',
    border: '1px solid #24242A',
    borderRadius: 10,
  },
  sessionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: 'rgba(212, 175, 55, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
