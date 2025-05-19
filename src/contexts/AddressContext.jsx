import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from '../component/contexts/AuthContext';

const AddressContext = createContext();

export const AddressProvider = ({ children }) => {
    const [address, setAddress] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user?.address) {
            setAddress(user.address);
        }
    }, [user]);

    const updateAddress = (newAddress) => {
        setAddress(newAddress);
    };

    return (
        <AddressContext.Provider value={{ address, updateAddress }}>
            {children}
        </AddressContext.Provider>
    );
};

export const useAddress = () => {
    const context = useContext(AddressContext);
    if (!context) {
        throw new Error('useAddress must be used within an AddressProvider');
    }
    return context;
}; 