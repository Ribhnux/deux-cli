/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

class Footer extends React.Component {
  docUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    return baseUrl + 'docs/' + (language ? language + '/' : '') + doc;
  }

  pageUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    return baseUrl + (language ? language + '/' : '') + doc;
  }

  render() {
    const currentYear = new Date().getFullYear();
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <a href={this.props.config.baseUrl} className="nav-home">
            {this.props.config.footerIcon && (
              <img
                src={this.props.config.baseUrl + this.props.config.footerIcon}
                alt={this.props.config.title}
                width="66"
                height="58"
              />
            )}
          </a>
          <div className="oss">
            <h5>Open Source Software</h5>
            <p>We're open source and need your help to make a perfect tools/software. We'll happy if you fork our repo and submit a PR.</p>
          </div>
          <div>
            <h5>Credits</h5>
            <a href="https://ribhnux.tech" target="_blank">Ribhnux Technology</a>
            <a href="https://ribhnux.design" target="_blank">Ribhnux Design</a>
            <a href="https://5usdtheme.com" target="_blank">$5 WordPress Theme</a>
          </div>
          <div>
            <h5>More</h5>
            <a href={this.props.config.baseUrl + 'blog'}>Blog</a>
            <a href="https://github.com/Ribhnux/deux-cli">GitHub</a>
            <br />
            <a
              className="github-button"
              href={this.props.config.repoUrl}
              data-icon="octicon-star"
              data-count-href="/Ribhnux/deux-cli/stargazers"
              data-show-count={true}
              data-count-aria-label="# stargazers on GitHub"
              aria-label="Star this project on GitHub">
              Star
            </a>
          </div>
        </section>

        <section className="copyright">
          Copyright &copy; {currentYear} <a href="https://ribhnux.tech">Ribhnux Technology</a>. Built with <a href="https://docusaurus.io" target="_blank">Docusaurus</a> by Facebook.
        </section>
      </footer>
    );
  }
}

module.exports = Footer;
