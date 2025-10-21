import React, { useState, useEffect } from 'react';
import { AIComponentProps } from '@frontai/types';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
  company: {
    name: string;
  };
}

const UserDetails: React.FC<AIComponentProps> = ({
  intent,
  setFurtherInstructions,
  mainAction,
}) => {
  const { parameters } = intent;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(parameters);
    fetchUserDetails(parameters?.userId as number);
  }, [parameters?.userId]);

  if (!parameters?.userId) {
    return null;
  }

  const onBack = () => {
    if (mainAction) mainAction();
  };

  const fetchUserDetails = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/users/${id}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError('An error occurred while fetching user details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={onBack}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to User Table
        </button>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="w-full">
      <button
        onClick={onBack}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Back to User Table
      </button>
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h2 className="text-2xl font-bold text-payoneer-blue mb-4">
          {user.name}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-payoneer-orange mb-2">
              Contact Information
            </h3>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Phone:</strong> {user.phone}
            </p>
            <p>
              <strong>Website:</strong> {user.website}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-payoneer-orange mb-2">
              Address
            </h3>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-payoneer-orange mb-2">
              Company
            </h3>
            <p>
              <strong>Name:</strong> {user.company.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
