import React from "react"
import { Search, Gavel, CreditCard, Package } from "lucide-react"

const HowItWorks = () => {
    const steps = [
        {
            icon: <Search size={32} className="sm:w-10 sm:h-10 text-rose-600" />,
            title: "Find Items",
            description: "Browse through our extensive collection of auctions and find items that interest you.",
        },
        {
            icon: <Gavel size={32} className="sm:w-10 sm:h-10 text-rose-600" />,
            title: "Place Bids",
            description: "Place competitive bids on your favorite items and stay updated on auction progress.",
        },
        {
            icon: <CreditCard size={32} className="sm:w-10 sm:h-10 text-rose-600" />,
            title: "Win & Pay",
            description: "When you win an auction, complete your purchase securely through our payment system.",
        },
        {
            icon: <Package size={32} className="sm:w-10 sm:h-10 text-rose-600" />,
            title: "Receive Item",
            description: "The seller ships your item directly to you, and you can track delivery status.",
        },
    ]

    return (
        <section className="py-10 sm:py-16 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">How It Works</h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">
                        BeMazady makes online auctions simple and secure. Follow these easy steps to start bidding and winning.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-4 sm:p-6 shadow-md text-center h-full">
                            <div className="flex justify-center mb-3 sm:mb-4">{step.icon}</div>
                            <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{step.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HowItWorks
