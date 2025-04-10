class Sample < ApplicationRecord
  belongs_to :sample_pad
  has_one_attached :audio
  
  validates :name, presence: true
  validates :label, presence: true
  validates :color, presence: true
  validates :audio, presence: true,
                    content_type: { with: ['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/aac', 'audio/x-m4a', 'audio/x-aiff', 'audio/x-flac', 'application/ogg'],
                                   message: 'must be a valid audio format (MP3, M4A, OGG, AAC, FLAC)' },
                    size: { less_than: 50.megabytes, message: 'should be less than 50MB' }
  
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
