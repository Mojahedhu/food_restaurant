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

// =========================================================
// STATISTIC QUERY
// =========================================================
