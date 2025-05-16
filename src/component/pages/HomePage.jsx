import RecommendationList from "../recommendations/RecommendationList";

// Inside your homepage component, add this section:
{/* Personalized recommendations */ }
<section className="container mx-auto px-4 py-8">
    <RecommendationList
        title="Recommended For You"
        limit={8}
        viewAllLink="/auctions"
    />

    {/* You can also add category-specific recommendations for popular categories */}
    {categories && categories.length > 0 && categories[0]._id && (
        <RecommendationList
            categoryId={typeof categories[0] === 'object' ? categories[0]._id : categories[0]}
            title={`Trending in ${categories[0].name || 'Popular Category'}`}
            limit={6}
            viewAllLink={`/auctions?category=${typeof categories[0] === 'object' ? categories[0]._id : categories[0]}`}
        />
    )}
</section> 