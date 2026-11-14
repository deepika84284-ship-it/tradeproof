import React, { useEffect } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  Search,
  X,
} from 'lucide-react';
import { ToastMessage } from '../../types/tradeproof';
import { buildQrMatrix } from '../../utils/formatters';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap shrink-0 cursor-pointer';
  const variants = {
    primary: 'bg-blue-700 text-white hover:bg-blue-800 shadow-xs',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs',
    outline: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-xs',
  };
  const sizes = {
    sm: 'h-9 px-3.5 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-sm',
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, hint, className = '', id, ...props }) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-600 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-700 ${
          error ? 'border-red-500' : 'border-slate-300'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
      {!error && hint && <span className="text-xs text-slate-500">{hint}</span>}
    </div>
  );
};

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, error, options, className = '', id, ...props }) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-600 ml-0.5">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-700 ${
          error ? 'border-red-500' : 'border-slate-300'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
};

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, className = '', id, ...props }) => {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-xs font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-600 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`w-full rounded-lg border bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-700 ${
          error ? 'border-red-500' : 'border-slate-300'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
};

export const SearchInput: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder = 'Search records...', className = '' }) => (
  <div className={`relative ${className}`}>
    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-700"
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange('')}
        aria-label="Clear search"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);

export type SemanticTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export function inferStatusTone(status: string): SemanticTone {
  const s = status.toLowerCase();
  if (
    s.includes('verified') ||
    s.includes('confirmed') ||
    s.includes('approved') ||
    s.includes('matched') ||
    s.includes('paid') && !s.includes('partially') ||
    s.includes('resolved') ||
    s.includes('connected') ||
    s.includes('delivered') && !s.includes('partially') ||
    s.includes('active') ||
    s.includes('intact') ||
    s.includes('accepted') && !s.includes('partial')
  ) {
    return 'success';
  }
  if (
    s.includes('dispute') ||
    s.includes('mismatch') ||
    s.includes('overdue') ||
    s.includes('rejected') ||
    s.includes('shortage') ||
    s.includes('damaged') ||
    s.includes('discrepancy') ||
    s.includes('incorrect') ||
    s.includes('action required')
  ) {
    return 'danger';
  }
  if (
    s.includes('pending') ||
    s.includes('partial') ||
    s.includes('amendment') ||
    s.includes('review') ||
    s.includes('transit') ||
    s.includes('awaiting') ||
    s.includes('scheduled') ||
    s.includes('open') ||
    s.includes('in progress') ||
    s.includes('responded')
  ) {
    return 'warning';
  }
  if (s.includes('dispatched') || s.includes('submitted') || s.includes('scanned')) {
    return 'info';
  }
  return 'neutral';
}

export const StatusBadge: React.FC<{ status: string; tone?: SemanticTone }> = ({ status, tone }) => {
  const resolved = tone || inferStatusTone(status);
  const styles: Record<SemanticTone, string> = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const Icon =
    resolved === 'success'
      ? CheckCircle2
      : resolved === 'danger'
        ? AlertCircle
        : resolved === 'warning'
          ? Clock
          : Info;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 ${styles[resolved]}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{status}</span>
    </span>
  );
};

export const Breadcrumbs: React.FC<{
  items: { label: string; onClick?: () => void }[];
}> = ({ items }) => (
  <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto">
    {items.map((item, idx) => {
      const isLast = idx === items.length - 1;
      return (
        <React.Fragment key={item.label + idx}>
          {idx > 0 && <span className="text-slate-300">/</span>}
          {item.onClick && !isLast ? (
            <button
              type="button"
              onClick={item.onClick}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {item.label}
            </button>
          ) : (
            <span className={`whitespace-nowrap shrink-0 ${isLast ? 'font-medium text-slate-900' : ''}`}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      );
    })}
  </nav>
);

export const Tabs: React.FC<{
  tabs: { id: string; label: string; count?: number }[];
  activeId: string;
  onChange: (id: string) => void;
}> = ({ tabs, activeId, onChange }) => (
  <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200">
    {tabs.map((tab) => {
      const active = tab.id === activeId;
      return (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`px-3.5 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2 ${
            active
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <span>{tab.label}</span>
          {typeof tab.count === 'number' && (
            <span className="text-xs font-mono tabular-nums text-slate-400">({tab.count})</span>
          )}
        </button>
      );
    })}
  </div>
);

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl';
  children: React.ReactNode;
}> = ({ open, onClose, title, subtitle, maxWidth = 'lg', children }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;
  const widths = {
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-[1px]">
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full ${widths[maxWidth]} max-h-[90vh] flex flex-col rounded-xl border border-slate-200 bg-white shadow-xl`}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

export const Drawer: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ open, onClose, title, subtitle, children }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40">
      <div className="w-full max-w-2xl h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col">
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

export const ConfirmDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
}> = ({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', danger = false }) => (
  <Modal open={open} onClose={onClose} title={title} maxWidth="md">
    <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button
        variant={danger ? 'danger' : 'primary'}
        onClick={() => {
          onConfirm();
          onClose();
        }}
      >
        {confirmLabel}
      </Button>
    </div>
  </Modal>
);

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ title, description, actionLabel, onAction }) => (
  <div className="border border-dashed border-slate-300 rounded-xl bg-white p-10 text-center flex flex-col items-center justify-center">
    <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
    <p className="text-sm text-slate-500 max-w-md mt-1">{description}</p>
    {actionLabel && onAction && (
      <Button className="mt-4" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="border border-slate-200 rounded-xl bg-white divide-y divide-slate-100">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="px-4 py-3.5 flex items-center justify-between gap-4 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/4" />
        <div className="h-4 bg-slate-100 rounded w-1/3" />
        <div className="h-4 bg-slate-200 rounded w-20" />
      </div>
    ))}
  </div>
);

export const ErrorState: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
}> = ({ title = 'Unable to load records', message, onRetry }) => (
  <div className="border border-red-200 rounded-xl bg-red-50/50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div className="flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
      <div>
        <h4 className="text-sm font-semibold text-red-900">{title}</h4>
        <p className="text-xs text-red-700 mt-0.5">{message}</p>
      </div>
    </div>
    {onRetry && (
      <Button variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    )}
  </div>
);

export interface ColumnDef<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  render: (item: T) => React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyTitle = 'No matching records',
  emptyDescription = 'Adjust your filters or create a new entry to populate this view.',
}: {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-xs font-semibold text-slate-600 whitespace-nowrap ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                className={`transition-colors ${
                  onRowClick ? 'hover:bg-slate-50 cursor-pointer' : 'hover:bg-slate-50/60'
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-slate-700 align-middle ${
                      col.align === 'right' ? 'text-right tabular-nums' : 'text-left'
                    }`}
                  >
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Redesigned Card Stack */}
      <div className="md:hidden flex flex-col gap-3">
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            onClick={onRowClick ? () => onRowClick(item) : undefined}
            className={`rounded-xl border border-slate-200 bg-white p-4 space-y-2.5 ${
              onRowClick ? 'active:bg-slate-50 cursor-pointer' : ''
            }`}
          >
            {columns.map((col) => (
              <div key={col.key} className="flex items-start justify-between gap-3 text-xs">
                <span className="text-slate-500 font-medium shrink-0">{col.header}</span>
                <div className="text-right text-slate-900 tabular-nums">{col.render(item)}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

export const Pagination: React.FC<{
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (p: number) => void;
}> = ({ page, totalPages, totalItems, onPageChange }) => (
  <div className="flex items-center justify-between gap-4 pt-3 text-xs text-slate-600">
    <span className="tabular-nums">
      Page {page} of {Math.max(1, totalPages)} · {totalItems} records
    </span>
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Prev
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
        <ChevronRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  </div>
);

export const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-20 right-4 z-[60] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const toneBorder =
          t.type === 'success'
            ? 'border-emerald-200 bg-white'
            : t.type === 'error'
              ? 'border-red-200 bg-white'
              : t.type === 'warning'
                ? 'border-amber-200 bg-white'
                : 'border-slate-200 bg-white';
        const Icon =
          t.type === 'success'
            ? CheckCircle2
            : t.type === 'error'
              ? AlertCircle
              : t.type === 'warning'
                ? AlertTriangle
                : Info;
        const iconColor =
          t.type === 'success'
            ? 'text-emerald-600'
            : t.type === 'error'
              ? 'text-red-600'
              : t.type === 'warning'
                ? 'text-amber-600'
                : 'text-blue-700';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-xl border ${toneBorder} p-3.5 shadow-lg flex items-start gap-3`}
          >
            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900">{t.title}</p>
              {t.description && <p className="text-xs text-slate-600 mt-0.5">{t.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export const QrCodeSvg: React.FC<{ payload: string; size?: number }> = ({ payload, size = 148 }) => {
  const matrix = buildQrMatrix(payload);
  const cells = matrix.length;
  return (
    <div className="inline-flex flex-col items-center p-3 bg-white border border-slate-200 rounded-xl">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${cells} ${cells}`}
        role="img"
        aria-label={`QR verification code for ${payload}`}
        className="block"
      >
        <rect width={cells} height={cells} fill="#FFFFFF" />
        {matrix.map((row, r) =>
          row.map((on, c) =>
            on ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#0F172A" /> : null,
          ),
        )}
      </svg>
      <span className="mt-2 font-mono text-[11px] text-slate-500 truncate max-w-[160px]">{payload}</span>
    </div>
  );
};
