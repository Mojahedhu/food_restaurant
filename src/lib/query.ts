import { groq } from "next-sanity";

//================================================================
// Get all active banners ordered by order field
export const BANNERS_QUERY = groq`
  *[_type == "banner" && active == true] | order(order asc) {
    _id,
    title,
    description,
    bannerImage,
    buttonTitle,
    buttonHref,
    order
  }
`;

//================================================================

/**
 * Get featured foods (limited to 8 items)
 */

export const FEATURED_FOODS_QUERY = groq`
  *[_type == "food" && featured == true && available == true] 
  | order(order asc) [0...8] {
    _id,
    name,
    "slug": slug.current,
    description,
    "basePrice": price,
    images,
    preparationTime,
    spiceLevel,
    available,
    featured,
    averageRating,
    totalReviews,
    category->{
      _id,
      name,
      "slug": slug.current
    },
    varieties[]->{
      _id,
      name,
    }
  }
`;

export const AVAILABLE_FOODS_QUERY = groq``;

// =========================================================

export const CATEGORIES_QUERY = groq`
  *[_type == "category" && isActive == true] | order(order asc) {
    _id,
    name,
    "slug": slug.current,
    image,
    "itemCount": count(*[_type == "food" && references(^._id)])
  }
`;
// =========================================================
/**
 * Get categories with food item count (limited to 6)
 */
export const CATEGORIES_WITH_COUNT_QUERY = groq`
  *[_type == "category" && isActive == true] | order(order asc) [0...6] {
    _id,
    name,
    "slug": slug.current,
    image,
    "itemsCount": count(*[_type == "food" && references(^._id)])
  }
`;
// =========================================================
/**
 * Get category by slug with food item details
 */

export const GET_CATEGORY_BY_SLUG_QUERY = groq`
  *[_type == "category" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    image,
    description,
    "itemsCount": count(*[_type == "food" && references(^._id)]),
    "foodItems": *[_type == "food" && references(^._id)] | order(order asc) {
      _id,
      name,
      "slug": slug.current,
      description,
      "basePrice": price,
      images,
      preparationTime,
      spiceLevel,
      available,
      featured,
      averageRating,
      totalReviews,
      category->{
        _id,
        name,
        "slug": slug.current
      },
      varieties[]->{
        _id,
        name,
      }
    }
  }
`;
// =========================================================

/**
 * Search by name, description, or category
 */
export const SEARCH_FOODS_QUERY = groq`
  *[_type == "food" && available == true && (
      name match $query + "*" ||
      description match $query + "*" ||
      category->name match $query + "*" 
    )] | order(name asc) [0...10] {
      _id,
      name,
      "slug": slug.current,
      description,
      basePrice,
      images,
      price,
      averageRating,
      totalReviews,
      category->{
        _id,
        name,
        "slug": slug.current
      }
    }
`;

/**
 * Get featured foods for search modal (limited to sex items)
 */

export const FEATURED_FOODS_SEARCH_QUERY = groq`
  *[_type == "food" && featured == true && available == true] 
    | order(name asc)[0...6]{
      _id,
      name,
      "slug": slug.current,
      description,
      basePrice,
      images,
      averageRating,
      totalReviews,
      category->{
        _id,
        name,
        "slug": slug.current
      }
    }
`;

/* ==================== Get food by Slug ==================== */

export const GET_FOOD_BY_SLUG_QUERY = groq`
  *[_type == "food" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    description,
    "basePrice": price,
    images,
    "preparationTime": PreparationTime,
    spiceLevel,
    available,
    "ingredients":ingredients[]->{
      name,
      _id,
    },
    "sizes":sizes[]{
      _key,
      "size":size->{
        name,
        _id,
      },
    },
    featured,
     // Dynamic average rating
   "averageRating": coalesce(
    math::avg(
      *[
        _type == "review" &&
        food._ref == ^._id &&
        approved == true
      ].rating
    ),
    0
    ),
     "totalReviews": count(
    *[
    _type == "review" &&
    food._ref == ^._id &&
    approved == true
    ]
    ),
    category->{
      _id,
      name,
      "slug": slug.current
    },
    varieties[]->{
      _id,
      name,
    }
  }
`;

