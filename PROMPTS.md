# Sample Player Application - Prompt History

This document tracks the evolution of prompts and requirements for the Sample Player application.

## Initial Requirements (2025-04-09 22:50:49)

```
create a multi-user ruby on rails 8 application that will enable a user to upload audio files to be triggered from square buttons. the experience should be similar to the Akai MPX8. the buttons should be able to be labeled and set to one of 16 colors. there should be a status div that contains the current sample that is playing and also contain a progress bar animating the duration. it should be possible to configure a button to stop all other sounds or allow to play simultaneously with others played prior. there should also be a separate button to stop all sounds globally. any testing should use rspec. the uploaded audio files will use active storage. the views should be Ruby SLIM templates. the database can use sqlite and litestream which default in rails 8. tailwind should be configured thtrough postcss and bring in the daisyui "sunset" theme. hotwire and turbo should be used extensively so that later the app can be setup with hotwire native, but specific hotwire native support can wait for now.
```

## File Storage Clarification (2025-04-09 23:10:08)

```
we'll use active storage for the attachment
```

## Testing Requirements (2025-04-09 23:13:12)

```
let's not have view specs
```

## Testing Requirements Clarification (2025-04-09 23:15:00)

```
I want tests, just not view-specific tests
```

## Documentation Request (2025-04-09 23:22:33)

```
Can you create a PROMPTS.md file and keep track of all the specific prompting I've done so far as well as continue to add to it as I provide prompts moving forward?
```

## UI Theme Request (2025-04-09 23:26:07)

```
The UI is black and white and doesn't seem to be using the suggested daisyui, can you fix?
```

## Authentication UI Request (2025-04-09 23:31:24)

```
the signup page is lacking style. can it look like this?
```
[User shared an image of a login form with dark styling and clean interface]

## Devise Views Format Request (2025-04-09 23:32:16)

```
after generating, please convert the devise views to slim.
```

## Template Conversion (2025-04-09 23:34:37)

```
let's convert any/all erb templates to slim while we're at it
```

Converted all remaining ERB templates to Slim format, including:
- Authentication templates (login, signup, password reset, etc.)
- Shared partials (error messages, links, etc.)
- Mailer templates

## Authentication UI Improvements (2025-04-09 23:38:25)

```
the signup page wasn't updated per the uploaded screensnip, can you fix?
```

The issue was that the signup page wasn't showing the dark-themed design that was requested. A screenshot showing a dark background authentication UI was shared as reference.

## Styling Issues (2025-04-09 23:41:43)

```
the UI looks like this still - are the correct classes being set?
```

Updated CSS configuration to properly implement DaisyUI with Tailwind:
- Fixed styling issues with authentication forms
- Updated TailwindCSS configuration
- Corrected DaisyUI theme application
- Rebuilt CSS assets with proper directives

## Package Management (2025-04-09 23:48:10)

```
wait, we shouldn't have both a package-lock.json and a yarn.lock
```

Standardized on Yarn as the package manager for JavaScript dependencies, removing package-lock.json.

## Remove ERB Files (2025-04-10 00:00:09)

```
remove all the erb files
```

Removed all ERB template files from the project except for the following:
- PWA manifest.json.erb file (kept as requested)

## PROMPTS.md Maintenance (2025-04-10 00:01:23)

```
always update PROMPTS.md after every change
```

Ensuring PROMPTS.md is updated after each change to maintain a complete history of the project's development and requirements.

---

*This document will be updated with each new prompt to maintain a clear history of the project's evolution.*
