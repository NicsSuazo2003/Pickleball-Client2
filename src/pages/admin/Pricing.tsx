import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Check, X, Tag } from 'lucide-react';
import { courtService } from '../../services/courtService';
import type { PriceRule } from '../../types';
import { formatTime, formatCurrency } from '../../utils/format';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function RuleForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<PriceRule>;
  onSave: (data: Omit<PriceRule, 'id' | 'isActive'>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [dayOfWeek, setDayOfWeek] = useState<number | null>(initial?.dayOfWeek ?? null);
  const [startTime, setStartTime] = useState(initial?.startTime ?? '08:00');
  const [endTime, setEndTime] = useState(initial?.endTime ?? '17:00');
  const [price, setPrice] = useState(String(initial?.pricePerHour ?? 250));
  const [priority, setPriority] = useState(String(initial?.priority ?? 1));

  const handleSave = () => {
    if (!name || !startTime || !endTime || !price) {
      toast.error('Fill in all required fields');
      return;
    }
    onSave({
      name,
      dayOfWeek,
      startTime,
      endTime,
      pricePerHour: Number(price),
      priority: Number(priority),
    });
  };

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-base font-semibold text-slate-800">{initial?.id ? 'Edit Rule' : 'Add Price Rule'}</h3>

      <div>
        <label className="text-sm font-medium text-slate-700 block mb-1.5">Rule Name *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Weekend Peak"
          className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 block mb-1.5">Day of Week</label>
        <select
          value={dayOfWeek === null ? '' : String(dayOfWeek)}
          onChange={(e) => setDayOfWeek(e.target.value === '' ? null : Number(e.target.value))}
          className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
        >
          <option value="">All Days</option>
          {DAY_NAMES.map((d, i) => <option key={d} value={i}>{d}</option>)}
          <option value="-1">Weekends (Sat–Sun)</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Start Time *</label>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">End Time *</label>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Price per Hour (₱) *</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="0"
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Priority</label>
          <input type="number" value={priority} onChange={(e) => setPriority(e.target.value)} min="1"
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500" />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button className="flex-1" onClick={handleSave}>Save Rule</Button>
      </div>
    </div>
  );
}

export default function AdminPricing() {
  const [rules, setRules] = useState<PriceRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<PriceRule | null>(null);

  useEffect(() => {
    courtService.getPriceRules()
      .then(setRules)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (data: Omit<PriceRule, 'id' | 'isActive'>) => {
    try {
      const rule = await courtService.addPriceRule(data);
      setRules((prev) => [...prev, rule]);
      setShowModal(false);
      toast.success('Price rule added');
    } catch {
      toast.error('Failed to add rule');
    }
  };

  const handleUpdate = async (data: Omit<PriceRule, 'id' | 'isActive'>) => {
    if (!editingRule) return;
    try {
      const rule = await courtService.updatePriceRule(editingRule.id, { ...data, isActive: editingRule.isActive });
      setRules((prev) => prev.map((r) => r.id === rule.id ? rule : r));
      setEditingRule(null);
      toast.success('Rule updated');
    } catch {
      toast.error('Failed to update rule');
    }
  };

  const toggleActive = async (rule: PriceRule) => {
    try {
      const updated = await courtService.updatePriceRule(rule.id, { isActive: !rule.isActive });
      setRules((prev) => prev.map((r) => r.id === updated.id ? updated : r));
    } catch {
      toast.error('Failed to toggle rule');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await courtService.deletePriceRule(id);
      setRules((prev) => prev.filter((r) => r.id !== id));
      toast.success('Rule deleted');
    } catch {
      toast.error('Failed to delete rule');
    }
  };

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowModal(true)} icon={<Plus size={14} />}>
          Add Rule
        </Button>
      </div>

      {rules.length === 0 ? (
        <EmptyState icon={Tag} title="No price rules" description="Add rules to set dynamic pricing by day or time." />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {rules.map((rule) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${rule.isActive ? 'border-slate-100' : 'border-slate-100 opacity-60'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                    <Tag size={17} className="text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800">{rule.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rule.isActive ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-400'}`}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {rule.dayOfWeek === null ? 'All days' : DAY_NAMES[rule.dayOfWeek]} ·{' '}
                      {formatTime(rule.startTime)} – {formatTime(rule.endTime)} ·{' '}
                      Priority {rule.priority}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-teal-700 shrink-0">{formatCurrency(rule.pricePerHour)}/hr</p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleActive(rule)}
                      className={`p-1.5 rounded-lg transition-colors ${rule.isActive ? 'text-teal-500 hover:bg-teal-50' : 'text-slate-300 hover:bg-slate-50'}`}
                      title={rule.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {rule.isActive ? <Check size={15} /> : <X size={15} />}
                    </button>
                    <button
                      onClick={() => setEditingRule(rule)}
                      className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} size="md">
        <RuleForm onSave={handleAdd} onCancel={() => setShowModal(false)} />
      </Modal>

      <Modal open={!!editingRule} onClose={() => setEditingRule(null)} size="md">
        {editingRule && (
          <RuleForm
            initial={editingRule}
            onSave={handleUpdate}
            onCancel={() => setEditingRule(null)}
          />
        )}
      </Modal>
    </div>
  );
}
