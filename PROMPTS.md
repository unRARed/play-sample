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

---

*This document will be updated with each new prompt to maintain a clear history of the project's evolution.*
