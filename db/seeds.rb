# This file creates seed data for the development environment
# The data can be loaded with bin/rails db:seed

puts "Creating development users..."

# Create admin user
admin = User.find_or_initialize_by(email: "admin@example.com")
if admin.new_record?
  admin.password = "password"
  admin.password_confirmation = "password"
  admin.save!
  puts "Admin user created: admin@example.com / password"
else
  puts "Admin user already exists"
end

# Create regular users
4.times do |i|
  user_email = "user#{i+1}@example.com"
  user = User.find_or_initialize_by(email: user_email)
  
  if user.new_record?
    user.password = "password"
    user.password_confirmation = "password"
    user.save!
    puts "User created: #{user_email} / password"
  else
    puts "User #{user_email} already exists"
  end
end

puts "Seed data created successfully!"
