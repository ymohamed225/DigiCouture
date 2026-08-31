import React from 'react';
import { Shield } from 'lucide-react';

export const RolesPage: React.FC = () => {
  return (
    <div style={{ padding: 32 }}>
      <div style={{ background: '#121216', border: '1px solid #24242A', borderRadius: 12, padding: 32, maxWidth: 540 }}>
        <Shield size={32} color="#D4AF37" style={{ marginBottom: 16 }} />
        <h2 style={{ color: '#F5F5F5', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          Rôles & Permissions Platform (RBAC)
        </h2>
        <p style={{ color: '#8B8B94', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          Les 5 rôles de la plateforme SaaS (<code>PLATFORM_OWNER</code>, <code>PLATFORM_ADMIN</code>, <code>PLATFORM_SUPPORT</code>, <code>PLATFORM_FINANCE</code>, <code>PLATFORM_ANALYST</code>) sont configurés et isolés au niveau du serveur backend.
        </p>
      </div>
    </div>
  );
};
