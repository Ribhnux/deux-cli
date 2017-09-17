# Changelog
{{reverse releases}}
{{#each releases as |release index|}}
## Version {{release.version}} - {{time release.date}}
### Changes
{{#each release.changes as |change _index|}}
- {{change}}
{{/each}}

{{/each}}
