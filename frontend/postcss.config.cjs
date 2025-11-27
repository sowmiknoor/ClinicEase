module.exports = {
  plugins: {
    // Temporarily disable Tailwind PostCSS plugin to allow the dev server
    // to start. If you want Tailwind styles, re-enable this and configure
    // Tailwind according to the version in package.json.
    // '@tailwindcss/postcss': {},
    autoprefixer: {},
  }
}
