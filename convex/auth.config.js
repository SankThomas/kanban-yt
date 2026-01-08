export default {
  providers: [
    {
      domain: import.meta.env.CLERK_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
