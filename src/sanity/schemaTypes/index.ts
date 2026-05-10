import { type SchemaTypeDefinition } from "sanity";
import banner from "./banner";
import blogCategory from "./blogCategory";
import address from "./address";
import author from "./author";
import category from "./category";
import food from "./food";
import foodVariety from "./foodVariety";
import ingredient from "./ingredient";
import menu from "./menu";
import openingHours from "./openingHours";
import order from "./order";
import orderStatus from "./orderStatus";
import post from "./post";
import restaurant from "./restaurant";
import review from "./review";
import reviewReaction from "./reviewReaction";
import size from "./size";
import user from "./user";
import userRole from "./userRole";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    banner,
    blogCategory,
    address,
    author,
    category,
    food,
    foodVariety,
    ingredient,
    menu,
    openingHours,
    order,
    orderStatus,
    post,
    restaurant,
    review,
    reviewReaction,
    size,
    user,
    userRole,
  ],
};
