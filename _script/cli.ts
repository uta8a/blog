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

const syncContent = async (): Promise<void> => {
  let articles: Content[] = [];
  /// Markdown pipeline
  for await (const entry of expandGlob(`./_content/**/**/_index.md`)) {
    const ty = getTy(entry.path);
    const slug = getSlug(entry.path);
    // const path = `./_content/${ty}/${slug}`;
    const raw = await Deno.readTextFile(entry.path);
    const { frontMatter: _, body, attrs } = extract<Data>(raw);
    // TODO: frontmatterを整形して新しいMarkdownをpost/diaryにgenerate
    const lastEdited = attrs.changelog[attrs.changelog.length - 1].date;
  }
  /// index page
  /// image pipeline
  /// copy all files, delete .md after copy
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
