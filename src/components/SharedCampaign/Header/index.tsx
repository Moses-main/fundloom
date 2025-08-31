import React from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onDonateClick: () => void;
  title: string;
  showDonateButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onDonateClick, 
  title, 
  showDonateButton = true 
}) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {title}
            </h1>
          </div>
          
          {showDonateButton && (
            <Button
              onClick={onDonateClick}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              Donate Now
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
