import { parse } from 'https://deno.land/std@0.166.0/flags/mod.ts';
import * as eta from 'https://deno.land/x/eta@v1.6.0/mod.ts';
import dayjs from 'https://cdn.skypack.dev/dayjs@v1.11.5';
import utc from 'https://cdn.skypack.dev/dayjs@v1.11.5/plugin/utc';
import timezone from 'https://cdn.skypack.dev/dayjs@v1.11.5/plugin/timezone';
import duration from 'https://cdn.skypack.dev/dayjs@v1.11.5/plugin/duration';
import relativeTime from 'https://cdn.skypack.dev/dayjs@v1.11.5/plugin/relativeTime';
import { extract } from 'https://deno.land/std@0.172.0/encoding/front_matter/yaml.ts';
import { stringify } from 'https://deno.land/std@0.172.0/encoding/yaml.ts';
import { expandGlob } from 'https://deno.land/std@0.172.0/fs/expand_glob.ts';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.tz.setDefault('Asia/Tokyo');

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
  const raw = await Deno.readTextFile(`_template/content.md`);
  const iso = dayjs().tz().format('YYYY-MM-DDTHH:mm:ss+09:00');
  const body = await eta.render(raw, { ty: ty, iso: iso }) as string;
  await Deno.writeTextFile(`./_content/${ty}/${dirname}/_index.md`, body);
}

type Changelog = {
  summary: string;
  date: string;
};

interface Data {
  type: 'post' | 'diary';
  title: string;
  draft: boolean;
  description: string;
  ogp: string;
  changelog: Changelog[];
}

type Content = {
  ty: 'post' | 'diary';
  title: string;
  description: string;
  path: string;
  date: string;
  created: string;
}

const getTy = (path: string): string => {
  const splitted = path.split('/');
  return splitted[splitted.length - 3];
}

const getSlug = (path: string): string => {
  const splitted = path.split('/');
  return splitted[splitted.length - 2];
}

const pipelinedOgp = (ty: string, slug: string, basename: string): string => {
  return `/img/${ty}/${slug}/${basename}`
}

const getCreated = (slug: string): string => {
  return slug.slice(0, 10);
}

const initSync = async () => {
  // delete all files in post, diary, img
  const existsPost = await isExists('./post');
  const existsDiary = await isExists('./diary');
  const existsImg = await isExists('./img');
  if (existsPost) {
    await Deno.remove('./post', { recursive: true });
  }
  if (existsDiary) {
    await Deno.remove('./diary', { recursive: true });
  }
  if (existsImg) {
    await Deno.remove('./img', { recursive: true });
  }
  // mkdir -p
  await Deno.mkdir('./post', { recursive: true });
  await Deno.mkdir('./diary', { recursive: true });
  await Deno.mkdir('./img', { recursive: true });
}

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
    const { frontMatter: _, body, attrs } = extract<Data>(raw);
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
    const lastEdited = attrs.changelog[attrs.changelog.length - 1].date;
    const out: Record<string, unknown> = {
      layout: "layouts/content.njk",
      title: attrs.title,
      description: attrs.description,
      ogp: pipelinedOgp(ty, slug, attrs.ogp),
      changelog: attrs.changelog,
      last_edited: lastEdited,
      body: body,
    };
    await Deno.writeTextFile(
      `./${ty}/${slug}.yml`,
      stringify(out),
    );
    /// Push data to articles
    articles.push({
      ty: ty as "diary" | "post",
      title: attrs.title,
      description: attrs.description,
      path: `/${ty}/${slug}`,
      date: lastEdited,
      created: getCreated(slug),
    });
  }
  /// index page
  /// post/index.yml
  const postOut: Record<string, unknown> = {
    layout: "layouts/list.njk",
    title: "技術記事一覧 - diaryです",
    description: "技術記事一覧",
    ogp: "/img/post/ogp-big.webp",
    body: articles.filter(v => v.ty === 'post').sort((a, b) => dayjs(b.created).unix() - dayjs(a.created).unix()),
  }
  await Deno.writeTextFile(
    `./post/index.yml`,
    stringify(postOut),
  );
  /// diary/index.yml
  const diaryOut: Record<string, unknown> = {
    layout: "layouts/list.njk",
    title: "日記一覧 - diaryです",
    description: "日記一覧",
    ogp: "/img/diary/ogp-big.webp",
    body: articles.filter(v => v.ty === 'diary').sort((a, b) => dayjs(b.created).unix() - dayjs(a.created).unix()),
  }
  await Deno.writeTextFile(
    `./diary/index.yml`,
    stringify(diaryOut),
  );
  /// index.yml
  const rootOut: Record<string, unknown> = {
    layout: "layouts/list.njk",
    title: "diaryです",
    description: "uta8aのブログ記事たち",
    ogp: "/img/ogp-big.webp",
    body: articles.sort((a, b) => dayjs(b.created).unix() - dayjs(a.created).unix()),
  }
  await Deno.writeTextFile(
    `./index.yml`,
    stringify(rootOut),
  );
  /// Copy from assets
  await Deno.copyFile(`./_asset/ogp-post.png`, `./img/post/ogp.png`);
  await Deno.copyFile(`./_asset/ogp-diary.png`, `./img/diary/ogp.png`);
  await Deno.copyFile(`./_asset/ogp-root.png`, `./img/ogp.png`);
  await Deno.copyFile(`./_asset/data-img.yml`, `./img/_data.yml`);
  await Deno.copyFile(`./_asset/data-diary.yml`, `./diary/_data.yml`);
  await Deno.copyFile(`./_asset/data-post.yml`, `./post/_data.yml`);
}

/// @main
const args = parse(Deno.args);

if (args.post) {
  const dirname: string = args.post;
  try {
    await makeContent('post', dirname);
  } catch (err) {
    console.log(err);
    Deno.exit(1);
  }
  Deno.exit(0);
}

if (args.diary) {
  const dirname: string = args.diary;
  try {
    await makeContent('diary', dirname);
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

throw new Error('usage: deno -A cli.ts (--diary dirname | --post dirname | --sync)');
