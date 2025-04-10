Rails.application.config.generators do |g|
  g.view_specs false
  g.helper_specs false
  g.request_specs true
  g.controller_specs true
  g.model_specs true
  g.system_tests false
end