/* ==================== Get Food by Category query  ==================== */

export const GET_FOOD_BY_CATEGORY_QUERY = groq`
  *[_type == "food" && category._ref == $categoryId && _id != $excludeFoodId] {
    _id,
    name,
    "slug": slug.current,
    description,
    price,
    images,
    averageRating,
    "totalReviews": count(
    *[
    _type == "review" &&
    food._ref == ^._id &&
    approved == true
    ]
    ),
    category->{
      _id,
      name,
      "slug": slug.current
    }
  }
`;

/** ============================================================
 *  Get first four posts for home page
 * =============================================================
 */
export const FEATURED_POSTS_QUERY = groq`*[_type == "post" && isFeatured == true] 
  | order(publishedAt desc) [0...4] {
  _id,
  title,
  slug,
  mainImage,
  publishedAt,
  author->{_id, name, image, bio},
  categories[]->{_id, title, slug}
}`;
/** ============================================================
 *  Get latest post
 * =============================================================
 */
export const LATEST_POSTS_QUERY = groq`*[_type == "post"] 
  | order(publishedAt desc) [0...4] {
  _id,
  title,
  "slug": slug.current,
  mainImage,
  publishedAt,
}`;

/** ============================================================
 *  Get all posts for blog page
 * =============================================================
 */
export const ALL_POSTS_QUERY = groq`*[_type == "post"] 
  | order(publishedAt desc) {
  _id,
  title,
  slug,
  mainImage,
  publishedAt,
  author->{ _id, name, image, bio},
  categories[]->{_id, title, slug}
}`;

/** ============================================================
 *  Get full details of a post by slug for blog post page
 * =============================================================
 */

export const GET_POST_DETAILS_BY_SLUG_QUERY = groq`
  *[_type == "post" && slug.current == $slug][0]{
    _id,
    _type,
    _createdAt,
    _updatedAt,

    title,
    "slug": slug.current,
    isFeatured,
    publishedAt,

    author->{
      _id,
      name,
      image,
      bio
    },

    mainImage{
      ...,
      alt,
      asset->
    },

    categories[]->{
      _id,
      title,
      "slug": slug.current
    },

    body[]{
      ...,

      _type == "image" => {
        ...,
        asset->
      },

      _type == "twoUpImages" => {
        ...,

        image1{
          ...,
          asset->
        },

        image2{
          ...,
          asset->
        }
      }
    }
  }
`;
// =====================================================
/**
 * Get addresses
 */

export const ADDRESSES_QUERY = groq`*[_type == "address" && user._ref == $userId]{
      _id,
      type,
      label,
      street,
      apartment,
      city,
      state,
      zipCode,
      phone,
      instructions,
      isDefault
     }
    `;
// =========================================================
// STATISTIC QUERY
// =========================================================

/**
 * Get all reviews by food id and my reaction
 */
export const REVIEWS_STATIC_BY_FOOD_ID_QUERY = groq`
*[_type == "review" && food._ref == $foodId && approved == true]
| order(createdAt desc) {
  _id,
  _type,
  _rev,
  _createdAt,
  _updatedAt,

  rating,
  comment,
  approved,
  adminReply,
  
  food,
  "foodName": food->name,
  "user": user->{
    _id,
    name,
    image
  },
}`;

export const REVIEWS_METRIC_BY_FOOD_ID_QUERY = groq`
*[_type == "reviewMetrics" && food._ref == $foodId]
| order(createdAt desc) {

  "reviewId": review._ref,

  likesCount,
  dislikesCount,
}`;

