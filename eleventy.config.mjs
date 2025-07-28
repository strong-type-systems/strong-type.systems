import eleventyNavigationPlugin from "@11ty/eleventy-navigation";

export default async function(eleventyConfig) {
    const dir = {
            input: 'web'
          , output: '_site'
        }
      , rootDir = ''
      , rootPath = `/${rootDir}`
      ;
    eleventyConfig.addPlugin(eleventyNavigationPlugin);
    eleventyConfig.setIncludesDirectory('_includes');
    // use this as the default layout.
    eleventyConfig.addGlobalData("layout", "default");

    eleventyConfig.addPassthroughCopy(`${dir.input}${rootPath}/css`);
    eleventyConfig.addPassthroughCopy(`${dir.input}${rootPath}/js`);
    eleventyConfig.addPassthroughCopy(`${dir.input}${rootPath}/img`);

    return {
        dir
      , markdownTemplateEngine: 'njk'
    }
};


