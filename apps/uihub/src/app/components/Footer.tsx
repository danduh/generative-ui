import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const Footer: React.FC = () => {
  const { darkMode, toggleDarkMode, apiUsage } = useContext(AppContext);

  return (
    <footer className="bg-gray-200 p-4 flex justify-between items-center">
      <div>
        <button
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
          onClick={toggleDarkMode}
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Save/Export
        </button>
      </div>
      <div>API Usage: {apiUsage}</div>
    </footer>
  );
}

export default Footer;

