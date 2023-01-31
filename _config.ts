import lume from "lume/mod.ts";
import prism from 'lume/plugins/prism.ts';
import sitemap from 'lume/plugins/sitemap.ts';
import postcss from 'lume/plugins/postcss.ts';
import imagick from 'lume/plugins/imagick.ts';
import katex from 'lume/plugins/katex.ts';
import date from 'lume/plugins/date.ts';
import modifyUrls from "lume/plugins/modify_urls.ts";

const markdown = {
  options: {
    html: true,
    breaks: true,
    typographer: true,
  },
};

const site = lume({
  location: new URL("https://blog.uta8a.net/"),
}, { markdown });

site.ignore('_asset');
site.ignore('_content');
site.ignore('_script');
site.ignore('_template');
site.ignore('.vscode');
site.ignore('misc');
site.ignore('README.md');

site.use(prism());
site.use(sitemap());
site.use(postcss());
site.use(imagick());
site.use(katex());
site.use(date());
site.use(modifyUrls({
  fn: (url, page) => {
    /// Ignore URL link
    if (/^http:/.test(url)) {
      return url;
    }
    if (/^https:/.test(url)) {
      return url;
    }
    /// ignore specify assets
    if (/^\/fonts\//.test(url)) {
      return url;
    }
    if (/^\/styles\//.test(url)) {
      return url;
    }
    if (/^\/favicon\.ico/.test(url) || /^\/favicon-32x32\.png/.test(url) || /^\/favicon-16x16\.png/.test(url) || /^\/manifest\.json/.test(url) || /^\/apple-touch-icon\.png/.test(url)) {
      return url;
    }
    /// ./image.png -> image.png
    if (/\.\//.test(url)) {
      url = url.slice(2);
    }
    /// dotが含まれたら画像と見做してしまうことにする
    if (/\./.test(url)) {
      const splitted = url.split('.');
      splitted.pop();
      return `/img/${page.src.path}/${splitted.join('.')}.webp`
    }
    /// その他はそのまま返す
    return url
  }
}));
export default site;
