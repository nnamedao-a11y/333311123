/**
 * Deals Page v2.0 - Full Sales Pipeline
 * 
 * Features:
 * - Pipeline status flow
 * - Financial tracking (estimated vs real)
 * - Create from lead/quote
 * - Override & margin visibility
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../App';
import { toast } from 'sonner';
import { 
  Plus, 
  Pencil, 
  Trash, 
  CaretRight,
  CurrencyCircleDollar,
  TrendUp,
  TrendDown,
  Coins,
  CheckCircle,
  XCircle,
  Package,
  Truck,
  CreditCard,
  ChatCircle
} from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { motion } from 'framer-motion';

const DEAL_STATUSES = [
  'new',
  'negotiation', 
  'waiting_deposit',
  'deposit_paid',
  'purchased',
  'in_delivery',
  'completed',
  'cancelled'
];

const statusLabels = {
  new: 'Новий',
  negotiation: 'Переговори',
  waiting_deposit: 'Очікує депозит',
  deposit_paid: 'Депозит сплачено',
  purchased: 'Куплено',
  in_delivery: 'В доставці',
  completed: 'Завершено',
  cancelled: 'Скасовано'
};

const statusColors = {
  new: 'bg-[#E0E7FF] text-[#4F46E5]',
  negotiation: 'bg-[#FEF3C7] text-[#D97706]',
  waiting_deposit: 'bg-[#FEE2E2] text-[#DC2626]',
  deposit_paid: 'bg-[#D1FAE5] text-[#059669]',
  purchased: 'bg-[#DBEAFE] text-[#2563EB]',
  in_delivery: 'bg-[#E0E7FF] text-[#7C3AED]',
  completed: 'bg-[#D1FAE5] text-[#059669]',
  cancelled: 'bg-[#F4F4F5] text-[#71717A]'
};

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    customerId: '',
    clientPrice: 0,
    internalCost: 0,
    purchasePrice: 0,
    description: '',
    vehiclePlaceholder: '',
    vin: ''
  });

  useEffect(() => {
    fetchDeals();
    fetchCustomers();
    fetchStats();
  }, [search, statusFilter]);

  const fetchDeals = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const res = await axios.get(`${API_URL}/api/deals?${params}`);
      setDeals(res.data.data || []);
    } catch (err) {
      toast.error('Помилка завантаження угод');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/customers?limit=100`);
      setCustomers(res.data.data || []);
    } catch (err) {}
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/deals/stats`);
      setStats(res.data);
    } catch (err) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        value: formData.clientPrice,
        estimatedMargin: formData.internalCost - formData.clientPrice,
      };

      if (editingDeal) {
        await axios.put(`${API_URL}/api/deals/${editingDeal.id}`, payload);
        toast.success('Угоду оновлено');
      } else {
        await axios.post(`${API_URL}/api/deals`, payload);
        toast.success('Угоду створено');
      }
      setShowModal(false);
      resetForm();
      fetchDeals();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Помилка');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити угоду?')) return;
    try {
      await axios.delete(`${API_URL}/api/deals/${id}`);
      toast.success('Угоду видалено');
      fetchDeals();
      fetchStats();
    } catch (err) {
      toast.error('Помилка видалення');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`${API_URL}/api/deals/${id}/status`, { status: newStatus });
      toast.success('Статус оновлено');
      fetchDeals();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Неможливо змінити статус');
    }
  };

  const handleFinanceUpdate = async (id, field, value) => {
    try {
      await axios.patch(`${API_URL}/api/deals/${id}/finance`, { [field]: value });
      toast.success('Фінанси оновлено');
      fetchDeals();
      if (selectedDeal) {
        const res = await axios.get(`${API_URL}/api/deals/${id}`);
        setSelectedDeal(res.data);
      }
    } catch (err) {
      toast.error('Помилка оновлення');
    }
  };

  const openEditModal = (deal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title,
      customerId: deal.customerId || '',
      clientPrice: deal.clientPrice || 0,
      internalCost: deal.internalCost || 0,
      purchasePrice: deal.purchasePrice || 0,
      description: deal.description || '',
      vehiclePlaceholder: deal.vehiclePlaceholder || '',
      vin: deal.vin || ''
    });
    setShowModal(true);
  };

  const openDetailModal = (deal) => {
    setSelectedDeal(deal);
    setShowDetailModal(true);
  };

  const resetForm = () => {
    setEditingDeal(null);
    setFormData({
      title: '',
      customerId: '',
      clientPrice: 0,
      internalCost: 0,
      purchasePrice: 0,
      description: '',
      vehiclePlaceholder: '',
      vin: ''
    });
  };

  const getCustomerName = (id) => {
    const c = customers.find(c => c.id === id);
    return c ? `${c.firstName} ${c.lastName}` : '—';
  };

  return (
    <motion.div 
      data-testid="deals-page" 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#18181B]" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
            Угоди
          </h1>
          <p className="text-sm text-[#71717A] mt-1">Sales Pipeline Management</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }} 
          className="btn-primary" 
          data-testid="create-deal-btn"
        >
          <Plus size={18} weight="bold" />Нова угода
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <StatCard 
            icon={Package} 
            label="Всього угод" 
            value={stats.total}
            color="#4F46E5"
          />
          <StatCard 
            icon={CheckCircle} 
            label="Завершено" 
            value={stats.completedDeals || 0}
            color="#059669"
          />
          <StatCard 
            icon={XCircle} 
            label="Скасовано" 
            value={stats.cancelledDeals || 0}
            color="#DC2626"
          />
          <StatCard 
            icon={CurrencyCircleDollar} 
            label="Total Value" 
            value={`$${(stats.totalValue || 0).toLocaleString()}`}
            color="#7C3AED"
          />
          <StatCard 
            icon={Coins} 
            label="Est. Margin" 
            value={`$${Math.abs(stats.totalEstimatedMargin || 0).toLocaleString()}`}
            color="#D97706"
          />
          <StatCard 
            icon={TrendUp} 
            label="Real Profit" 
            value={`$${(stats.totalRealProfit || 0).toLocaleString()}`}
            color="#059669"
          />
        </div>
      )}

      {/* Filters */}
      <div className="card p-5 mb-5">
        <div className="flex flex-wrap gap-4">
          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Пошук угод..." 
            className="input flex-1 min-w-[200px]" 
            data-testid="deals-search-input" 
          />
          <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[180px] input" data-testid="deals-status-filter">
              <SelectValue placeholder="Всі статуси" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі статуси</SelectItem>
              {DEAL_STATUSES.map(s => (
                <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Deals Table */}
      <div className="card overflow-hidden">
        <table className="table-premium" data-testid="deals-table">
          <thead>
            <tr>
              <th>Угода</th>
              <th>VIN / Авто</th>
              <th>Клієнт</th>
              <th>Статус</th>
              <th>Client Price</th>
              <th>Est. Margin</th>
              <th>Real Profit</th>
              <th className="text-right">Дії</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-[#71717A]">Завантаження...</td>
              </tr>
            ) : deals.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-[#71717A]">Немає угод</td>
              </tr>
            ) : deals.map(deal => (
              <tr 
                key={deal.id} 
                data-testid={`deal-row-${deal.id}`}
                className="cursor-pointer hover:bg-[#F9FAFB]"
                onClick={() => openDetailModal(deal)}
              >
                <td className="font-medium text-[#18181B]">
                  <div>{deal.title}</div>
                  {deal.sourceScenario && (
                    <span className="text-xs text-[#71717A] capitalize">{deal.sourceScenario}</span>
                  )}
                </td>
                <td>
                  <div className="text-sm font-mono text-[#71717A]">{deal.vin || '—'}</div>
                  <div className="text-xs text-[#A1A1AA]">{deal.vehicleTitle || deal.vehiclePlaceholder}</div>
                </td>
                <td>{getCustomerName(deal.customerId)}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <Select value={deal.status} onValueChange={(v) => handleStatusChange(deal.id, v)}>
                    <SelectTrigger className="w-[150px] h-8 bg-transparent border-0 p-0" data-testid={`deal-status-${deal.id}`}>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[deal.status]}`}>
                        {statusLabels[deal.status]}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {DEAL_STATUSES.map(s => (
                        <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="font-semibold text-[#18181B]">
                  ${(deal.clientPrice || deal.value || 0).toLocaleString()}
                </td>
                <td className={`font-medium ${(deal.estimatedMargin || 0) >= 0 ? 'text-[#059669]' : 'text-[#DC2626]'}`}>
                  ${Math.abs(deal.estimatedMargin || 0).toLocaleString()}
                </td>
                <td className={`font-semibold ${(deal.realProfit || 0) >= 0 ? 'text-[#059669]' : 'text-[#DC2626]'}`}>
                  {deal.status === 'completed' ? `$${(deal.realProfit || 0).toLocaleString()}` : '—'}
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button 
                      onClick={() => openEditModal(deal)} 
                      className="p-2.5 hover:bg-[#F4F4F5] rounded-lg" 
                      data-testid={`edit-deal-${deal.id}`}
                    >
                      <Pencil size={16} className="text-[#71717A]" />
                    </button>
                    <button 
                      onClick={() => handleDelete(deal.id)} 
                      className="p-2.5 hover:bg-[#FEE2E2] rounded-lg" 
                      data-testid={`delete-deal-${deal.id}`}
                    >
                      <Trash size={16} className="text-[#DC2626]" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg bg-white rounded-2xl border border-[#E4E4E7]" data-testid="deal-modal">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#18181B]" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              {editingDeal ? 'Редагувати угоду' : 'Нова угода'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-2">Назва угоди</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                required 
                className="input w-full" 
                data-testid="deal-title-input" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-2">VIN</label>
                <input 
                  type="text" 
                  value={formData.vin} 
                  onChange={(e) => setFormData({...formData, vin: e.target.value.toUpperCase()})} 
                  className="input w-full font-mono" 
                  data-testid="deal-vin-input" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-2">Клієнт</label>
                <Select value={formData.customerId || "none"} onValueChange={(v) => setFormData({...formData, customerId: v === "none" ? "" : v})}>
                  <SelectTrigger className="input" data-testid="deal-customer-select">
                    <SelectValue placeholder="Оберіть клієнта" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Не обрано</SelectItem>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-2">Client Price ($)</label>
                <input 
                  type="number" 
                  value={formData.clientPrice} 
                  onChange={(e) => setFormData({...formData, clientPrice: parseInt(e.target.value) || 0})} 
                  className="input w-full" 
                  data-testid="deal-client-price-input" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-2">Internal Cost ($)</label>
                <input 
                  type="number" 
                  value={formData.internalCost} 
                  onChange={(e) => setFormData({...formData, internalCost: parseInt(e.target.value) || 0})} 
                  className="input w-full" 
                  data-testid="deal-internal-cost-input" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-2">Purchase Price ($)</label>
                <input 
                  type="number" 
                  value={formData.purchasePrice} 
                  onChange={(e) => setFormData({...formData, purchasePrice: parseInt(e.target.value) || 0})} 
                  className="input w-full" 
                  data-testid="deal-purchase-price-input" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-2">Авто (опис)</label>
              <input 
                type="text" 
                value={formData.vehiclePlaceholder} 
                onChange={(e) => setFormData({...formData, vehiclePlaceholder: e.target.value})} 
                placeholder="BMW X5 2022" 
                className="input w-full" 
                data-testid="deal-vehicle-input" 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-2">Опис</label>
              <textarea 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                rows={2} 
                className="input w-full resize-none" 
                data-testid="deal-description-input" 
              />
            </div>

            {/* Margin Preview */}
            <div className="bg-[#F4F4F5] rounded-xl p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-2">Estimated Margin</div>
              <div className={`text-2xl font-bold ${(formData.internalCost - formData.clientPrice) >= 0 ? 'text-[#059669]' : 'text-[#DC2626]'}`}>
                ${Math.abs(formData.internalCost - formData.clientPrice).toLocaleString()}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1" data-testid="deal-cancel-btn">
                Скасувати
              </button>
              <button type="submit" className="btn-primary flex-1" data-testid="deal-submit-btn">
                {editingDeal ? 'Зберегти' : 'Створити'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deal Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl bg-white rounded-2xl border border-[#E4E4E7]" data-testid="deal-detail-modal">
          {selectedDeal && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-[#18181B]" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                  {selectedDeal.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                {/* Status & Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[selectedDeal.status]}`}>
                      {statusLabels[selectedDeal.status]}
                    </span>
                    {selectedDeal.sourceScenario && (
                      <span className="ml-2 px-2 py-1 bg-[#F4F4F5] rounded text-xs capitalize">
                        {selectedDeal.sourceScenario}
                      </span>
                    )}
                  </div>
                  {selectedDeal.vin && (
                    <span className="font-mono text-sm text-[#71717A]">{selectedDeal.vin}</span>
                  )}
                </div>

                {/* Financial Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <FinanceCard
                    label="Client Price"
                    value={selectedDeal.clientPrice || 0}
                    editable
                    onSave={(v) => handleFinanceUpdate(selectedDeal.id, 'clientPrice', v)}
                  />
                  <FinanceCard
                    label="Internal Cost"
                    value={selectedDeal.internalCost || 0}
                    editable
                    onSave={(v) => handleFinanceUpdate(selectedDeal.id, 'internalCost', v)}
                  />
                  <FinanceCard
                    label="Purchase Price"
                    value={selectedDeal.purchasePrice || 0}
                    editable
                    onSave={(v) => handleFinanceUpdate(selectedDeal.id, 'purchasePrice', v)}
                  />
                  <FinanceCard
                    label="Real Cost"
                    value={selectedDeal.realCost || 0}
                    editable
                    onSave={(v) => handleFinanceUpdate(selectedDeal.id, 'realCost', v)}
                  />
                  <FinanceCard
                    label="Real Revenue"
                    value={selectedDeal.realRevenue || 0}
                    editable
                    onSave={(v) => handleFinanceUpdate(selectedDeal.id, 'realRevenue', v)}
                  />
                </div>

                {/* Margin Summary */}
                <div className="grid grid-cols-3 gap-4 bg-[#F9FAFB] rounded-xl p-4">
                  <div>
                    <div className="text-xs text-[#71717A] uppercase tracking-wider">Est. Margin</div>
                    <div className={`text-xl font-bold ${(selectedDeal.estimatedMargin || 0) >= 0 ? 'text-[#059669]' : 'text-[#DC2626]'}`}>
                      ${Math.abs(selectedDeal.estimatedMargin || 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#71717A] uppercase tracking-wider">Real Profit</div>
                    <div className={`text-xl font-bold ${(selectedDeal.realProfit || 0) >= 0 ? 'text-[#059669]' : 'text-[#DC2626]'}`}>
                      ${(selectedDeal.realProfit || 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#71717A] uppercase tracking-wider">Override Loss</div>
                    <div className={`text-xl font-bold ${(selectedDeal.overrideDelta || 0) > 0 ? 'text-[#DC2626]' : 'text-[#71717A]'}`}>
                      ${(selectedDeal.overrideDelta || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div className="flex gap-2 text-sm">
                  {selectedDeal.leadId && (
                    <span className="px-2 py-1 bg-[#E0E7FF] text-[#4F46E5] rounded">
                      Lead: {selectedDeal.leadId}
                    </span>
                  )}
                  {selectedDeal.quoteId && (
                    <span className="px-2 py-1 bg-[#FEF3C7] text-[#D97706] rounded">
                      Quote: {selectedDeal.quoteId}
                    </span>
                  )}
                  {selectedDeal.depositId && (
                    <span className="px-2 py-1 bg-[#D1FAE5] text-[#059669] rounded">
                      Deposit: {selectedDeal.depositId}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

// Helper Components
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="kpi-card">
    <div className="mb-3">
      <Icon size={24} weight="duotone" style={{ color }} />
    </div>
    <div className="kpi-value">{value}</div>
    <div className="kpi-label">{label}</div>
  </div>
);

const FinanceCard = ({ label, value, editable, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSave = () => {
    onSave(localValue);
    setIsEditing(false);
  };

  return (
    <div className="border rounded-xl p-3">
      <div className="text-xs text-[#71717A] uppercase tracking-wider mb-2">{label}</div>
      {isEditing ? (
        <div className="flex gap-2">
          <input
            type="number"
            value={localValue}
            onChange={(e) => setLocalValue(parseInt(e.target.value) || 0)}
            className="input w-full text-lg"
            autoFocus
          />
          <button onClick={handleSave} className="btn-primary px-3 py-1 text-sm">
            Save
          </button>
        </div>
      ) : (
        <div 
          className={`text-lg font-semibold ${editable ? 'cursor-pointer hover:text-[#4F46E5]' : ''}`}
          onClick={() => editable && setIsEditing(true)}
        >
          ${value.toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default Deals;
