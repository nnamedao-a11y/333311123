/**
 * VIN Check Page with Calculator & Lead Conversion
 * 
 * Flow: VIN → Vehicle Data → Calculator → Quote → Lead
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  Envelope,
  Calculator,
  Truck,
  Anchor,
  Receipt,
  User,
  ChatCircle,
  SpinnerGap,
  Check
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
  
  // Calculator state
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [port, setPort] = useState('NJ');
  const [vehicleType, setVehicleType] = useState('sedan');
  const [calcLoading, setCalcLoading] = useState(false);
  const [quote, setQuote] = useState(null);
  
  // Lead form state
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadForm, setLeadForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    comment: ''
  });

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
    setQuote(null);
    setLeadSuccess(false);

    try {
      const res = await axios.get(`${API_URL}/api/public/vin/${searchVin.toUpperCase()}`);
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

  // Calculate delivery cost
  const handleCalculate = async () => {
    if (!result?.price) {
      setError('Немає ціни для розрахунку');
      return;
    }

    setCalcLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/calculator/quote`, {
        price: result.price,
        port,
        vehicleType,
        vin: result.vin,
        vehicleTitle: result.title
      });
      setQuote(res.data);
      setCalculatorOpen(true);
    } catch (err) {
      setError('Помилка розрахунку. Спробуйте ще раз.');
    } finally {
      setCalcLoading(false);
    }
  };

  // Submit lead
  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    
    if (!leadForm.firstName || !leadForm.phone) {
      setError('Вкажіть ім\'я та телефон');
      return;
    }

    setLeadLoading(true);
    try {
      await axios.post(`${API_URL}/api/public/leads/from-quote`, {
        quoteId: quote?.quote?.id || quote?._id,
        firstName: leadForm.firstName,
        lastName: leadForm.lastName,
        phone: leadForm.phone,
        email: leadForm.email,
        comment: leadForm.comment
      });
      setLeadSuccess(true);
      setShowLeadForm(false);
    } catch (err) {
      setError('Помилка створення заявки. Спробуйте ще раз.');
    } finally {
      setLeadLoading(false);
    }
  };

  // Quick lead without quote
  const handleQuickLead = async (e) => {
    e.preventDefault();
    
    if (!leadForm.firstName || !leadForm.phone) {
      setError('Вкажіть ім\'я та телефон');
      return;
    }

    setLeadLoading(true);
    try {
      await axios.post(`${API_URL}/api/public/leads/quick`, {
        vin: result?.vin || vin,
        firstName: leadForm.firstName,
        lastName: leadForm.lastName,
        phone: leadForm.phone,
        email: leadForm.email,
        comment: leadForm.comment,
        price: result?.price,
        vehicleTitle: result?.title,
        source: 'vin_page_quick'
      });
      setLeadSuccess(true);
      setShowLeadForm(false);
    } catch (err) {
      setError('Помилка створення заявки. Спробуйте ще раз.');
    } finally {
      setLeadLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50" data-testid="vin-check-page">
      {/* Search Section */}
      <section className="bg-white border-b border-zinc-200 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-zinc-900 mb-3">
              Перевірка VIN коду
            </h1>
            <p className="text-zinc-500 mb-8">
              Введіть VIN код авто для отримання інформації з аукціонів
            </p>

            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-center bg-zinc-100 rounded-xl p-2">
                <MagnifyingGlass size={24} className="text-zinc-400 ml-4" />
                <input
                  type="text"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  placeholder="Введіть VIN код (17 символів)"
                  maxLength={17}
                  className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-lg font-mono"
                  data-testid="vin-search-input"
                />
                <button
                  type="submit"
                  disabled={loading || vin.length !== 17}
                  className="bg-zinc-900 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                  data-testid="vin-search-btn"
                >
                  {loading ? (
                    <SpinnerGap size={20} className="animate-spin" />
                  ) : (
                    <>
                      Перевірити
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>
              <div className="text-right text-xs text-zinc-400 mt-2">
                {vin.length}/17
              </div>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      {result && result.vin && !result.message && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Images */}
                {result.images?.length > 0 && (
                  <div className="bg-white rounded-xl overflow-hidden border border-zinc-200">
                    <div className="aspect-video relative bg-zinc-100">
                      <img
                        src={result.images[0]}
                        alt="Vehicle"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = '/images/car-placeholder.jpg'; }}
                      />
                    </div>
                    {result.images.length > 1 && (
                      <div className="p-4 flex gap-2 overflow-x-auto">
                        {result.images.slice(0, 10).map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt=""
                            className="flex-shrink-0 w-20 h-16 rounded object-cover border-2 border-transparent hover:border-zinc-900 cursor-pointer"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Vehicle Info */}
                <div className="bg-white rounded-xl border border-zinc-200 p-6">
                  <h2 className="text-2xl font-bold text-zinc-900 mb-2">
                    {result.title || `${result.year || ''} ${result.make || ''} ${result.model || ''}`.trim() || 'Автомобіль'}
                  </h2>
                  
                  <p className="text-sm text-zinc-400 font-mono mb-6">
                    VIN: {result.vin}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {result.year && (
                      <InfoCard icon={Calendar} label="Рік" value={result.year} />
                    )}
                    {result.mileage && (
                      <InfoCard icon={Gauge} label="Пробіг" value={`${Number(result.mileage).toLocaleString()} mi`} />
                    )}
                    {result.location && (
                      <InfoCard icon={MapPin} label="Локація" value={result.location} />
                    )}
                    {result.images?.length > 0 && (
                      <InfoCard icon={Images} label="Фото" value={result.images.length} />
                    )}
                  </div>

                  {result.damageType && (
                    <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                      <p className="text-amber-800 font-medium">
                        Тип пошкодження: {result.damageType}
                      </p>
                    </div>
                  )}
                </div>

                {/* Calculator Section */}
                {result.price && (
                  <div className="bg-white rounded-xl border border-zinc-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calculator size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-900">Калькулятор вартості</h3>
                        <p className="text-sm text-zinc-500">Розрахунок повної вартості доставки</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm text-zinc-600 mb-2">Порт відправки</label>
                        <select
                          value={port}
                          onChange={(e) => setPort(e.target.value)}
                          className="w-full border border-zinc-200 rounded-lg px-4 py-3"
                          data-testid="port-select"
                        >
                          <option value="NJ">New Jersey</option>
                          <option value="GA">Georgia (Savannah)</option>
                          <option value="TX">Texas (Houston)</option>
                          <option value="CA">California (Long Beach)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-zinc-600 mb-2">Тип авто</label>
                        <select
                          value={vehicleType}
                          onChange={(e) => setVehicleType(e.target.value)}
                          className="w-full border border-zinc-200 rounded-lg px-4 py-3"
                          data-testid="vehicle-type-select"
                        >
                          <option value="sedan">Седан</option>
                          <option value="suv">SUV</option>
                          <option value="bigSUV">Великий SUV / Позашляховик</option>
                          <option value="pickup">Пікап</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleCalculate}
                      disabled={calcLoading}
                      className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      data-testid="calculate-btn"
                    >
                      {calcLoading ? (
                        <SpinnerGap size={20} className="animate-spin" />
                      ) : (
                        <>
                          <Calculator size={20} />
                          Розрахувати вартість доставки
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Quote Result */}
                {quote && (
                  <div className="bg-white rounded-xl border-2 border-green-500 p-6" data-testid="quote-result">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Receipt size={24} className="text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-900">Розрахунок #{quote.quote?.quoteNumber || 'N/A'}</h3>
                        <p className="text-sm text-zinc-500">Повна вартість авто з доставкою</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <BreakdownRow label="Ціна авто" value={quote.breakdown?.carPrice} icon={Car} />
                      <BreakdownRow label="Аукціонний збір" value={quote.breakdown?.auctionFee} />
                      <BreakdownRow label="Страхування" value={quote.breakdown?.insurance} />
                      <BreakdownRow label="Доставка по США" value={quote.breakdown?.usaInland} icon={Truck} />
                      <BreakdownRow label="Морська доставка" value={quote.breakdown?.ocean} icon={Anchor} />
                      <BreakdownRow label="Обробка в США" value={quote.breakdown?.usaHandlingFee} />
                      <BreakdownRow label="Банківська комісія" value={quote.breakdown?.bankFee} />
                      <BreakdownRow label="Обробка в порту ЄС" value={quote.breakdown?.euPortHandlingFee} />
                      <BreakdownRow label="Доставка в Болгарію" value={quote.breakdown?.euDelivery} icon={Truck} />
                      <BreakdownRow label="Митні платежі" value={quote.breakdown?.customs} />
                      <BreakdownRow label="Документація" value={quote.breakdown?.documentationFee} />
                      <BreakdownRow label="Оформлення титулу" value={quote.breakdown?.titleFee} />
                      <BreakdownRow label="Сервісний збір" value={quote.breakdown?.companyFee} />
                    </div>

                    <div className="mt-6 pt-6 border-t-2 border-zinc-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-semibold text-zinc-900">Орієнтовна вартість</span>
                        <span className="text-3xl font-bold text-green-600" data-testid="total-price">
                          ${quote.totals?.visible?.toLocaleString() || '—'}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-500 mt-2">
                        * Фінальна ціна може відрізнятись залежно від курсу та умов аукціону
                      </p>
                    </div>

                    {!leadSuccess && (
                      <button
                        onClick={() => setShowLeadForm(true)}
                        className="w-full mt-6 bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        data-testid="buy-btn"
                      >
                        <Car size={20} />
                        Хочу купити це авто
                      </button>
                    )}

                    {leadSuccess && (
                      <div className="mt-6 p-4 bg-green-50 rounded-lg flex items-center gap-3">
                        <Check size={24} className="text-green-600" />
                        <div>
                          <p className="font-semibold text-green-800">Заявка успішно створена!</p>
                          <p className="text-sm text-green-600">Менеджер зв'яжеться з вами найближчим часом</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sources */}
                {result.sources?.length > 0 && (
                  <div className="bg-white rounded-xl border border-zinc-200 p-6">
                    <h3 className="font-semibold text-zinc-900 mb-4">
                      Знайдено в {result.sources.length} джерелах
                    </h3>
                    <div className="space-y-2">
                      {result.sources.map((sourceName, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-zinc-600">{sourceName}</span>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500" />
                            <span className="text-zinc-400">Знайдено</span>
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
                <div className="bg-white rounded-xl border border-zinc-200 p-6 sticky top-6">
                  {result.price && (
                    <div className="text-center mb-6">
                      <p className="text-sm text-zinc-500">Ціна на аукціоні</p>
                      <p className="text-4xl font-bold text-zinc-900">
                        ${result.price.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {result.saleDate && new Date(result.saleDate) > new Date() && (
                    <div className="text-center pb-6 border-b border-zinc-100">
                      <p className="text-sm text-zinc-500 mb-2">До аукціону</p>
                      <AuctionTimer date={result.saleDate} />
                    </div>
                  )}

                  <button
                    onClick={() => setShowLeadForm(true)}
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
          </div>
        </section>
      )}

      {/* Not Found */}
      {result && (result.message || !result.vin) && (
        <section className="py-12">
          <div className="container mx-auto px-4">
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
          </div>
        </section>
      )}

      {/* Lead Form Modal */}
      {showLeadForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-zinc-900 mb-2">
              {quote ? 'Оформити заявку' : 'Замовити дзвінок'}
            </h3>
            <p className="text-zinc-500 mb-6">
              Залиште контакти і ми зв'яжемось з вами
            </p>

            <form onSubmit={quote ? handleLeadSubmit : handleQuickLead} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-600 mb-1">Ім'я *</label>
                  <input
                    type="text"
                    value={leadForm.firstName}
                    onChange={(e) => setLeadForm(f => ({ ...f, firstName: e.target.value }))}
                    className="w-full border border-zinc-200 rounded-lg px-4 py-3"
                    required
                    data-testid="lead-firstname"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-600 mb-1">Прізвище</label>
                  <input
                    type="text"
                    value={leadForm.lastName}
                    onChange={(e) => setLeadForm(f => ({ ...f, lastName: e.target.value }))}
                    className="w-full border border-zinc-200 rounded-lg px-4 py-3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-600 mb-1">Телефон *</label>
                <input
                  type="tel"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-zinc-200 rounded-lg px-4 py-3"
                  placeholder="+380..."
                  required
                  data-testid="lead-phone"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-600 mb-1">Email</label>
                <input
                  type="email"
                  value={leadForm.email}
                  onChange={(e) => setLeadForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-zinc-200 rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-600 mb-1">Коментар</label>
                <textarea
                  value={leadForm.comment}
                  onChange={(e) => setLeadForm(f => ({ ...f, comment: e.target.value }))}
                  className="w-full border border-zinc-200 rounded-lg px-4 py-3 min-h-[100px]"
                  placeholder="Додаткова інформація..."
                />
              </div>

              {quote && (
                <div className="p-4 bg-zinc-50 rounded-lg">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-500">VIN:</span>
                    <span className="font-mono">{result?.vin}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Орієнтовна вартість:</span>
                    <span className="font-semibold">${quote.totals?.visible?.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLeadForm(false)}
                  className="flex-1 border border-zinc-200 text-zinc-700 py-3 rounded-lg font-semibold hover:bg-zinc-50"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  disabled={leadLoading}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  data-testid="submit-lead-btn"
                >
                  {leadLoading ? (
                    <SpinnerGap size={20} className="animate-spin" />
                  ) : (
                    <>
                      <Check size={20} />
                      Відправити
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

// Breakdown Row
const BreakdownRow = ({ label, value, icon: Icon }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between items-center py-2 border-b border-zinc-100">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-zinc-400" />}
        <span className="text-sm text-zinc-600">{label}</span>
      </div>
      <span className="font-medium text-zinc-900">${Number(value).toLocaleString()}</span>
    </div>
  );
};

export default VinCheckPage;
