import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Building2, FileText, UserCheck, Wrench, 
  LayoutDashboard, Search, LogOut,
  CheckCircle, XCircle, Trash2
} from 'lucide-react';

// ==================== API SERVICE ====================
const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== ADMIN DASHBOARD COMPONENT ====================
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [prestataires, setPrestataires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [activeTab, roleFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      switch(activeTab) {
        case 'dashboard':
          await fetchStats();
          break;
        case 'users':
          await fetchUsers();
          break;
        case 'properties':
          await fetchProperties();
          break;
        case 'documents':
          await fetchDocuments();
          break;
        case 'tenants':
          await fetchTenants();
          break;
        case 'prestataires':
          await fetchPrestataires();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const response = await api.get('/admin/dashboard/');
    setStats(response.data);
  };

  const fetchUsers = async () => {
    let url = '/admin/users/';
    if (roleFilter !== 'all') url += `?role=${roleFilter}`;
    const response = await api.get(url);
    setUsers(response.data.results || response.data);
  };

  const fetchProperties = async () => {
    const response = await api.get('/admin/properties/');
    setProperties(response.data.results || response.data);
  };

  const fetchDocuments = async () => {
    const response = await api.get('/admin/documents/');
    setDocuments(response.data.results || response.data);
  };

  const fetchTenants = async () => {
    const response = await api.get('/admin/tenants/');
    setTenants(response.data.results || response.data);
  };

  const fetchPrestataires = async () => {
    const response = await api.get('/admin/prestataires/');
    setPrestataires(response.data.results || response.data);
  };

  const toggleUserStatus = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/toggle-active/`);
      fetchUsers();
    } catch (error) {
      alert('Erreur lors de la modification du statut');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    try {
      await api.delete(`/admin/users/${userId}/delete-user/`);
      fetchUsers();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const deleteProperty = async (propertyId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette propriété ?')) return;
    try {
      await api.delete(`/admin/properties/${propertyId}/delete_property/`);
      fetchProperties();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  // ==================== TABS ====================
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'properties', label: 'Propriétés', icon: Building2 },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'tenants', label: 'Locataires', icon: UserCheck },
    { id: 'prestataires', label: 'Prestataires', icon: Wrench },
  ];

  // ==================== RENDER DASHBOARD ====================
  const renderDashboard = () => {
    const statCards = [
      {
        title: 'Total Utilisateurs',
        value: stats?.total_users || 0,
        icon: Users,
        color: 'bg-blue-500',
      },
      {
        title: 'Propriétaires',
        value: stats?.total_proprietaires || 0,
        icon: UserCheck,
        color: 'bg-green-500',
      },
      {
        title: 'Locataires',
        value: stats?.total_locataires || 0,
        icon: Users,
        color: 'bg-purple-500',
      },
      {
        title: 'Propriétés',
        value: stats?.total_properties || 0,
        icon: Building2,
        color: 'bg-orange-500',
      },
      {
        title: 'Documents',
        value: stats?.total_documents || 0,
        icon: FileText,
        color: 'bg-pink-500',
      },
      {
        title: 'Prestataires',
        value: stats?.total_prestataires || 0,
        icon: Wrench,
        color: 'bg-indigo-500',
      },
    ];

    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} rounded-full p-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Utilisateurs Récents</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.recent_users?.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                        ${user.role === 'proprietaire' ? 'bg-green-100 text-green-800' : 
                          user.role === 'locataire' ? 'bg-blue-100 text-blue-800' : 
                          'bg-purple-100 text-purple-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.date_joined).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ==================== RENDER USERS ====================
  const renderUsers = () => {
    const filteredUsers = users.filter(user =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div>
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Tous les rôles</option>
            <option value="proprietaire">Propriétaires</option>
            <option value="locataire">Locataires</option>
            <option value="admin">Administrateurs</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full
                      ${user.role === 'proprietaire' ? 'bg-green-100 text-green-800' :
                        user.role === 'locataire' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.telephone || '-'}</td>
                  <td className="px-6 py-4">
                    {user.is_active ? (
                      <span className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4 mr-1" /> Actif
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600 text-sm">
                        <XCircle className="w-4 h-4 mr-1" /> Inactif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`p-2 rounded-lg ${
                          user.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {user.is_active ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                      </button>
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ==================== RENDER PROPERTIES ====================
  const renderProperties = () => {
    const filteredProperties = properties.filter(prop =>
      prop.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.adresse?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div>
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <input
            type="text"
            placeholder="Rechercher une propriété..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{property.titre}</h3>
                    <p className="text-sm text-gray-500">{property.adresse}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full
                    ${property.statut === 'disponible' ? 'bg-green-100 text-green-800' :
                      property.statut === 'loué' ? 'bg-blue-100 text-blue-800' :
                      'bg-orange-100 text-orange-800'}`}>
                    {property.statut}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Type: {property.type}</p>
                  <p>Prix: {property.prix?.toLocaleString()} FCFA</p>
                  <p>Propriétaire: {property.owner_name}</p>
                </div>
                <button
                  onClick={() => deleteProperty(property.id)}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ==================== RENDER DOCUMENTS ====================
  const renderDocuments = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Propriétaire</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((doc) => (
            <tr key={doc.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{doc.title}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{doc.category}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{doc.owner_name}</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {new Date(doc.date).toLocaleDateString('fr-FR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // ==================== RENDER TENANTS ====================
  const renderTenants = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Propriété</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loyer</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tenants.map((tenant) => (
            <tr key={tenant.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{tenant.full_name}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{tenant.email}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{tenant.property_title || '-'}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{tenant.monthly_rent?.toLocaleString()} FCFA</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // ==================== RENDER PRESTATAIRES ====================
  const renderPrestataires = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {prestataires.map((prest) => (
        <div key={prest.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{prest.nom}</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Contact: {prest.contact}</p>
            <p>Téléphone: {prest.telephone}</p>
            <p>Zone: {prest.zone}</p>
            <p>Note: {prest.note}/5 ⭐</p>
          </div>
        </div>
      ))}
    </div>
  );

  // ==================== MAIN RENDER ====================
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-blue-600">HabiPro Admin</h2>
        </div>
        
        <nav className="px-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchTerm('');
                  setRoleFilter('all');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'users' && renderUsers()}
              {activeTab === 'properties' && renderProperties()}
              {activeTab === 'documents' && renderDocuments()}
              {activeTab === 'tenants' && renderTenants()}
              {activeTab === 'prestataires' && renderPrestataires()}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;