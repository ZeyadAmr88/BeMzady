import React from 'react';

const Testimonials = () => {
    const testimonials = [
        {
            id: 1,
            name: "Tohamy",
            role: "Regular Bidder",
            image: "https://res.cloudinary.com/dsf7jh6jb/image/upload/v1745190204/WhatsApp_Image_2025-04-16_at_15.33.00_954d23ee_l1ij7t.jpg",
            quote:
                "BeMazady has completely changed how I shop for collectibles. The bidding process is exciting and I've found items I couldn't get anywhere else!",
        },
        {
            id: 2,
            name: "Zeyad Amr",
            role: "Seller",
            image: "https://res.cloudinary.com/dsf7jh6jb/image/upload/v1745190204/WhatsApp_Image_2025-04-16_at_15.33.00_954d23ee_l1ij7t.jpg",
            quote:
                "As a seller, I appreciate how easy it is to list items and reach potential buyers. The platform is intuitive and the support team is always helpful.",
        },
        {
            id: 3,
            name: "Joe",
            role: "Antique Collector",
            image: "https://res.cloudinary.com/dsf7jh6jb/image/upload/v1745190204/WhatsApp_Image_2025-04-16_at_15.33.00_954d23ee_l1ij7t.jpg",
            quote:
                "I've been using auction sites for years, and BeMazady stands out for its user-friendly interface and secure transaction process. Highly recommended!",
        },
    ]

    return (
        <section className="py-10 sm:py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">What Our Users Say</h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">
                        Don't just take our word for it. Here's what our community has to say about their experience with BeMazady.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                    {testimonials.map((testimonial) => (
                        <div key={testimonial.id} className="bg-white dark:bg-gray-700 rounded-lg p-4 sm:p-6 shadow-md flex flex-col h-full">
                            <div className="flex-grow">
                                <p className="text-gray-600 dark:text-gray-300 italic mb-4 sm:mb-6 text-sm sm:text-base">"{testimonial.quote}"</p>
                            </div>
                            <div className="flex items-center mt-3 sm:mt-4">
                                <img
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover mr-3 sm:mr-4"
                                />
                                <div>
                                    <h4 className="font-bold text-sm sm:text-base">{testimonial.name}</h4>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Testimonials
