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
    "itemCount": count(*[_type == "food" && references(^._id)])
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

export const REVIEWS_BY_FOOD_ID_QUERY = groq`
*[_type == "review" && food._ref == $foodId && approved == true]
| order(createdAt desc) {
  _id,
  rating,
  comment,
  likesCount,
  dislikesCount,
  "food": food->{
    _id,
    name,
    "slug": slug.current
  },

  "user": user->{
    name,
    image
  },

 
}`;

export const REVIEWS_WITH_REACTIONS_BY_FOOD_ID_QUERY = groq`
*[_type == "review" && food._ref == $foodId && approved == true]
| order(createdAt desc) {
  _id,
  rating,
  comment,
  likesCount,
  dislikesCount,
  "food": food->{
    _id,
    name,
    "slug": slug.current
  },
  "user": user->{
    name,
    image
  },

  // current user reaction
  "myReaction": coalesce(
   *[
    _type == "reviewReaction" &&
    review._ref == ^._id &&
    user._ref == $userId
  ][0].type,
  null
  )
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
