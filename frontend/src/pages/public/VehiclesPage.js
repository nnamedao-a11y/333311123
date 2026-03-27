/**
 * Vehicles Page
 * 
 * Каталог всіх авто
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MagnifyingGlass, Funnel, SortAscending, Car } from '@phosphor-icons/react';
import VehicleCard from '../../components/public/VehicleCard';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'hot', 'ending', 'upcoming'
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, [filter]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      let endpoint = '/api/auction-ranking/top?limit=50';
      
      if (filter === 'hot') {
        endpoint = '/api/auction-ranking/hot?limit=50';
      } else if (filter === 'ending') {
        endpoint = '/api/auction-ranking/ending-soon?limit=50';
      } else if (filter === 'upcoming') {
        endpoint = '/api/auction-ranking/upcoming?limit=50&days=14';
      }

      const res = await axios.get(`${API_URL}${endpoint}`);
      setVehicles(res.data || []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      v.vin?.toLowerCase().includes(searchLower) ||
      v.title?.toLowerCase().includes(searchLower) ||
      v.make?.toLowerCase().includes(searchLower) ||
      v.model?.toLowerCase().includes(searchLower)
    );
  });

  const filterOptions = [
    { value: 'all', label: 'Всі авто' },
    { value: 'hot', label: 'Гарячі' },
    { value: 'ending', label: 'Закінчуються' },
    { value: 'upcoming', label: 'Майбутні' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50" data-testid="vehicles-page">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-3">
                <Car size={32} weight="fill" />
                Каталог авто
              </h1>
              <p className="text-zinc-500 mt-1">
                {filteredVehicles.length} авто з аукціонів
              </p>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <MagnifyingGlass 
                  size={18} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" 
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Пошук по VIN, марці..."
                  className="pl-10 pr-4 py-2.5 border border-zinc-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  data-testid="vehicles-search"
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mt-6">
            <Funnel size={18} className="text-zinc-400" />
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === opt.value
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
                data-testid={`filter-${opt.value}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-500">Завантаження...</p>
          </div>
        ) : filteredVehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle._id || vehicle.vin} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <Car size={48} className="mx-auto text-zinc-300 mb-4" />
            <p className="text-zinc-500">Авто не знайдено</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehiclesPage;
