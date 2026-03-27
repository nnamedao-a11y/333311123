/**
 * Home Page
 * 
 * Головна сторінка публічного сайту
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Fire, Timer, TrendUp, Car } from '@phosphor-icons/react';
import Hero from '../../components/public/Hero';
import AuctionSection from '../../components/public/AuctionSection';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const HomePage = () => {
  const [hotAuctions, setHotAuctions] = useState([]);
  const [endingSoon, setEndingSoon] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hotRes, endingRes, upcomingRes, statsRes] = await Promise.all([
          axios.get(`${API_URL}/api/auction-ranking/hot?limit=8`),
          axios.get(`${API_URL}/api/auction-ranking/ending-soon?limit=8`),
          axios.get(`${API_URL}/api/auction-ranking/upcoming?limit=8`),
          axios.get(`${API_URL}/api/auction-ranking/stats`),
        ]);

        setHotAuctions(hotRes.data || []);
        setEndingSoon(endingRes.data || []);
        setUpcoming(upcomingRes.data || []);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Error fetching auctions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div data-testid="home-page">
      {/* Hero */}
      <Hero />

      {/* Stats Bar */}
      {stats && (
        <section className="bg-white border-b border-zinc-200 py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-zinc-900">{stats.total || 0}</p>
                <p className="text-sm text-zinc-500">Всього авто</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-zinc-900">{stats.active || 0}</p>
                <p className="text-sm text-zinc-500">Активних лотів</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-500">{stats.upcoming || 0}</p>
                <p className="text-sm text-zinc-500">Майбутніх аукціонів</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-500">{stats.hot || 0}</p>
                <p className="text-sm text-zinc-500">Гарячих лотів</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500">Завантаження...</p>
        </div>
      ) : (
        <>
          {/* Hot Auctions */}
          <AuctionSection
            title="Гарячі лоти"
            icon={Fire}
            data={hotAuctions}
            emptyText="Наразі немає гарячих лотів"
          />

          {/* Ending Soon */}
          <div className="bg-orange-50">
            <AuctionSection
              title="Закінчуються скоро"
              icon={Timer}
              data={endingSoon}
              emptyText="Немає аукціонів що закінчуються найближчим часом"
            />
          </div>

          {/* Upcoming */}
          <AuctionSection
            title="Майбутні аукціони"
            icon={TrendUp}
            data={upcoming}
            emptyText="Немає запланованих аукціонів"
          />
        </>
      )}

      {/* CTA Section */}
      <section className="bg-zinc-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Хочете купити авто з аукціону?
          </h2>
          <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
            Залиште заявку і наші менеджери допоможуть підібрати авто під ваш бюджет та потреби
          </p>
          <a 
            href="/vin-check"
            className="inline-flex items-center gap-2 bg-white text-zinc-900 px-8 py-4 rounded-xl font-semibold hover:bg-zinc-100 transition-colors"
            data-testid="cta-button"
          >
            <Car size={20} />
            Перевірити VIN
          </a>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