export const MY_REVIEW_REACTION_QUERY = groq`
*[_type == "reviewReaction" 
  && user._ref == $userId 
  && food._ref == $foodId
  ]{
  "reviewId": review._ref,
  "confirmedReaction":type ,
}
`;

/**
 * Count reaction (fallback if needed)
 */

export const REVIEW_REACTIONS_QUERY_WITH_REVIEW_ID = groq`
{
  "likes": count(*[_type == "reviewReaction" && review._ref == $reviewId && type == "like"]),
  "dislikes": count(*[_type == "reviewReaction" && review._ref == $reviewId && type == "dislike"])
}
`;

/**
 * =================================================================
 * LIKE & DISLIKE COUNT QUERY
 * =================================================================
 */

export const LIKES_COUNT_QUERY = groq`count(
    *[
      _type == "reviewReaction" &&
      review._ref == $reviewId &&
      type == "like"
    ])`;

export const DISLIKES_COUNT_QUERY = groq`count(
    *[
      _type == "reviewReaction" &&
      review._ref == $reviewId &&
      type == "dislike"
    ])`;

/**
 * =================================================================
 * RESTAURANT QUERIES
 * =================================================================
 */

/**
 * Get all active restaurants
 */

export const ALL_RESTAURANTS_QUERY = groq`
  *[_type == "restaurant" && isActive == true] {
    _id,
    name,
    description,
    image,
    rating,
    deliveryFee,
    estimatedDeliveryTime,
    "slug": slug.current,
    "openingHours": openingHours-> { _id, name, schedule },
    location,
    isActive,
    minimumOrder,
    totalReviews,
    "categoriesCount": count(categories),
    "foodItemsCount": count(foodItems)
  }
`;

/**
 * Get Featured restaurant
 *
 */

export const FEATURED_RESTAURANTS_QUERY = `*[ _type == "restaurant" && isFeatured == true ] {
_id,
name,
description,
image,
rating,
deliveryFee,
estimatedDeliveryTime,
"slug": slug.current,
"openingHours": openingHours-> { _id, name, schedule },
location,
isActive,
minimumOrder,
totalReviews,
"categoriesCount": count(categories),
"foodItemsCount": count(foodItems)
}`;

/**
 * Get restaurant by slug
 */

export const GET_RESTAURANT_BY_SLUG_QUERY = groq`
  *[_type == "restaurant" && slug.current == $slug][0] {
    _id,
    name,
    description,
    image,
    rating,
    deliveryFee,
    estimatedDeliveryTime,
    "slug": slug.current,
    location,
    phone,
    email,
    "openingHours": openingHours-> {
      _id,
      name,
      schedule[]{
        day,
        openTime,
        closeTime,
        isClosed
      }
    },
    isActive,
    minimumOrder,
    totalReviews,
    "openingHours":openingHours->{
      _id,
      name,
      schedule[]{
        day,
        openTime,
        closeTime,
        isClosed
      }
    },
    "categoriesCount": count(categories),
    "foodItemsCount": count(
      select(
        AllFoodItemsAvailable => *[_type == "food"] [0...12],
        foodItems[]->{
          _id,
          name
        }
      )
    ),
    "foodItems": select(
      AllFoodItemsAvailable => *[_type == "food"] [0...12] {
      _id,
      name,
      "slug": slug.current,
      description,
      price,
      images,
      averageRating,
      "totalReviews": count(
        *[
          _type == "review" &&
          food._ref == ^._id &&
          approved == true
        ]
      ),
      category->{
        _id,
        name,
        "slug": slug.current
      }
    },
      foodItems[]->{
        _id,
        name,
        "slug": slug.current,
        description,
        price,
        images,
        averageRating,
        "totalReviews": count(
        *[
          _type == "review" &&
          food._ref == ^._id &&
          approved == true
        ]
      ),
      category->{
        _id,
        name,
        "slug": slug.current
      }
    }
    ),
    "categories":categories[]->{
      _id,
      name,
      "slug": slug.current,
      image
    }
  }
`;
