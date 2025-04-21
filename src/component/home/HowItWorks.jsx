import React from "react"
import { Search, Gavel, CreditCard, Package } from "lucide-react"

const HowItWorks = () => {
    const steps = [
        {
            icon: <Search size={40} className="text-rose-600" />,
            title: "Find Items",
            description: "Browse through our extensive collection of auctions and find items that interest you.",
        },
        {
            icon: <Gavel size={40} className="text-rose-600" />,
            title: "Place Bids",
            description: "Place competitive bids on your favorite items and stay updated on auction progress.",
        },
        {
            icon: <CreditCard size={40} className="text-rose-600" />,
            title: "Win & Pay",
            description: "When you win an auction, complete your purchase securely through our payment system.",
        },
        {
            icon: <Package size={40} className="text-rose-600" />,
            title: "Receive Item",
            description: "The seller ships your item directly to you, and you can track delivery status.",
        },
    ]

    return (
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        BeMazady makes online auctions simple and secure. Follow these easy steps to start bidding and winning.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-md text-center">
                            <div className="flex justify-center mb-4">{step.icon}</div>
                            <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HowItWorks
