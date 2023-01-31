import { parse } from 'https://deno.land/std@0.166.0/flags/mod.ts';
import * as eta from 'https://deno.land/x/eta@v1.6.0/mod.ts';
import dayjs from 'https://cdn.skypack.dev/dayjs@v1.11.5';
import utc from 'https://cdn.skypack.dev/dayjs@v1.11.5/plugin/utc';
import timezone from 'https://cdn.skypack.dev/dayjs@v1.11.5/plugin/timezone';
import duration from 'https://cdn.skypack.dev/dayjs@v1.11.5/plugin/duration';
import relativeTime from 'https://cdn.skypack.dev/dayjs@v1.11.5/plugin/relativeTime';
import { extract, test } from 'https://deno.land/std@0.172.0/encoding/front_matter/yaml.ts';
import { parse as yamlParse, stringify } from 'https://deno.land/std@0.172.0/encoding/yaml.ts';
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

const genPage = async (title: string) => {
  const filename = `${title}.md`;
  const id = filename;
  const iso = dayjs().tz().format('YYYY-MM-DDTHH:mm:ss+09:00');
  const filepath = `_content/md/${filename}`;
  const ok = await isExists(filepath);
  if (ok) throw Error(`Failed to create file: ${filename} is already exists.`);
  const raw = await Deno.readTextFile(`_template/span.md`);
  const body = await eta.render(raw, { id: id, iso: iso }) as string;
  await Deno.writeTextFile(filepath, body);
};

type Group = 0 | 1 | 2 | 3 | 4;
type TableRecord = {
  title: string;
  description?: string;
  link?: string;
  tags?: string[];
  status?: Group;
};
type MdContent = {
  type: 'md';
  content: string;
};
type TableContent = {
  type: 'table';
  title: string;
  description: string;
  content: TableRecord[];
};
type BodyContent = MdContent | TableContent;

type Span = {
  layout: string;
  title: string;
  description?: string;
  ogp?: string;
  group: Group;
  tags: string[];
  changelog: Changelog[];
  body: BodyContent[];
};

interface YamlData {
  title: string;
  description: string;
  body: TableRecord[];
}
interface DataX {
  title: string;
  draft: boolean;
  path: string;
  group: 0 | 1 | 2 | 3 | 4;
  description: string;
  tags: string[];
  ogp: string;
  license: string;
  changelog: Changelog[];
}

// (空行)@[yaml](vim.yml)(空行)
const embedYamlRegex = new RegExp(/\n(@\[yaml\]\(.+?\))\n\n/g);

const dataYamlRegex = new RegExp(/^@\[yaml\]\((.+?)\)$/);

const parseYamlLink = async (body: string) => {
  const raw = body.split(embedYamlRegex);
  const content: BodyContent[] = [];
  for (const line of raw) {
    if (dataYamlRegex.test(line)) {
      const dataUrl = line.replace(dataYamlRegex, '$1');
      const raw = await Deno.readTextFile(`_content/yml/${dataUrl}`);
      const yml: YamlData = yamlParse(raw) as YamlData;
      const data: TableContent = {
        type: 'table',
        title: yml.title,
        description: yml.description,
        content: yml.body,
      };
      content.push(data);
    } else {
      const data: MdContent = {
        type: 'md',
        content: line,
      };
      content.push(data);
    }
  }
  return content;
};

