/*
<ai_context>
Configures Next.js for the app.
</ai_context>
*/

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "localhost" },
      { hostname: "fonts.googleapis.com" }, // For loading Google fonts
      { hostname: "fonts.gstatic.com" } // For loading Google fonts
    ]
  },
  // Configure Next.js to optimize font loading
  optimizeFonts: true
}

export default nextConfig