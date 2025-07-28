import eleventyNavigationPlugin from "@11ty/eleventy-navigation";

export default async function(eleventyConfig) {

    eleventyConfig.addPlugin(eleventyNavigationPlugin);
    eleventyConfig.setIncludesDirectory('_includes');
    // use this as the default layout.
    eleventyConfig.addGlobalData("layout", "default");

    eleventyConfig.addPassthroughCopy(`css`);
    eleventyConfig.addPassthroughCopy(`js`);
    eleventyConfig.addPassthroughCopy(`img`);
};


