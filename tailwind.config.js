// tailwind.config.js
module.exports = {
  content: [
    "./views/**/*.ejs",  // This includes all .ejs files inside the 'views' folder (e.g., views/user/)
    "./src/**/*.js",     // This includes any JS files where Tailwind classes might be used
    "./public/**/*.html" // This includes any static HTML files you have in public
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
