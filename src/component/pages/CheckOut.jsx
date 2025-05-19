"use client"

import React, { useContext, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, CreditCard, MapPin } from "lucide-react"
import { AuthContext } from "../contexts/AuthContext"
import { useAddress } from "../contexts/AddressContext"
import { toast } from "react-toastify"

const Checkout = () => {
    const { user } = useContext(AuthContext)
    const { address } = useAddress()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Check if user has an address
        if (!address || address.trim() === '') {
            toast.error("Please add your address in your profile before proceeding with checkout", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            navigate("/profile");
            return;
        }
    }, [address, navigate]);

    // eslint-disable-next-line no-unused-vars
    const [step, setStep] = useState(1)

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <Link to="/cart" className="text-rose-600 hover:text-rose-700 flex items-center">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Cart
                </Link>
            </div>

            <h1 className="text-2xl font-bold mb-6">Checkout</h1>

            {/* Address Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                <div className="flex items-center mb-4">
                    <MapPin className="text-rose-600 mr-2" size={20} />
                    <h2 className="text-lg font-semibold">Shipping Address</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300">{address}</p>
                <Link
                    to="/profile"
                    className="text-rose-600 hover:text-rose-700 text-sm mt-2 inline-block"
                >
                    Change Address
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                <div className="text-center py-12">
                    <CreditCard size={64} className="mx-auto text-gray-400 mb-4" />
                    <h2 className="text-xl font-medium mb-2">This page is not implemented yet</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        The checkout page will allow users to complete their purchase by providing shipping and payment information.
                    </p>
                    <Link to="/cart" className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors">
                        Back to Cart
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Checkout
