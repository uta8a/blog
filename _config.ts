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
  fn: (url) => {
    if (/^http:/.test(url)) {
      return url;
    }
    if (/^https:/.test(url)) {
      return url;
    }
    // ./image.png -> image.png
    if (/\.\//.test(url)) {
      url = url.slice(2);
    }
    // if (/^image\//.test(url)) {
    //   // image.1.png#small -> image_1-small.webp
    //   if (/\.[^\.]*#small$/.test(url)) {
    //     return url.replace(/^image/, '/img').replace(/\.[^\.]*#small$/, '-small').replaceAll('.', '_') + '.webp'
    //   }
    //   // image.1.png#big -> image_1-big.webp
    //   if (/\.[^\.]*#big$/.test(url)) {
    //     return url.replace(/^image/, '/img').replace(/\.[^\.]*#big$/, '-big').replaceAll('.', '_') + '.webp'
    //   }
    //   // image.1.png -> image_1.webp
    //   if (/\.[^\.]*$/.test(url)) {
    //     return url.replace(/^image/, '/img').replace(/\.[^\.]*$/, '').replaceAll('.', '_') + '.webp'
    //   }
    //   // other
    //   return url.replace(/^image/, '/img')
    // }
    return url
  }
}));
export default site;
