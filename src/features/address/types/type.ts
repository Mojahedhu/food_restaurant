import { Address } from "../../../../types/sanityTypes";

export interface AddressRaw extends Address {
  pending: boolean;
}
