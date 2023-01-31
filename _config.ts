import lume from "lume/mod.ts";

const site = lume();

site.ignore('misc');
site.ignore('README.md');
site.ignore('_content');
site.ignore('_template');

export default site;
