import React, { useEffect, useRef, useState } from 'react';
import {
  FilePlus2,
  FileUp,
  Plus,
  QrCode,
  ShieldAlert,
  Truck,
  X,
  Zap,
} from 'lucide-react';
import { WorkspaceRole } from '../../types/tradeproof';

export type QuickActionIntent =
  | 'create-po'
  | 'scan-qr'
  | 'upload-invoice'
  | 'create-dispatch'
  | 'raise-dispute';

interface QuickActionsMenuProps {
  perspective: WorkspaceRole;
  onTriggerAction: (intent: QuickActionIntent) => void;
}

export const QuickActionsMenu: React.FC<QuickActionsMenuProps> = ({
  perspective,
  onTriggerAction,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (open && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const actions: {
    id: QuickActionIntent;
    label: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
    shortcut: string;
    primaryFor: WorkspaceRole[];
  }[] = [
    {
      id: 'create-po',
      label: 'Create New PO',
      desc: 'Issue industry-configured purchase order',
      icon: FilePlus2,
      shortcut: 'PO',
      primaryFor: ['buyer', 'admin'],
    },
    {
      id: 'scan-qr',
      label: 'Scan QR Delivery',
      desc: 'Verify gate counts & accept partial GRN',
      icon: QrCode,
      shortcut: 'QR',
      primaryFor: ['buyer', 'supplier', 'admin'],
    },
    {
      id: 'upload-invoice',
      label: 'Upload Invoice',
      desc: 'Submit tax invoice & run 3-way match',
      icon: FileUp,
      shortcut: 'INV',
      primaryFor: ['supplier', 'buyer', 'admin'],
    },
    {
      id: 'create-dispatch',
      label: 'Create Dispatch & QR',
      desc: 'Bind E-Way Bill & generate pass',
      icon: Truck,
      shortcut: 'DSP',
      primaryFor: ['supplier'],
    },
    {
      id: 'raise-dispute',
      label: 'Raise Dispute',
      desc: 'Log shortage or damage with evidence',
      icon: ShieldAlert,
      shortcut: 'CLM',
      primaryFor: ['buyer', 'supplier'],
    },
  ];

  // Prioritize role-relevant actions at top while keeping all high-frequency tasks reachable
  const orderedActions = [...actions].sort((a, b) => {
    const aMatch = a.primaryFor.includes(perspective) ? 0 : 1;
    const bMatch = b.primaryFor.includes(perspective) ? 0 : 1;
    return aMatch - bMatch;
  });

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {open && (
        <div
          role="menu"
          aria-label="Quick Actions Menu"
          className="w-80 rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 overflow-hidden transition-all duration-150 origin-bottom-right"
        >
          <div className="px-4 py-3 bg-slate-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-semibold tracking-tight">Workflow Quick Actions</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 capitalize">{perspective}</span>
          </div>

          <div className="p-2 divide-y divide-slate-100">
            {orderedActions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    onTriggerAction(act.id);
                  }}
                  className="w-full min-h-[44px] px-3 py-2.5 flex items-center justify-between gap-3 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 group-hover:border-blue-200 group-hover:bg-blue-50 flex items-center justify-center shrink-0 transition-colors">
                      <Icon className="w-4 h-4 text-slate-700 group-hover:text-blue-700" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {act.label}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{act.desc}</div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 shrink-0">
                    {act.shortcut}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((prev) => !prev)}
        className={`h-12 px-4 rounded-xl font-medium text-sm shadow-lg shadow-slate-950/15 inline-flex items-center gap-2.5 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 whitespace-nowrap ${
          open
            ? 'bg-slate-900 text-white hover:bg-slate-800'
            : 'bg-blue-700 text-white hover:bg-blue-800'
        }`}
      >
        {open ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        <span>Quick Actions</span>
      </button>
    </div>
  );
};
