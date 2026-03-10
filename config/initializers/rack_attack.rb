class Rack::Attack
  Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new

  safelist("allow health checks") do |req|
    req.path == "/up"
  end

  throttle("req/ip", limit: 120, period: 1.minute) do |req|
    req.ip
  end

  blocklist("block common scanner paths") do |req|
    req.path.match?(%r{\A/(\.env|\.git|wp-admin|wp-login\.php|actuator|swagger|v2/api-docs|v3/api-docs|api-docs|telescope|vendor/phpunit|phpmyadmin|info\.php)})
  end
end
