/**
 * VIN Check Page
 * 
 * Публічна сторінка перевірки VIN
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MagnifyingGlass, 
  ArrowRight, 
  CheckCircle, 
  Warning, 
  Car, 
  Calendar, 
  MapPin, 
  Gauge, 
  CurrencyDollar,
  Images,
  Shield,
  Phone,
  Envelope
} from '@phosphor-icons/react';
import AuctionTimer from '../../components/public/AuctionTimer';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const VinCheckPage = () => {
  const { vin: urlVin } = useParams();
  const navigate = useNavigate();
  
  const [vin, setVin] = useState(urlVin || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showLeadForm, setShowLeadForm] = useState(false);

  // Auto-search if VIN in URL
  useEffect(() => {
    if (urlVin && urlVin.length === 17) {
      handleSearch(urlVin);
    }
  }, [urlVin]);

  const handleSearch = async (searchVin = vin) => {
    if (!searchVin || searchVin.length !== 17) {
      setError('VIN код повинен містити 17 символів');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await axios.get(`${API_URL}/api/vin/public/${searchVin.toUpperCase()}`);
      setResult(res.data);
      
      // Update URL
      if (searchVin !== urlVin) {
        navigate(`/vin-check/${searchVin.toUpperCase()}`, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Помилка пошуку. Спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="min-h-screen bg-zinc-50" data-testid="vin-check-page">
      {/* Search Section */}
      <section className="bg-white border-b border-zinc-200 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-zinc-900 mb-4">
              Перевірка VIN коду
            </h1>
            <p className="text-zinc-500 mb-8">
              Введіть VIN код авто для отримання інформації з аукціонів
            </p>

            <form onSubmit={handleSubmit} data-testid="vin-search-form">
              <div className="flex bg-zinc-100 rounded-xl overflow-hidden">
                <div className="flex-1 relative">
                  <MagnifyingGlass 
                    size={20} 
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" 
                  />
                  <input
                    type="text"
                    value={vin}
                    onChange={(e) => {
                      setVin(e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, ''));
                      setError('');
                    }}
                    placeholder="Введіть VIN код (17 символів)"
                    maxLength={17}
                    className="w-full pl-12 pr-4 py-4 bg-transparent text-zinc-900 text-lg placeholder:text-zinc-400 focus:outline-none"
                    data-testid="vin-input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || vin.length !== 17}
                  className="bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white px-8 font-semibold flex items-center gap-2 transition-colors"
                  data-testid="vin-search-btn"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Перевірити
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-zinc-400 mt-2 text-right">{vin.length}/17</p>
            </form>

            {error && (
              <div className="flex items-center justify-center gap-2 text-red-500 mt-4">
                <Warning size={18} />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      {result && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            {result.success && result.merged ? (
              <VinResult data={result} onRequestCall={() => setShowLeadForm(true)} />
            ) : (
              <div className="max-w-2xl mx-auto text-center py-12">
                <Warning size={48} className="mx-auto text-amber-500 mb-4" />
                <h2 className="text-xl font-semibold text-zinc-900 mb-2">
                  Інформація не знайдена
                </h2>
                <p className="text-zinc-500 mb-6">
                  На жаль, ми не знайшли даних по цьому VIN коду в базах аукціонів
                </p>
                <button
                  onClick={() => setShowLeadForm(true)}
                  className="bg-zinc-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-zinc-800 transition-colors"
                >
                  Залишити заявку на підбір
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Lead Form Modal */}
      {showLeadForm && (
        <LeadFormModal 
          vin={vin} 
          onClose={() => setShowLeadForm(false)} 
        />
      )}
    </div>
  );
};

// VIN Result Component
const VinResult = ({ data, onRequestCall }) => {
  const { merged, candidates, stats } = data;
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Main Info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Images */}
        {merged.images?.length > 0 && (
          <div className="bg-white rounded-xl overflow-hidden border border-zinc-200">
            <div className="aspect-video relative bg-zinc-100">
              <img
                src={merged.images[selectedImage]}
                alt="Vehicle"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = '/images/car-placeholder.jpg'; }}
              />
            </div>
            {merged.images.length > 1 && (
              <div className="p-4 flex gap-2 overflow-x-auto">
                {merged.images.slice(0, 10).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-20 h-16 rounded overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? 'border-zinc-900' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Vehicle Info */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">
            {merged.title || `${merged.year || ''} ${merged.make || ''} ${merged.model || ''}`.trim() || 'Автомобіль'}
          </h2>
          
          <p className="text-sm text-zinc-400 font-mono mb-6">
            VIN: {merged.vin}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {merged.year && (
              <InfoCard icon={Calendar} label="Рік" value={merged.year} />
            )}
            {merged.mileage && (
              <InfoCard icon={Gauge} label="Пробіг" value={`${merged.mileage.toLocaleString()} mi`} />
            )}
            {merged.location && (
              <InfoCard icon={MapPin} label="Локація" value={merged.location} />
            )}
            {merged.images?.length > 0 && (
              <InfoCard icon={Images} label="Фото" value={merged.images.length} />
            )}
          </div>

          {merged.damageType && (
            <div className="mt-6 p-4 bg-amber-50 rounded-lg">
              <p className="text-amber-800 font-medium">
                Тип пошкодження: {merged.damageType}
              </p>
            </div>
          )}
        </div>

        {/* Sources */}
        {candidates?.length > 0 && (
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h3 className="font-semibold text-zinc-900 mb-4">
              Знайдено в {candidates.length} джерелах
            </h3>
            <div className="space-y-2">
              {candidates.slice(0, 5).map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600">{c.sourceName}</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="text-zinc-400">{(c.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Price & Auction */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          {merged.price && (
            <div className="text-center mb-6">
              <p className="text-sm text-zinc-500">Ціна на аукціоні</p>
              <p className="text-4xl font-bold text-zinc-900">
                ${merged.price.toLocaleString()}
              </p>
            </div>
          )}

          {merged.saleDate && new Date(merged.saleDate) > new Date() && (
            <div className="text-center pb-6 border-b border-zinc-100">
              <p className="text-sm text-zinc-500 mb-2">До аукціону</p>
              <AuctionTimer date={merged.saleDate} />
            </div>
          )}

          <button
            onClick={onRequestCall}
            className="w-full mt-6 bg-zinc-900 text-white py-4 rounded-lg font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
            data-testid="request-call-btn"
          >
            <Phone size={20} />
            Замовити дзвінок
          </button>

          <p className="text-center text-xs text-zinc-400 mt-4">
            Ми зв'яжемось з вами протягом 15 хвилин
          </p>
        </div>

        {/* Trust */}
        <div className="bg-zinc-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={24} className="text-green-600" />
            <span className="font-semibold text-zinc-900">Гарантії</span>
          </div>
          <ul className="space-y-2 text-sm text-zinc-600">
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              Перевірка історії авто
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              Юридична чистота
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              Допомога з доставкою
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Info Card
const InfoCard = ({ icon: Icon, label, value }) => (
  <div className="p-4 bg-zinc-50 rounded-lg">
    <div className="flex items-center gap-2 text-zinc-400 mb-1">
      <Icon size={16} />
      <span className="text-xs">{label}</span>
    </div>
    <p className="font-semibold text-zinc-900">{value}</p>
  </div>
);

// Lead Form Modal
const LeadFormModal = ({ vin, onClose }) => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(`${API_URL}/api/leads`, {
        ...form,
        vin,
        source: 'vin_check',
      });
      setSuccess(true);
    } catch (err) {
      console.error('Error submitting lead:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-8">
        {success ? (
          <div className="text-center py-8">
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Дякуємо!</h3>
            <p className="text-zinc-500 mb-6">
              Ми зв'яжемось з вами найближчим часом
            </p>
            <button
              onClick={onClose}
              className="bg-zinc-900 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Закрити
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">
              Залишити заявку
            </h3>
            <p className="text-zinc-500 mb-6">
              Заповніть форму і ми зв'яжемось з вами
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Ваше ім'я"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
              <input
                type="tel"
                placeholder="Телефон"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
              <input
                type="email"
                placeholder="Email (опціонально)"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
              <textarea
                placeholder="Коментар (опціонально)"
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-zinc-200 rounded-lg font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-zinc-900 text-white rounded-lg font-semibold hover:bg-zinc-800 transition-colors disabled:bg-zinc-300"
                >
                  {submitting ? 'Відправка...' : 'Відправити'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default VinCheckPage;
