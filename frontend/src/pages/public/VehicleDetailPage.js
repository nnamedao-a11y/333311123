/**
 * Vehicle Detail Page
 * 
 * Детальна сторінка авто
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Gauge, 
  CurrencyDollar,
  Images,
  Phone,
  CheckCircle,
  Warning,
  Fire,
  Share,
  Heart
} from '@phosphor-icons/react';
import AuctionTimer from '../../components/public/AuctionTimer';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const VehicleDetailPage = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showLeadForm, setShowLeadForm] = useState(false);

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      // Try to get from auction-ranking first
      const res = await axios.get(`${API_URL}/api/auction-ranking/vehicle/${id}`);
      if (res.data && res.data.length > 0) {
        setVehicle(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching vehicle:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <Warning size={48} className="mx-auto text-amber-500 mb-4" />
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">
            Авто не знайдено
          </h2>
          <Link
            to="/vehicles"
            className="text-blue-600 hover:underline"
          >
            Повернутись до каталогу
          </Link>
        </div>
      </div>
    );
  }

  const displayTitle = vehicle.title || 
    `${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''}`.trim() || 
    'Автомобіль';

  return (
    <div className="min-h-screen bg-zinc-50" data-testid="vehicle-detail-page">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-zinc-200">
        <div className="container mx-auto px-4 py-4">
          <Link 
            to="/vehicles" 
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Назад до каталогу
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-white rounded-xl overflow-hidden border border-zinc-200">
              <div className="aspect-video relative bg-zinc-100">
                {vehicle.images?.length > 0 ? (
                  <img
                    src={vehicle.images[selectedImage]}
                    alt={displayTitle}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/images/car-placeholder.jpg'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    <Images size={64} />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {vehicle.rankingScore >= 0.65 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                      <Fire size={14} weight="fill" />
                      HOT
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="bg-white/90 p-2 rounded-full hover:bg-white transition-colors">
                    <Heart size={20} className="text-zinc-600" />
                  </button>
                  <button className="bg-white/90 p-2 rounded-full hover:bg-white transition-colors">
                    <Share size={20} className="text-zinc-600" />
                  </button>
                </div>
              </div>

              {/* Thumbnails */}
              {vehicle.images?.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {vehicle.images.slice(0, 10).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`flex-shrink-0 w-24 h-18 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === i ? 'border-zinc-900' : 'border-transparent hover:border-zinc-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Info */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900 mb-2">
                {displayTitle}
              </h1>
              
              <p className="text-sm text-zinc-400 font-mono mb-6">
                VIN: {vehicle.vin}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {vehicle.year && (
                  <div className="p-4 bg-zinc-50 rounded-lg">
                    <div className="flex items-center gap-2 text-zinc-400 mb-1">
                      <Calendar size={16} />
                      <span className="text-xs">Рік</span>
                    </div>
                    <p className="font-semibold text-zinc-900">{vehicle.year}</p>
                  </div>
                )}
                {vehicle.mileage && (
                  <div className="p-4 bg-zinc-50 rounded-lg">
                    <div className="flex items-center gap-2 text-zinc-400 mb-1">
                      <Gauge size={16} />
                      <span className="text-xs">Пробіг</span>
                    </div>
                    <p className="font-semibold text-zinc-900">{vehicle.mileage.toLocaleString()} mi</p>
                  </div>
                )}
                {vehicle.location && (
                  <div className="p-4 bg-zinc-50 rounded-lg">
                    <div className="flex items-center gap-2 text-zinc-400 mb-1">
                      <MapPin size={16} />
                      <span className="text-xs">Локація</span>
                    </div>
                    <p className="font-semibold text-zinc-900">{vehicle.location}</p>
                  </div>
                )}
                {vehicle.lotNumber && (
                  <div className="p-4 bg-zinc-50 rounded-lg">
                    <div className="flex items-center gap-2 text-zinc-400 mb-1">
                      <span className="text-xs">#</span>
                      <span className="text-xs">Лот</span>
                    </div>
                    <p className="font-semibold text-zinc-900">{vehicle.lotNumber}</p>
                  </div>
                )}
              </div>

              {vehicle.damageType && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-amber-800 font-medium">
                    <Warning size={18} className="inline mr-2" />
                    Тип пошкодження: {vehicle.damageType}
                  </p>
                </div>
              )}
            </div>

            {/* Source Info */}
            {vehicle.source && (
              <div className="bg-white rounded-xl border border-zinc-200 p-6">
                <h3 className="font-semibold text-zinc-900 mb-4">Джерело</h3>
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-500" />
                  <span className="text-zinc-600">{vehicle.source}</span>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6 sticky top-24">
              {vehicle.price && (
                <div className="text-center mb-6">
                  <p className="text-sm text-zinc-500">Ціна на аукціоні</p>
                  <p className="text-4xl font-bold text-zinc-900">
                    ${vehicle.price.toLocaleString()}
                  </p>
                </div>
              )}

              {vehicle.auctionDate && new Date(vehicle.auctionDate) > new Date() && (
                <div className="text-center pb-6 border-b border-zinc-100">
                  <p className="text-sm text-zinc-500 mb-2">До аукціону залишилось</p>
                  <AuctionTimer date={vehicle.auctionDate} />
                </div>
              )}

              <button
                onClick={() => setShowLeadForm(true)}
                className="w-full mt-6 bg-zinc-900 text-white py-4 rounded-lg font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                data-testid="buy-btn"
              >
                <Phone size={20} />
                Хочу купити
              </button>

              <Link
                to={`/vin-check/${vehicle.vin}`}
                className="w-full mt-3 border border-zinc-200 text-zinc-700 py-3 rounded-lg font-semibold hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2"
              >
                Перевірити VIN
              </Link>

              <p className="text-center text-xs text-zinc-400 mt-4">
                Ми зв'яжемось з вами протягом 15 хвилин
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailPage;
