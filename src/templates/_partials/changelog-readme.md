## Changelog
---
{{reverse releases}}
{{#each releases as |release index|}}
### Version {{release.version}}
{{#each release.changes as |change _index|}}
- {{change}}
{{/each}}

{{/each}}
