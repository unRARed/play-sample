class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
         
  has_one :sample_pad, dependent: :destroy
  
  def username
    email.split('@').first
  end
  
  # Create a default sample pad for new users
  after_create :create_default_sample_pad
  
  private
  
  def create_default_sample_pad
    create_sample_pad(name: 'My Sample Pad')
  end
end
