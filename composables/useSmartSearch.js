// Nuxt composable for Smart Search functionality
export const useSmartSearch = () => {
  const config = useRuntimeConfig();

  // Get context using similarity search
  const getContext = async (message) => {
    const url = config.public.smartSearchUrl;
    const token = config.public.smartSearchToken;

    if (!url || !token) {
      throw new Error("Smart Search URL or token not configured");
    }

    const query = `query GetContext($message: String!, $field: String!, $minScore: Float!) {
      similarity(
        input: {
          nearest: {
            text: $message,
            field: $field
          }
          minScore: $minScore
        }) {
        total
        docs {
          id
          data
          score
        }
      }
    }`;

    const variables = {
      message,
      field: "post_content",
      minScore: 0.8, // Adjust this value based on your requirements
    };

    try {
      const response = await $fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: {
          query,
          variables,
        },
      });

      return response;
    } catch (error) {
      console.error("Smart Search error:", error);
      throw error;
    }
  };

  // Search products using semantic search only
  const searchProducts = async (searchQuery, options = {}) => {
    const url = config.public.smartSearchUrl;
    const token = config.public.smartSearchToken;

    if (!url || !token) {
      throw new Error("Smart Search URL or token not configured");
    }

    const { limit = 10 } = options;

    const query = `query SearchProducts($query: String!, $limit: Int) {
      find(
        query: $query
        limit: $limit
        filter: "post_type:product"
        semanticSearch: {searchBias: 10, fields: ["post_title", "post_content"]}
      ) {
        total
        documents {
          id
          score
          data
        }
      }
    }`;

    const variables = {
      query: searchQuery,
      limit,
    };

    try {
      const response = await $fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: {
          query,
          variables,
        },
      });

      return response;
    } catch (error) {
      console.error("Smart Search error:", error);
      throw error;
    }
  };

  // Get product details from WordPress GraphQL after search
  const getProductDetails = async (productIds) => {
    const wordpressUrl = config.public.wordpressUrl;

    if (!wordpressUrl) {
      throw new Error("WordPress URL not configured");
    }

    const query = `
      query GetProductDetails($ids: [Int]!) {
        products(where: {include: $ids}) {
          edges {
            node {
              databaseId
              name
              image {
                sourceUrl
                altText
              }
              ... on ProductWithPricing {
                regularPrice
              }
            }
          }
        }
      }
    `;

    try {
      const response = await $fetch(wordpressUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          query,
          variables: {
            ids: productIds,
          },
        },
      });

      return response;
    } catch (error) {
      console.error("WordPress GraphQL error:", error);
      throw error;
    }
  };

  return {
    getContext,
    searchProducts,
    getProductDetails,
  };
};
