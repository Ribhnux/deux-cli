/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');
const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const siteConfig = require(process.cwd() + '/siteConfig.js');

function imgUrl(img) {
  return siteConfig.baseUrl + 'img/' + img;
}

function docUrl(doc, language) {
  return siteConfig.baseUrl + 'docs/' + (language ? language + '/' : '') + doc;
}

function pageUrl(page, language) {
  return siteConfig.baseUrl + (language ? language + '/' : '') + page;
}

class Button extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="pluginWrapper buttonWrapper">
        <a className={['button', this.props.className].join(' ')} href={this.props.href} target={this.props.target}>
          {this.props.children}
        </a>
      </div>
    );
  }
}

Button.defaultProps = {
  target: '_self',
};

const SplashContainer = props => (
  <div className="homeContainer">
    <div className="homeSplashFade">
      <div className="wrapper homeWrapper">{props.children}</div>
    </div>
  </div>
);

const ProjectTitle = props => (
  <h2 className="projectTitle">
    <small>{siteConfig.tagline}</small>
  </h2>
);

const InstallSection = props => (
  <div className="section installSection">
    <p>To install <code>deux-cli</code> on your computer,<br />Open terminal, and type command below (with yarn or npm):</p>
    <code className="bash">yarn global add deux-cli</code><br />
    <code className="bash">npm install deux-cli -g</code>
  </div>
)

const PromoSection = props => (
  <div className="section promoSection">
    <div className="promoRow">
      <div className="pluginRowBlock">{props.children}</div>
    </div>
  </div>
);

const WhatIsThisSection = props => (
  <div id="what-is-this" className="section whatIsThisSection">
    <div className="features">
      <h2>What is Deux-CLI?</h2>
      <p>Deux-CLI is a tool that will simplify your WordPress Theme development.</p>
      <h3>Features</h3>
      <ul>
        <li><span>Manage assets (sass, javascript, 3rd-party libs, web fonts).</span></li>
        <li><span>Manage plugin dependencies.</span></li>
        <li><span>Manage native theme Features, Image Size, and more.</span></li>
        <li><span>Manage templates (Page Templates and Partial Templates).</span></li>
        <li><span>Manage theme menus and widgets.</span></li>
        <li><span>Manage theme customizer.</span></li>
      </ul>

      <p>Built with current technologies that will make your WordPress theme become standard.</p>
      <ul>
        <li><span>Gulp, BrowserSync, and Roll-up.</span></li>
        <li><span>Sassy CSS (SCSS) with stylelint and rtlcss.</span></li>
        <li><span>Javascript ES6 (front-end and customizer) with IIFE format.</span></li>
        <li><span>Auto convert variable translation to POT.</span></li>
        <li><span>WordPress Coding Standard.</span></li>
        <li><span>Theme Check and Theme Mentor.</span></li>
        <li><span>HTML5 Validator.</span></li>
      </ul>

      <br />
      <Button className="large" href={docUrl('index.html')}>Learn More</Button>
    </div>

    <div className="showcaseTerminal">
      Bababa
    </div>
  </div>
)

class HomeSplash extends React.Component {
  render() {
    let language = this.props.language || '';
    return (
      <SplashContainer>
        <div className="inner">
          <img width="265" src={imgUrl('deux-logo-with-text.svg')} />
          <ProjectTitle />
          <InstallSection />
          <PromoSection>
            <Button href='#what-is-this'>What is this?</Button>
            <Button href={docUrl('index.html', language)}>Get Started</Button>
          </PromoSection>
        </div>
      </SplashContainer>
    );
  }
}

const Block = props => (
  <Container
    padding={['bottom', 'top']}
    id={props.id}
    background={props.background}>
    <GridBlock align="center" contents={props.children} layout={props.layout} />
  </Container>
);

const Showcase = props => {
  if ((siteConfig.users || []).length === 0) {
    return null;
  }
  const showcase = siteConfig.users
    .filter(user => {
      return user.pinned;
    })
    .map((user, i) => {
      return (
        <a href={user.infoLink} key={i}>
          <img src={user.image} title={user.caption} />
        </a>
      );
    });

  return (
    <div className="productShowcaseSection paddingBottom">
      <h2>{"Who's Using This?"}</h2>
      <p>This project is used by all these people</p>
      <div className="logos">{showcase}</div>
      <div className="more-users">
        <a className="button" href={pageUrl('users.html', props.language)}>
          More {siteConfig.title} Users
        </a>
      </div>
    </div>
  );
};

class Index extends React.Component {
  render() {
    let language = this.props.language || '';

    return (
      <div>
        <HomeSplash language={language} />
        <div className="mainContainer">
          <WhatIsThisSection />
          <Showcase language={language} />
        </div>
      </div>
    );
  }
}

module.exports = Index;