const mergeData = async (filepath: string) => {
  const raw = await Deno.readTextFile(filepath);
  if (!test(raw)) {
    return { skip: true, message: 'Not found markfown file.' };
  }
  const { frontMatter: _, body, attrs } = extract<Data>(raw);
  if (attrs.draft === true) return { skip: true, message: attrs.title }; // private markdown
  const BodyContent = await parseYamlLink(body);
  const data: Span = {
    layout: 'layouts/span.njk',
    title: attrs.title,
    description: attrs.description,
    ogp: attrs.ogp,
    group: attrs.group,
    tags: attrs.tags,
    changelog: attrs.changelog,
    body: BodyContent,
  };
  return { skip: false, path: attrs.path, data: data, attrs: attrs };
};

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
  ty: 'post' | 'diary',
  title: string,
  description: string,
  path: string,
  date: string,
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
      date: lastEdited
    });
  }
  /// index page
  /// post/index.yml
  const postOut: Record<string, unknown> = {
    layout: "layouts/post.njk",
    title: "技術記事一覧 - diaryです",
    description: "技術記事一覧",
    ogp: "/img/post/ogp-big.webp",
    body: articles.filter(v => v.ty === 'post'),
  }
  await Deno.writeTextFile(
    `./post/index.yml`,
    stringify(postOut),
  );
  /// diary/index.yml
  const diaryOut: Record<string, unknown> = {
    layout: "layouts/diary.njk",
    title: "日記一覧 - diaryです",
    description: "日記一覧",
    ogp: "/img/diary/ogp-big.webp",
    body: articles.filter(v => v.ty === 'diary'),
  }
  await Deno.writeTextFile(
    `./diary/index.yml`,
    stringify(diaryOut),
  );
  /// index.yml
  const rootOut: Record<string, unknown> = {
    layout: "layouts/root.njk",
    title: "diaryです",
    description: "uta8aのブログ記事たち",
    ogp: "/img/ogp-big.webp",
    body: articles,
  }
  await Deno.writeTextFile(
    `./index.yml`,
    stringify(rootOut),
  );
  /// Copy from assets
  await Deno.copyFile(`./_asset/ogp-post.png`, `./img/post/ogp.png`);
  await Deno.copyFile(`./_asset/ogp-diary.png`, `./img/diary/ogp.png`);
  await Deno.copyFile(`./_asset/ogp-root.png`, `./img/ogp.png`);
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


// この後ろはメモとする

// generate `yaml` file from template
if (args.yml) {
  const filename = args.yml;
  try {
    const body = await Deno.readTextFile('_template/data.yml');
    await Deno.writeTextFile(`./_content/yml/${filename}.yml`, body);
  } catch (err) {
    console.log(err);
    Deno.exit(1);
  }
  Deno.exit(0);
}

// generate `md` file from template
if (args.md) {
  const filename = args.md;
  try {
    await genPage(filename);
  } catch (err) {
    console.log(err);
    Deno.exit(1);
  }
  Deno.exit(0);
}

const removeDot = (name: string): string => {
  return name.replaceAll('.', '_').replace(/\_([^\_]*)$/, '.$1')
}

// sync `md` and `yml` to lume source yml file
// delete all files and re-create
// index.yml is auto-generated from entries
// TODO: Path resoiver
// TODO: Filter image of private markdown
if (args.sync) {
  // delete all files
  const existsSpan = await isExists('./span');
  const existsImg = await isExists('./img');
  if (existsSpan) {
    await Deno.remove('./span', { recursive: true });
  }
  if (existsImg) {
    await Deno.remove('./img', { recursive: true });
  }
  // mkdir -p span/image
  await Deno.mkdir('./span', { recursive: true });
  await Deno.mkdir('./img', { recursive: true });
  // image
  for await (const entry of expandGlob('./_content/md/image/*')) {
    await Deno.copyFile(entry.path, `img/${removeDot(entry.name)}`);
  }
  await Deno.copyFile('_template/img.yml', 'img/_data.yml');
  // markdown + yaml -> yaml
  const indexData: TableRecord[] = [];
  for await (const entry of expandGlob(`./_content/md/*.md`)) {
    const data = await mergeData(entry.path);
    if (data.skip || data === undefined) {
      console.log(`Skip private page ${data.message}`);
      continue;
    }
    try {
      await Deno.writeTextFile(
        `./span/${data.path}.yml`,
        stringify(data.data as Record<string, unknown>),
      );
    } catch (err) {
      console.log(err);
      Deno.exit(1);
    }
    indexData.push({
      title: data.attrs!.title,
      description: data.attrs!.description,
      link: data.path,
      tags: data.attrs?.tags,
      status: data.attrs?.group,
    });
  }
  const raw = await Deno.readTextFile('_template/index.yml');
  const yml = yamlParse(raw) as Span;
  yml.body.push({
    type: 'table',
    title: '',
    description: '',
    content: indexData,
  });
  await Deno.writeTextFile('index.yml', stringify(yml as Record<string, unknown>));
  Deno.exit(0);
}

throw new Error('usage: deno -A cli.ts (--yml filename | --md filename | --sync)');
