import React from 'react';
import { User, Settings, Download, LogOut, Edit } from 'lucide-react';
import { UserProfile } from '../types';
import { exportUserData, clearCurrentUser } from '../utils/storage';

interface UserMenuProps {
  user: UserProfile;
  onLogout: () => void;
  onEditProfile: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout, onEditProfile }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleExport = () => {
    try {
      const data = exportUserData(user.id);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ortho-logique-${user.name}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsOpen(false);
    } catch (error) {
      alert('Erreur lors de l\'export des données');
    }
  };

  const handleLogout = () => {
    clearCurrentUser();
    onLogout();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
      >
        <span className="text-2xl">{user.avatar}</span>
        <div className="text-left">
          <p className="font-medium text-gray-800">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
            <div className="p-3 border-b">
              <p className="font-medium text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              {user.age && (
                <p className="text-sm text-gray-500">{user.age} ans</p>
              )}
            </div>
            
            <div className="py-1">
              <button
                onClick={() => {
                  onEditProfile();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Modifier le profil
              </button>
              
              <button
                onClick={handleExport}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exporter mes données
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;