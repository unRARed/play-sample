class SamplePad < ApplicationRecord
  belongs_to :user
  has_many :samples, dependent: :destroy
  
  validates :name, presence: true
  
  # Maximum number of sample pads in a grid (4x4)
  MAX_SAMPLES = 16
  
  def full?
    samples.count >= MAX_SAMPLES
  end
  
  def available_slots
    MAX_SAMPLES - samples.count
  end
end
