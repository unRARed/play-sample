# Pin npm packages by running ./bin/importmap

# Use direct pinning for core libraries (no preload on application to avoid duplicate loading)
pin "application"
pin "@hotwired/turbo", to: "https://ga.jspm.io/npm:@hotwired/turbo@8.0.0-beta.2/dist/turbo.es2017-esm.js"
pin "@hotwired/stimulus", to: "https://ga.jspm.io/npm:@hotwired/stimulus@3.2.2/dist/stimulus.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"

# Active Storage for file uploads
pin "@rails/activestorage", to: "https://ga.jspm.io/npm:@rails/activestorage@7.1.3/app/assets/javascripts/activestorage.esm.js"

# Controllers - use pin_all_from with no preload to avoid duplicate loading
pin_all_from "app/javascript/controllers", under: "controllers"
