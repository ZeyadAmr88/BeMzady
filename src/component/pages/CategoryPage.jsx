
import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { categoryService, auctionService } from "../services/api"
import CategoryCard from "../categories/CategoryCard"
import { ArrowRight, X, Search, Plus } from "lucide-react"
import AuctionCard from "../auctions/AuctionCard"
import RelatedAuctions from "../auctions/RelatedAuctions"

const CategoryPage = () => {
    const { id } = useParams()
    const [category, setCategory] = useState(null)
    const [subcategories, setSubcategories] = useState([])
    const [auctions, setAuctions] = useState([])
    const [selectedAuction, setSelectedAuction] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch category with auctions in one request
                const categoryResponse = await categoryService.getCategoryWithAuctions(id)
                console.log("Category with auctions response:", categoryResponse.data)

                // Set category data
                setCategory(categoryResponse.data.data)

                // Set auctions if available in the response
                if (categoryResponse.data.data && categoryResponse.data.data.auctions) {
                    setAuctions(categoryResponse.data.data.auctions)
                } else {
                    // If auctions are not included in the category response, fetch them separately
                    try {
                        const auctionsResponse = await auctionService.getAuctionsByCategory(id, { limit: 8 })
                        setAuctions(auctionsResponse.data.data || [])
                    } catch (auctionError) {
                        console.error("Error fetching auctions for category:", auctionError)
                    }
                }

                // Fetch subcategories separately
                const subcategoriesResponse = await categoryService.getSubcategoriesByCategory(id)
                setSubcategories(subcategoriesResponse.data.data || [])

            } catch (error) {
                console.error("Error fetching category page data:", error)
                setError("Failed to load category page. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
            </div>
        )
    }

    if (error) {
        return <div className="text-center py-12">{error}</div>
    }

    // Function to handle auction selection for showing related auctions
    const handleAuctionSelect = (auction) => {
        setSelectedAuction(auction)

        // Scroll to related auctions section after a short delay to allow rendering
        setTimeout(() => {
            const relatedSection = document.getElementById('related-auctions')
            if (relatedSection) {
                relatedSection.scrollIntoView({ behavior: 'smooth' })
            }
        }, 100)
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">{category?.name}</h1>

            {category?.description && (
                <div className="mb-6 text-gray-600 dark:text-gray-300">
                    <p>{category.description}</p>
                </div>
            )}

            {/* Subcategories */}
            {subcategories.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Subcategories</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {subcategories.map((subcategory) => (
                            <CategoryCard key={subcategory._id} category={subcategory} />
                        ))}
                    </div>
                </section>
            )}

            {/* Auctions in this category */}
            <section>
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">Auctions</h2>
                    <Link
                        to={`/auctions?category=${id}`}
                        className="flex items-center text-rose-600 hover:text-rose-700 transition-colors"
                    >
                        View All <ArrowRight size={16} className="ml-1" />
                    </Link>
                </div>

                {auctions.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {auctions.map((auction) => (
                            <div key={auction._id} className="relative group">
                                <AuctionCard auction={auction} />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAuctionSelect(auction);
                                    }}
                                    className="absolute bottom-4 right-4 bg-rose-100 text-rose-600 hover:bg-rose-200 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    title="Show related auctions"
                                >
                                    <Search size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">No auctions found in this category.</p>
                        <Link
                            to="/create-auction"
                            className="mt-4 inline-flex items-center px-6 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors"
                        >
                            <Plus size={16} className="mr-2" />
                            Create an Auction
                        </Link>
                    </div>
                )}
            </section>

            {/* Related Auctions Section */}
            {selectedAuction && (
                <section id="related-auctions" className="mt-12">
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg relative">
                        <button
                            onClick={() => setSelectedAuction(null)}
                            className="absolute top-4 right-4 p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            aria-label="Close related auctions"
                        >
                            <X size={18} />
                        </button>
                        <h2 className="text-2xl font-bold mb-4">Related to "{selectedAuction.title}"</h2>
                        <RelatedAuctions
                            categoryId={id}
                            currentAuctionId={selectedAuction._id}
                        />
                    </div>
                </section>
            )}
        </div>
    )
}

export default CategoryPage

