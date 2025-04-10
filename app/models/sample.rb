class Sample < ApplicationRecord
  belongs_to :sample_pad
  has_one_attached :audio
  
  validates :name, presence: true
  validates :label, presence: true
  validates :color, presence: true
  validates :audio, presence: true, content_type: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/x-wav', 'audio/mp3', 'audio/webm']
  
  # Play modes
  # 'exclusive' - stops all other sounds when played
  # 'simultaneous' - plays alongside other sounds
  validates :play_mode, inclusion: { in: ['exclusive', 'simultaneous'] }
  
  # List of available colors for the pads
  COLORS = [
    'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'teal',
    'indigo', 'lime', 'amber', 'cyan', 'rose', 'emerald', 'violet', 'fuchsia'
  ]
  
  validates :color, inclusion: { in: COLORS }
  
  def duration
    # This would typically come from audio metadata analysis
    # For now, we'll return a placeholder
    30 # seconds
  end
end
