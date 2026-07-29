# Cache

Cache is a personal code library for saving, finding, and reusing code without
handing ownership of that library to a hosted service.

## Language

**Library**:
The complete collection of snippets and attachments owned by one person.
_Avoid_: Workspace, team, account

**Snippet**:
A reusable piece of code with a title, language, notes, and tags.
_Avoid_: Gist, document, artifact

**Attachment**:
A file stored with a snippet to preserve supporting context.
_Avoid_: Asset, upload

**Profile**:
A named CLI connection to a library, either directly on the same machine or
through a self-hosted Cache instance.
_Avoid_: Account, tenant

**Owner**:
The single person whose library is served by a Cache instance.
_Avoid_: Customer, subscriber, organization
