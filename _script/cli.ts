import { parse } from "jsr:@std/flags";
import { Eta } from "jsr:@eta-dev/eta";
import { extractYaml } from "jsr:@std/front-matter";
import { stringify } from "jsr:@std/yaml";
import { expandGlob } from "jsr:@std/fs";
import { compareDesc } from "jsr:@fabon/vremel";

const eta = new Eta({ views: "./_template" });

async function isExists(filepath: string): Promise<boolean> {
  try {
    const file = await Deno.stat(filepath);
    return file.isFile || file.isDirectory;
  } catch (_e) {
    return false;
  }
}

const makeContent = async (ty: string, dirname: string): Promise<void> => {
  await Deno.mkdir(`./_content/${ty}/${dirname}`);
  const iso = Temporal.Now.instant().toZonedDateTimeISO("Asia/Tokyo")
    .toString();
  const body = (await eta.render(ty === "chobi" ? "chobi.md" : "content.md", {
    ty: ty,
    iso: iso,
  })) as string;
  await Deno.writeTextFile(`./_content/${ty}/${dirname}/_index.md`, body);
};

type ContentTy = "post" | "diary" | "chobi";

type Changelog = {
  summary: string;
  date: string;
};

interface Data {
  type: ContentTy;
  title: string;
  draft: boolean;
  description: string;
  ogp: string;
  changelog: Changelog[];
}

type Content = {
  ty: ContentTy;
  title: string;
  description: string;
  path: string;
  date: string;
  created: string;
  text: string;
};

const getTy = (path: string): string => {
  const splitted = path.split("/");
  return splitted[splitted.length - 3];
};

const getSlug = (path: string): string => {
  const splitted = path.split("/");
  return splitted[splitted.length - 2];
};

const pipelinedOgp = (ty: string, slug: string, basename: string): string => {
  return `/img/${ty}/${slug}/${basename}`;
};

const getCreated = (slug: string): string => {
  return slug.slice(0, 10);
};

const initSync = async () => {
  // delete all files in post, diary, img, chobi
  const existsPost = await isExists("./post");
  const existsDiary = await isExists("./diary");
  const existsImg = await isExists("./img");
  const existsChobi = await isExists("./chobi");
  if (existsPost) {
    await Deno.remove("./post", { recursive: true });
  }
  if (existsDiary) {
    await Deno.remove("./diary", { recursive: true });
  }
  if (existsImg) {
    await Deno.remove("./img", { recursive: true });
  }
  if (existsChobi) {
    await Deno.remove("./chobi", { recursive: true });
  }
  // mkdir -p
  await Deno.mkdir("./post", { recursive: true });
  await Deno.mkdir("./diary", { recursive: true });
  await Deno.mkdir("./img", { recursive: true });
  await Deno.mkdir("./img/post", { recursive: true });
  await Deno.mkdir("./img/diary", { recursive: true });
  await Deno.mkdir("./img/chobi", { recursive: true });
  await Deno.mkdir("./chobi", { recursive: true });
};

