import { cartFragment, productFragment, productListItemFragment } from "./fragments";

export const getProductsQuery = /* GraphQL */ `
  query getProducts($first: Int = 24, $sortKey: ProductSortKeys = BEST_SELLING, $reverse: Boolean = false) {
    products(first: $first, sortKey: $sortKey, reverse: $reverse) {
      edges {
        node {
          ...productListItem
        }
      }
    }
  }
  ${productListItemFragment}
`;

export const getProductByHandleQuery = /* GraphQL */ `
  query getProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...product
    }
  }
  ${productFragment}
`;

export const getAllProductHandlesQuery = /* GraphQL */ `
  query getAllProductHandles($first: Int = 250) {
    products(first: $first) {
      edges {
        node {
          handle
        }
      }
    }
  }
`;

export const getCartQuery = /* GraphQL */ `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      ...cart
    }
  }
  ${cartFragment}
`;
