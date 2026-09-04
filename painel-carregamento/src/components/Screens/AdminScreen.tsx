import React, { useEffect, useState } from 'react';
import {
  Users,
  Car,
  Zap,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';

import {
  getAdminCustomers,
  getAdminVehicles,
  getAdminSessions,
  type AdminCustomer,
  type AdminVehicle,
  type AdminSession,
} from '../../services/apiClient';

interface AdminScreenProps {
  onBack: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ onBack }) => {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [customersData, vehiclesData, sessionsData] =
        await Promise.all([
          getAdminCustomers(),
          getAdminVehicles(),
          getAdminSessions(),
        ]);

      setCustomers(customersData);
      setVehicles(vehiclesData);
      setSessions(sessionsData);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalEnergy = sessions.reduce(
    (total, session) => total + Number(session.energy_used_kwh || 0),
    0
  );

  const totalRevenue = sessions.reduce(
    (total, session) => total + Number(session.total_cost || 0),
    0
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-[#2E2E2E] border border-[#3A3A3A] flex items-center justify-center text-[#A0A0A0] hover:text-white hover:bg-[#3A3A3A]"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-xl font-bold text-[#F5F5F5]">
              Painel Administrativo
            </h1>

            <p className="text-sm text-[#A0A0A0]">
              Monitoramento da estação
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2E2E2E] border border-[#3A3A3A] text-[#A0A0A0] hover:text-white"
        >
          <RefreshCw size={16} />
          Atualizar
        </button>

      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-[#FF6B35]/10 border border-[#FF6B35]/30 text-[#FF6B35]">
          {error}
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

        <div className="bg-[#242424] border border-[#3A3A3A] rounded-xl p-4">
          <Users size={20} className="text-[#1E90FF] mb-2" />

          <p className="text-xs text-[#A0A0A0]">
            Clientes
          </p>

          <p className="text-2xl font-bold text-white">
            {customers.length}
          </p>
        </div>

        <div className="bg-[#242424] border border-[#3A3A3A] rounded-xl p-4">
          <Car size={20} className="text-[#00D084] mb-2" />

          <p className="text-xs text-[#A0A0A0]">
            Veículos
          </p>

          <p className="text-2xl font-bold text-white">
            {vehicles.length}
          </p>
        </div>

        <div className="bg-[#242424] border border-[#3A3A3A] rounded-xl p-4">
          <Zap size={20} className="text-[#FFD166] mb-2" />

          <p className="text-xs text-[#A0A0A0]">
            Sessões
          </p>

          <p className="text-2xl font-bold text-white">
            {sessions.length}
          </p>
        </div>

        <div className="bg-[#242424] border border-[#3A3A3A] rounded-xl p-4">

          <p className="text-xs text-[#A0A0A0] mb-2">
            Energia total
          </p>

          <p className="text-2xl font-bold text-[#1E90FF]">
            {totalEnergy.toFixed(1)}
          </p>

          <p className="text-xs text-[#6A6A6A]">
            kWh
          </p>
        </div>

      </div>

      {/* Revenue */}
      <div className="bg-[#242424] border border-[#3A3A3A] rounded-xl p-4">

        <p className="text-sm text-[#A0A0A0]">
          Receita total
        </p>

        <p className="text-2xl font-bold text-[#00D084]">
          R$ {totalRevenue.toFixed(2)}
        </p>

      </div>

      {/* Sessions */}
      <div className="bg-[#242424] border border-[#3A3A3A] rounded-xl overflow-hidden">

        <div className="p-4 border-b border-[#3A3A3A]">
          <h2 className="font-bold text-white">
            Sessões de carregamento
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[#A0A0A0]">
            Carregando...
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-[#A0A0A0]">
            Nenhuma sessão encontrada.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-[#1A1A1A]">
                <tr>
                  <th className="text-left p-3 text-[#A0A0A0]">
                    Cliente
                  </th>

                  <th className="text-left p-3 text-[#A0A0A0]">
                    Veículo
                  </th>

                  <th className="text-left p-3 text-[#A0A0A0]">
                    Estação
                  </th>

                  <th className="text-left p-3 text-[#A0A0A0]">
                    Energia
                  </th>

                  <th className="text-left p-3 text-[#A0A0A0]">
                    Custo
                  </th>

                  <th className="text-left p-3 text-[#A0A0A0]">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>

                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="border-t border-[#3A3A3A]"
                  >

                    <td className="p-3 text-white">
                      {session.first_name} {session.last_name}
                    </td>

                    <td className="p-3 text-[#A0A0A0]">
                      {session.model}
                      <br />
                      <span className="text-xs">
                        {session.plate}
                      </span>
                    </td>

                    <td className="p-3 text-[#A0A0A0]">
                      {session.station_code}
                    </td>

                    <td className="p-3 text-[#1E90FF] font-semibold">
                      {Number(session.energy_used_kwh).toFixed(2)} kWh
                    </td>

                    <td className="p-3 text-[#00D084] font-semibold">
                      R$ {Number(session.total_cost).toFixed(2)}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          session.status === 'completed'
                            ? 'bg-[#00D084]/20 text-[#00D084]'
                            : 'bg-[#FFD166]/20 text-[#FFD166]'
                        }`}
                      >
                        {session.status}
                      </span>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* Customers */}
      <div className="bg-[#242424] border border-[#3A3A3A] rounded-xl overflow-hidden">

        <div className="p-4 border-b border-[#3A3A3A]">
          <h2 className="font-bold text-white">
            Clientes
          </h2>
        </div>

        <div className="divide-y divide-[#3A3A3A]">

          {customers.map((customer) => (
            <div
              key={customer.id}
              className="p-4 flex justify-between"
            >
              <span className="text-white">
                {customer.first_name} {customer.last_name}
              </span>

              <span className="text-[#6A6A6A]">
                ID #{customer.id}
              </span>
            </div>
          ))}

        </div>

      </div>

      {/* Vehicles */}
      <div className="bg-[#242424] border border-[#3A3A3A] rounded-xl overflow-hidden">

        <div className="p-4 border-b border-[#3A3A3A]">
          <h2 className="font-bold text-white">
            Veículos
          </h2>
        </div>

        <div className="divide-y divide-[#3A3A3A]">

          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="p-4 flex items-center justify-between"
            >

              <div>
                <p className="text-white font-medium">
                  {vehicle.model}
                </p>

                <p className="text-sm text-[#A0A0A0]">
                  {vehicle.plate}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-[#1E90FF]">
                  {vehicle.battery_capacity_kwh} kWh
                </p>

                <p className="text-xs text-[#6A6A6A]">
                  {vehicle.max_power_kw} kW
                </p>
              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
};