const syncContent = async (): Promise<void> => {
  /// delete all post, diary, img
  await initSync();
  /// for index page, articles variable
  const articles: Content[] = [];
  /// Markdown pipeline
  for await (const entry of expandGlob(`./_content/**/**/_index.md`)) {
    const ty = getTy(entry.path);
    const slug = getSlug(entry.path);
    const path = `./_content/${ty}/${slug}`;
    const raw = await Deno.readTextFile(entry.path);
    const { frontMatter: _, body, attrs } = extractYaml<Data>(raw);
    if (attrs.draft) continue; // next article, skip `draft: true`
    /// Copy Image
    let existsDir = false;
    for await (const img of expandGlob(`${path}/*`)) {
      if (img.name.slice(-3) === ".md") continue; // Skip markdown
      if (!existsDir) {
        await Deno.mkdir(`./img/${ty}/${slug}`, { recursive: true });
        existsDir = true;
      }
      await Deno.copyFile(img.path, `./img/${ty}/${slug}/${img.name}`);
    }
    /// Pipelined markdown
    const publishedDate = attrs.changelog[0].date;
    const lastEdited = attrs.changelog[attrs.changelog.length - 1].date;
    const out: Record<string, unknown> = {
      layout: "layouts/content.njk",
      ty: ty as ContentTy,
      title: attrs.title,
      description: attrs.description,
      ogp: pipelinedOgp(ty, slug, attrs.ogp),
      changelog: attrs.changelog,
      published: publishedDate,
      last_edited: lastEdited,
      url: `/${ty}/${slug}.html`,
      body: body,
    };
    await Deno.writeTextFile(`./${ty}/${slug}.yml`, stringify(out));
    /// Push data to articles
    articles.push({
      ty: ty as ContentTy,
      title: attrs.title,
      description: attrs.description,
      path: `/${ty}/${slug}`,
      date: lastEdited,
      created: getCreated(slug),
      text: body.trim().replace(/\n/g, " ").slice(0, 100),
    });
  }
  /// index page
  /// post/index.yml
  const postOut: Record<string, unknown> = {
    layout: "layouts/list.njk",
    title: "技術記事一覧 - diaryです",
    description: "技術記事一覧",
    ogp: "/img/post/ogp-big.webp",
    body: articles
      .filter((v) => v.ty === "post")
      .sort((a, b) =>
        compareDesc(
          Temporal.PlainDateTime.from(a.created),
          Temporal.PlainDateTime.from(b.created),
        )
      ),
  };
  await Deno.writeTextFile(`./post/index.yml`, stringify(postOut));
  /// diary/index.yml
  const diaryOut: Record<string, unknown> = {
    layout: "layouts/list.njk",
    title: "日記一覧 - diaryです",
    description: "日記一覧",
    ogp: "/img/diary/ogp-big.webp",
    body: articles
      .filter((v) => v.ty === "diary")
      .sort((a, b) =>
        compareDesc(
          Temporal.PlainDateTime.from(a.created),
          Temporal.PlainDateTime.from(b.created),
        )
      ),
  };
  await Deno.writeTextFile(`./diary/index.yml`, stringify(diaryOut));
  /// chobi/index.yml
  const chobiOut: Record<string, unknown> = {
    layout: "layouts/chobi.njk",
    title: "ちょび - diaryです",
    description: "小さな文章を書きます",
    ogp: "/img/chobi/ogp-big.webp",
    body: articles
      .filter((v) => v.ty === "chobi")
      .sort((a, b) =>
        compareDesc(
          Temporal.PlainDateTime.from(a.created),
          Temporal.PlainDateTime.from(b.created),
        )
      ),
  };
  await Deno.writeTextFile(`./chobi/index.yml`, stringify(chobiOut));
  /// index.yml
  const rootOut: Record<string, unknown> = {
    layout: "layouts/list.njk",
    title: "diaryです",
    description: "uta8aのブログ記事たち",
    ogp: "/img/ogp-big.webp",
    body: articles.filter((v) => v.ty === "diary" || v.ty === "post").sort((
      a,
      b,
    ) =>
      compareDesc(
        Temporal.PlainDateTime.from(a.created),
        Temporal.PlainDateTime.from(b.created),
      )
    ),
  };
  await Deno.writeTextFile(`./index.yml`, stringify(rootOut));
  /// Copy from assets
  await Deno.copyFile(`./_asset/ogp-post.png`, `./img/post/ogp.png`);
  await Deno.copyFile(`./_asset/ogp-diary.png`, `./img/diary/ogp.png`);
  await Deno.copyFile(`./_asset/ogp-root.png`, `./img/ogp.png`);
  await Deno.copyFile(`./_asset/ogp-chobi.png`, `./img/chobi/ogp.png`);
  await Deno.copyFile(`./_asset/data-img.yml`, `./img/_data.yml`);
  await Deno.copyFile(`./_asset/data-diary.yml`, `./diary/_data.yml`);
  await Deno.copyFile(`./_asset/data-post.yml`, `./post/_data.yml`);
  await Deno.copyFile(`./_asset/data-chobi.yml`, `./chobi/_data.yml`);
  await Deno.copyFile(`./_asset/data-img.js`, `./img/_data.js`);
};

/// @main
const args = parse(Deno.args);

if (args.post) {
  const dirname: string = args.post;
  try {
    await makeContent("post", dirname);
  } catch (err) {
    console.log(err);
    Deno.exit(1);
  }
  Deno.exit(0);
}

if (args.diary) {
  const dirname: string = args.diary;
  try {
    await makeContent("diary", dirname);
  } catch (err) {
    console.log(err);
    Deno.exit(1);
  }
  Deno.exit(0);
}

if (args.chobi) {
  try {
    await makeContent(
      "chobi",
      Temporal.Now.plainDateTimeISO().toString().replace(/\:/g, "-").replace(
        /\./g,
        "-",
      ),
    );
  } catch (err) {
    console.log(err);
    Deno.exit(1);
  }
  Deno.exit(0);
}

if (args.sync) {
  try {
    await syncContent();
  } catch (err) {
    console.log(err);
    Deno.exit(1);
  }
  Deno.exit(0);
}

throw new Error(
  "usage: deno -A cli.ts (--diary dirname | --post dirname | --sync)",
);
