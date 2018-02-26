/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* List of projects/orgs using your project for the users page */
const users = [
  {
    caption: 'Ribhnux Design',
    image: 'https://avatars1.githubusercontent.com/u/28999307?s=200&v=4',
    infoLink: 'https://ribhnux.design',
    pinned: true,
  },
];

const siteConfig = {
  cname: 'deux.ribhnux.tech',
  title: 'Deux CLI' /* title for your website */,
  tagline: 'A Simple WordPress Starter Theme Scaffolding Tools',
  url: 'https://deux.ribhnux.tech' /* your website url */,
  baseUrl: '/' /* base url for your project */,
  projectName: 'deux-cli',
  headerLinks: [
    {doc: 'index', label: 'Docs'},
    {doc: 'issues', label: 'Submit Issue'},
    {blog: true, label: 'Blog'},
  ],
  users,
  /* path to images for header/footer */
  headerIcon: 'img/deux-logo.svg',
  footerIcon: 'img/deux-logo.svg',
  favicon: 'img/favicon.png',
  /* colors for website */
  colors: {
    primaryColor: '#2E8555',
    secondaryColor: '#205C3B',
  },
  // This copyright info is used in /core/Footer.js and blog rss/atom feeds.
  copyright:
    'Copyright &copy; ' +
    new Date().getFullYear() +
    ' Ribhnux Technology',
  organizationName: 'Ribhnux', // or set an env variable ORGANIZATION_NAME
  projectName: 'deux-cli', // or set an env variable PROJECT_NAME
  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks
    theme: 'default',
  },
  scripts: ['https://buttons.github.io/buttons.js'],
  // You may provide arbitrary config keys to be used as needed by your template.
  repoUrl: 'https://github.com/Ribhnux/deux-cli',
};

module.exports = siteConfig;
