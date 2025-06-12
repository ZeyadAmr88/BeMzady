import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../component/contexts/AuthContext';

const API_BASE_URL = 'https://be-mazady.vercel.app/api';

export const useOrders = (status = '') => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError(null);

                const url = status
                    ? `${API_BASE_URL}/orders/my-orders?status=${status}`
                    : `${API_BASE_URL}/orders/my-orders`;

                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }

                const data = await response.json();
                setOrders(data.data || []);
            } catch (err) {
                setError(err.message);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchOrders();
        }
    }, [token, status]);

    return { orders, loading, error };
};

export const useOrderDetails = (orderId) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch order details');
                }

                const data = await response.json();
                setOrder(data.data || null);
            } catch (err) {
                setError(err.message);
                setOrder(null);
            } finally {
                setLoading(false);
            }
        };

        if (token && orderId) {
            fetchOrderDetails();
        }
    }, [token, orderId]);

    return { order, loading, error };
};

export const useUserProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${API_BASE_URL}/users/MyProfile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }

                const data = await response.json();
                setProfile(data.data || null);
            } catch (err) {
                setError(err.message);
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchProfile();
        }
    }, [token]);

    return { profile, loading, error };
}; 