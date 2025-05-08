
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { categoryService, auctionService } from "../services/api"
import CategoryCard from "../categories/CategoryCard"
import { ArrowRight } from "lucide-react"
import AuctionCard from "../auctions/AuctionCard"

const CategoryPage = () => {
    const { id } = useParams()
    const [category, setCategory] = useState(null)
    const [subcategories, setSubcategories] = useState([])
    const [auctions, setAuctions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch category details
                const categoryResponse = await categoryService.getCategoryById(id)
                setCategory(categoryResponse.data.data)

                // Fetch subcategories
                const subcategoriesResponse = await categoryService.getSubcategoriesByCategory(id)
                setSubcategories(subcategoriesResponse.data.data)

                // Fetch auctions in this category
                const auctionsResponse = await auctionService.getAuctions({ category: id, limit: 8 })
                setAuctions(auctionsResponse.data.data)
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

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">{category?.name}</h1>

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {auctions.map((auction) => (
                        <AuctionCard key={auction._id} auction={auction} />
                    ))}
                </div>
            </section>
        </div>
    )
}

export default CategoryPage

