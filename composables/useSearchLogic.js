// Composable for search business logic
import { useSmartSearch } from "./useSmartSearch";
import { ref } from "vue";

export const useSearchLogic = () => {
  const { searchProducts, getProductDetails } = useSmartSearch();
  const config = useRuntimeConfig();

  // Search configuration
  const resultsLimit = ref(20);

  // Core search method
  const performSearch = async (query, emit) => {
    if (!query.trim()) {
      return { success: false, error: "Empty query" };
    }

    const startTime = Date.now();

    try {
      const response = await searchProducts(query, {
        limit: parseInt(resultsLimit.value),
      });

      const searchTime = Date.now() - startTime;

      if (response?.data?.find) {
        const basicResults = response.data.find.documents.map((doc) => ({
          id: doc.data.ID,
          title: doc.data.post_title,
          description: doc.data.post_content,
          score: doc.score,
          image: "",
          price: 0,
        }));

        return {
          success: true,
          results: basicResults,
          total: response.data.find.total,
          searchTime,
        };
      } else {
        throw new Error("Invalid search response");
      }
    } catch (err) {
      console.error("Search error:", err);
      return {
        success: false,
        error: `Search failed: ${err.message || "Please try again."}`,
      };
    }
  };

  // Activity search method
  const performActivitySearch = async (activityValue) => {
    if (!activityValue) {
      return { success: false, error: "No activity selected" };
    }

    const activityLabel = getActivityLabel(activityValue);
    const startTime = Date.now();

    try {
      const url = config.public.smartSearchUrl;
      const token = config.public.smartSearchToken;

      if (!url || !token) {
        throw new Error("Smart Search URL or token not configured");
      }

      const query = `query SearchByActivity($query: String!, $limit: Int, $filter: String) {
        find(
          query: $query
          limit: $limit
          filter: $filter
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
        query: activityLabel,
        limit: parseInt(resultsLimit.value),
        filter: "post_type:product",
      };

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

      const searchTime = Date.now() - startTime;

      if (response?.data?.find) {
        const basicResults = response.data.find.documents.map((doc) => ({
          id: doc.data.ID,
          title: doc.data.post_title,
          description: doc.data.post_content,
          score: doc.score,
          image: "",
          price: 0,
        }));

        return {
          success: true,
          results: basicResults,
          total: response.data.find.total,
          searchTime,
          query: activityLabel,
        };
      } else {
        throw new Error("Invalid search response");
      }
    } catch (err) {
      console.error("Activity search error:", err);
      return {
        success: false,
        error: `Search failed: ${err.message || "Please try again."}`,
      };
    }
  };

  // Price-only search method
  const performPriceOnlySearch = async (priceRange) => {
    const startTime = Date.now();

    try {
      const response = await searchProducts("*", {
        limit: 100,
      });

      const searchTime = Date.now() - startTime;

      if (response?.data?.find) {
        const basicResults = response.data.find.documents.map((doc) => ({
          id: doc.data.ID,
          title: doc.data.post_title,
          description: doc.data.post_content,
          score: doc.score,
          image: "",
          price: 0,
        }));

        return {
          success: true,
          results: basicResults,
          total: response.data.find.total,
          searchTime,
          query: `Price: $${priceRange.min} - $${priceRange.max}`,
        };
      } else {
        throw new Error("Invalid search response");
      }
    } catch (err) {
      console.error("Price search error:", err);
      return {
        success: false,
        error: `Search failed: ${err.message || "Please try again."}`,
      };
    }
  };

  // Fetch complete product data from WordPress
  const fetchCompleteProductData = async (products) => {
    try {
      const productIds = products.map((p) => p.id);
      console.log("Fetching WordPress data for product IDs:", productIds);

      const response = await getProductDetails(productIds);
      console.log("Full WordPress GraphQL response:", response);

      if (response?.data?.products?.edges) {
        console.log(
          "WordPress GraphQL response edges:",
          response.data.products.edges
        );

        return products.map((result) => {
          const productDetail = response.data.products.edges.find(
            (edge) => edge.node.databaseId === result.id
          );

          if (productDetail) {
            const imageUrl = productDetail.node.image?.sourceUrl || "";
            console.log(`Product ${result.id} image URL:`, imageUrl);

            return {
              ...result,
              image: imageUrl,
              price: productDetail.node.regularPrice
                ? parseFloat(
                    productDetail.node.regularPrice.replace(/[^0-9.]/g, "")
                  )
                : 0,
            };
          } else {
            console.log(`No WordPress data found for product ID: ${result.id}`);
          }
          return result;
        });
      } else {
        console.log("No products edges in WordPress response:", response?.data);
        return products;
      }
    } catch (err) {
      console.error("Error fetching product details:", err);
      console.error("Error details:", err.response || err.message);
      return products;
    }
  };

  // Apply price filter to existing results
  const applyPriceFilter = (results, priceRange) => {
    return results.filter((product) => {
      return product.price >= priceRange.min && product.price <= priceRange.max;
    });
  };

  // Utility function to get activity label
  const getActivityLabel = (activityValue) => {
    const activities = [
      { value: "coding", label: "Coding" },
      { value: "running", label: "Running" },
      { value: "rock-climbing", label: "Rock Climbing" },
    ];
    const activity = activities.find((a) => a.value === activityValue);
    return activity ? activity.label : activityValue;
  };

  return {
    performSearch,
    performActivitySearch,
    performPriceOnlySearch,
    fetchCompleteProductData,
    applyPriceFilter,
    getActivityLabel,
  };
};
