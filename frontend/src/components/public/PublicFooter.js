/**
 * Public Footer Component
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Envelope, MapPin } from '@phosphor-icons/react';

const PublicFooter = () => {
  return (
    <footer className="bg-zinc-900 text-zinc-400 py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company */}
          <div>
            <img 
              src="/images/logo.svg" 
              alt="BIBI Cars" 
              className="h-8 w-auto mb-4 brightness-0 invert"
            />
            <p className="text-sm">
              Авто з аукціонів США та Європи. Перевірка VIN, доставка під ключ.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Навігація</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Головна</Link></li>
              <li><Link to="/vehicles" className="hover:text-white transition-colors">Каталог авто</Link></li>
              <li><Link to="/vin-check" className="hover:text-white transition-colors">VIN перевірка</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Послуги</h4>
            <ul className="space-y-2 text-sm">
              <li>Підбір авто з аукціонів</li>
              <li>Доставка в Україну</li>
              <li>Розмитнення</li>
              <li>Страхування</li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="text-white font-semibold mb-4">Контакти</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <span>+380 (XX) XXX-XX-XX</span>
              </li>
              <li className="flex items-center gap-2">
                <Envelope size={16} />
                <span>info@bibicars.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Київ, Україна</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-8 pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} BIBI Cars. Всі права захищені.</p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
