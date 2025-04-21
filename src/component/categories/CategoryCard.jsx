import { Link } from "react-router-dom"
import React from "react"
const CategoryCard = ({ category }) => {
    return (
        <Link to={`/category/${category._id}`} className="group">
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 text-center p-4">
                <div className="mb-3 flex justify-center">
                    {category.categoryImage ? (
                        <img
                            src={category.categoryImage || "/placeholder.svg"}
                            alt={category.name}
                            className="w-16 h-16 object-contain"
                        />
                    ) : (
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">{category.name.charAt(0)}</span>
                        </div>
                    )}
                </div>

                <h3 className="font-medium group-hover:text-rose-600 transition-colors">{category.name}</h3>
            </div>
        </Link>
    )
}

export default CategoryCard
