import React from 'react';
import { Settings } from 'lucide-react';
import { PlaceholderView } from '../components/placeholders/PlaceholderView';

export function SettingsPage() {
  return (
    <PlaceholderView
      title="Society Settings & Governance Roles"
      description="RWA registration details, role-based permission matrix, fiscal year preferences, and committee member directory."
      icon={Settings}
      phase="Phase 3 & 4 Roadmap"
      owningTeam="Core Backend & Compliance Team"
      plannedFeatures={[
        'Society profile and statutory registration data configuration',
        'Role-Based Access Control (Admin, Treasurer, Auditor, Resident, Committee Member)',
        'Maintenance fee structure and due date policies',
        'Notification channels and alert settings',
      ]}
      contractRequirement="Requires GET /api/settings/society, PUT /api/settings/society, and permissions specification docs/permissions.md."
    />
  );
}
