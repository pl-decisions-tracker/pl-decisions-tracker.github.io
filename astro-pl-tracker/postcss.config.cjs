const purgecss = require("@fullhuman/postcss-purgecss");

module.exports = {
  plugins: [
    process.env.GITHUB_ACTIONS === "true"
      ? purgecss({
          content: ["./public/**/*", "./src/**/*.{astro,js,jsx,ts,tsx,vue}"],
          safelist: {
            standard: [],
            deep: [/class$/],
            greedy: [],
            keyframes: [],
            variables: [],
          },
          defaultExtractor: (content) =>
            content.match(/[\w-/:%@]+(?<!:)/g) || [],
        })
      : null,
  ],
};
