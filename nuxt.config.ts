// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  modules: ["@nuxtjs/tailwindcss"],
  runtimeConfig: {
    public: {
      wordpressUrl:
        process.env.WORDPRESS_URL ||
        "https://smartcache.wpenginepowered.com/graphql",
    },
  },
});
