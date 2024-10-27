import lume from "lume/mod.ts";
import sitemap from "lume/plugins/sitemap.ts";
import postcss from "lume/plugins/postcss.ts";
import transformImages from "lume/plugins/transform_images.ts";
import date from "lume/plugins/date.ts";
import modifyUrls from "lume/plugins/modify_urls.ts";
import nunjucks from "lume/plugins/nunjucks.ts";
import { ja } from "https://esm.sh/date-fns@3.6.0/locale/ja";
import feed from "lume/plugins/feed.ts";

const markdown = {
  options: {
    html: true,
    breaks: true,
    typographer: true,
  },
};

const site = lume(
  {
    location: new URL("https://blog.uta8a.net/"),
  },
  { markdown },
);

site.copy("prism.js");

site.ignore("_asset");
site.ignore("_content");
site.ignore("_script");
site.ignore("_template");
site.ignore(".vscode");
site.ignore("misc");
site.ignore("README.md");

site.use(nunjucks());
site.use(sitemap());
site.use(postcss());
site.use(transformImages());
site.use(
  date({
    locales: { ja },
  }),
);

const feedInfo = {
  title: "diaryです",
  published: new Date(),
  lang: "ja",
  generator: true,
};
const feedItems = {
  title: "=title",
  description: "=description",
  published: "=published",
  updated: "=last_edited",
  lang: "ja",
};

site.use(feed({
  output: ["/feed.rss", "/feed.json"],
  query: "main_menu*=diary;|post",
  info: {
    ...feedInfo,
    description: "uta8aのブログ記事たち",
  },
  items: feedItems,
}));
site.use(feed({
  output: ["/post.rss", "/post.json"],
  query: "main_menu=post",
  info: {
    ...feedInfo,
    description: "技術記事一覧",
  },
  items: feedItems,
}));
site.use(feed({
  output: ["/diary.rss", "/diary.json"],
  query: "main_menu=diary;",
  info: {
    ...feedInfo,
    description: "日記一覧",
  },
  items: feedItems,
}));

site.use(
  modifyUrls({
    fn: (url, page, element) => {
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
      if (/^\/img\//.test(url)) {
        return url;
      }
      if (/^\/prism\.js/.test(url)) {
        return url;
      }
      if (
        /^\/favicon\.ico/.test(url) ||
        /^\/favicon-32x32\.png/.test(url) ||
        /^\/favicon-16x16\.png/.test(url) ||
        /^\/manifest\.json/.test(url) ||
        /^\/apple-touch-icon\.png/.test(url)
      ) {
        return url;
      }
      /// ./image.png -> image.png
      if (/\.\//.test(url)) {
        url = url.slice(2);
      }
      /// dotが含まれたら画像と見做してしまうことにする
      if (/\./.test(url)) {
        const splitted = url.split(".");
        splitted.pop();
        return `/img/${page.src.path}/${splitted.join(".")}.webp`;
      }
      /// その他はそのまま返す
      return url;
    },
  }),
);

export default site;
