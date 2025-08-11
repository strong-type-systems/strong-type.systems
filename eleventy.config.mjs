import markdownIt from "markdown-it";
import markdownItGitHubHeadings from "markdown-it-github-headings";
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import { EleventyHtmlBasePlugin } from "@11ty/eleventy";
import pluginRss from "@11ty/eleventy-plugin-rss";
import Nunjucks from "nunjucks";


import { createHash } from 'node:crypto';

function cacheBusterUrl(dir, rootPath, file) {
    const rewriteSource = {
            'css/main.css': 'css/main.raw.css'
        }
      , sourceFile = Object.hasOwn(rewriteSource, file)
                ? rewriteSource[file]
                : file
      ;
    const key = `file:${sourceFile}`;
    if(!Object.hasOwn(this, key)) {
        const data = fs.readFileSync(`${dir}/${sourceFile}`);
        this[key] = createHash('sha256').update(data).digest('hex');
    }
    return `${rootPath}/${file}?cacheBuster=${this[key]}`;
}


function rawNewsDate(page){
    console.log(`==>${page.fileSlug}`);
    const [y, m, d] =page.fileSlug.split('-', 3).map(i=>parseFloat(i))
      , date = new Date(y, m-1, d)
      ;
    return date;
}

function newsDate(page) {
    const date = rawNewsDate(page);
    return `<time datetime="${date.toISOString()}">${date.toDateString()}</time>`;
}


function newestNewsItem(items) {
    const  posts = items.toSorted((a,b)=>a.page.fileSlug.localeCompare(
                    b.page.fileSlug, 'en', { sensitivity: 'base' }))
                .reverse();
    return posts.at(0)
}

function renderNews(items, limit=Infinity) {
    const result = ['<ol class="news">']
      , posts = items.toSorted((a,b)=>a.page.fileSlug.localeCompare(
                    b.page.fileSlug, 'en', { sensitivity: 'base' }))
                .reverse()
                .slice(0, limit)
      ;
    for(const post of posts) {
    result.push(`<li><article>
        <span class="date"></span>
        ${newsDate(post.page)}
        <h1><a href="${post.url}">${post.data.title}</a></h1>
        <p class="lead">${post.data.lead ? post.data.lead : ''} <a href="${post.url}">(…\xa0full\xa0announcement)</a></p>
        </article></li>\n`);
    }
    result.push('</ol>');
    return result.join('');
}

function wrapShortcode(fn) {
    return (...args)=> {
        try {
            return fn(...args);
        }
        catch(e) {
            // eleventy error reporting is bad when called as a shortcode...
            console.error(e);
            throw e;
        }
    }
};


export default async function(eleventyConfig) {
    const dir = {
            input: 'web'
          , output: '_site'
        }
      , rootDir = ''
      , rootPath = `/${rootDir}`
      ;
    const nunjucksEnvironment = new Nunjucks.Environment(
        new Nunjucks.FileSystemLoader(`${dir.input}/_includes`)
        );
    eleventyConfig.setLibrary('njk', nunjucksEnvironment);
    eleventyConfig.setIncludesDirectory(`_includes`);
    eleventyConfig.addPlugin(eleventyNavigationPlugin);
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
    eleventyConfig.addPlugin(pluginRss);

    eleventyConfig.addFilter("rawNewsDate", wrapShortcode(rawNewsDate));
    eleventyConfig.addFilter("newestNewsItem", wrapShortcode(newestNewsItem));

    eleventyConfig.addShortcode('newsDate', wrapShortcode(newsDate));
    eleventyConfig.addShortcode('news', wrapShortcode(renderNews));
    // eleventyConfig.addPlugin(embedEverything);

    // use this as the default layout.
    eleventyConfig.addGlobalData("layout", "default");

    eleventyConfig.addPassthroughCopy(`${dir.input}${rootPath}/css`);
    eleventyConfig.addPassthroughCopy(`${dir.input}${rootPath}/js`);
    eleventyConfig.addPassthroughCopy(`${dir.input}${rootPath}/img`);

    eleventyConfig.addPassthroughCopy(`${dir.input}${rootPath}/CNAME`);
    eleventyConfig.addPassthroughCopy(`${dir.input}${rootPath}/.nojekyll`);


    let mdOptions = {
        html: true,
        // breaks: true,
        linkify: true,
        typographer: true,
    };
    const md = markdownIt(mdOptions);
    const headingsOptions = {
        // NOTE: I support the cause of adding prefixes to heading ids,
        // as described in the docs of markdown-it-github-headings, but
        // the hrefs created here do not contain the prefixes. The suggestion
        // is to handle this by listening to hash changes and intercept
        // these, I'm not interested in that approach, I could live with
        // links to e.g. #section-introduction but I also think the risk
        // is in this case not really high, so I just don't use prefixes.
          prefixHeadingIds: false
        //, prefix: 'section-'
        , linkIcon: '#'
        , className: 'heading_anchor'
    };
    md.use(markdownItGitHubHeadings, headingsOptions)
    eleventyConfig.setLibrary("md", md);


    // This replicates (part of) the behavior of markdownItGitHubHeadings
    // to be used as a shortcode.
    eleventyConfig.addShortcode('heading', (tag, text, achor=null)=>{
        const {prefixHeadingIds, prefix, linkIcon, className} = headingsOptions
          , rawId = achor === null ? encodeURIComponent(text) : achor
          , id = prefixHeadingIds
                ? `${prefix}${rawId}`
                : rawId
                ;
        return `<${tag}><a
            id="${id}"
            href="#${id}"
            class="${className}"
            aria-hidden="true"
            >${linkIcon}</a>${text}</${tag}>`;
    });
    return {
        dir
      , markdownTemplateEngine: 'njk'
    }
};


