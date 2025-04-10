class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
         
  has_many :sample_pads, dependent: :destroy
  
  def username
    email.split('@').first
  end
  
  # Create a default sample pad for new users
  after_create :create_default_sample_pad
  
  private
  
  def create_default_sample_pad
    sample_pads.create(name: 'My First Pad')
  end
end
