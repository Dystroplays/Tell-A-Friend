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
  }
}

export default nextConfig