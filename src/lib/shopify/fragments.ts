export const imageFragment = /* GraphQL */ `
  fragment image on Image {
    url
    altText
    width
    height
  }
`;

export const moneyFragment = /* GraphQL */ `
  fragment money on MoneyV2 {
    amount
    currencyCode
  }
`;

export const productListItemFragment = /* GraphQL */ `
  fragment productListItem on Product {
    id
    handle
    title
    description
    availableForSale
    featuredImage {
      ...image
    }
    priceRange {
      minVariantPrice {
        ...money
      }
      maxVariantPrice {
        ...money
      }
    }
  }
  ${imageFragment}
  ${moneyFragment}
`;

export const cartFragment = /* GraphQL */ `
  fragment cart on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        ...money
      }
      totalAmount {
        ...money
      }
      totalTaxAmount {
        ...money
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost {
            totalAmount {
              ...money
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              price {
                ...money
              }
              selectedOptions {
                name
                value
              }
              product {
                title
                handle
                featuredImage {
                  ...image
                }
              }
            }
          }
        }
      }
    }
  }
  ${moneyFragment}
  ${imageFragment}
`;

export const productFragment = /* GraphQL */ `
  fragment product on Product {
    ...productListItem
    descriptionHtml
    images(first: 10) {
      edges {
        node {
          ...image
        }
      }
    }
    options {
      id
      name
      values
    }
    variants(first: 100) {
      edges {
        node {
          id
          title
          availableForSale
          quantityAvailable
          price {
            ...money
          }
          compareAtPrice {
            ...money
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
  ${productListItemFragment}
`;
