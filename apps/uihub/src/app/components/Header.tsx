import React from 'react';
import PayoLogo from '../../assets/logo.png';

interface HeaderProps {
  showCanvas: boolean;
  setShowCanvas: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ showCanvas, setShowCanvas }) => {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">
        <img
          src={PayoLogo}
          alt="Payo Bot"
          className="inline-block max-h-80"
        />
      </div>
      <nav>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setShowCanvas(!showCanvas)}
        >
          {showCanvas ? 'Chat Only' : 'Chat + Canvas'}
        </button>
      </nav>
    </header>
  );
};

export default Header;
