source "https://rubygems.org"

ruby "3.4.1"
# Rails core
gem "rails", "~> 8.0.2"
gem "propshaft"
gem "sqlite3", ">= 2.1"
gem "puma", ">= 5.0"

# Asset management and UI
gem "tailwindcss-rails"
gem "slim-rails"  # SLIM templates
gem "jsbundling-rails"  # For PostCSS setup

# StimulusJS and Turbo (Hotwire)
gem "turbo-rails"
gem "stimulus-rails"
gem "importmap-rails" # For managing JavaScript modules

# File management
gem "image_processing", "~> 1.2" # For Active Storage variants
gem "active_storage_validations" # For validating file attachments

# Database tools
gem "solid_cache"      # Database-backed cache
gem "solid_queue"      # Database-backed queue

# Authentication
gem "devise"           # User authentication

# Deployment
gem "kamal", require: false
gem "thruster", require: false

# General utilities
gem "tzinfo-data", platforms: %i[ windows jruby ]
gem "bootsnap", require: false

group :development, :test do
  # Debugging and testing
  gem "debug", platforms: %i[ mri windows ], require: "debug/prelude"
  gem "rspec-rails"    # RSpec for testing
  gem "factory_bot_rails" # Test factories
  gem "faker"          # Generate fake data
  
  # Code quality
  gem "brakeman", require: false
  gem "rubocop-rails-omakase", require: false
end

group :development do
  gem "web-console"
  gem "rack-mini-profiler"
 end

group :test do
  gem "capybara"
  gem "selenium-webdriver"
  gem "shoulda-matchers"
  gem "database_cleaner-active_record"
end
