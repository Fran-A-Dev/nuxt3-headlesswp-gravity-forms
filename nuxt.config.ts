// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@nuxt/image"],
  image: {
    domains: ["smartcache.wpenginepowered.com"],
    quality: 80,
    format: ["webp", "jpg", "png"],
  },
  app: {
    head: {
      title: "Nuxt 3 Kitchen Sink",
      meta: [{ name: "description", content: "Nuxt 3 Kitchen Sink" }],
      link: [
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/icon?family=Material+Icons",
        },
      ],
    },
  },
  runtimeConfig: {
    public: {
      wordpressUrl: "",
      smartSearchUrl: "",
      smartSearchToken: "",
    },
  },
  routeRules: {
    // Blog listing page - revalidates every 60 seconds
    "/wpblog": { isr: 60 },
    // Individual blog posts - cached until next deployment
    "/wpblog/**": { isr: true },
    // Pre-render the form page at build time
    "/questionnaire": { prerender: true },
  },
});
