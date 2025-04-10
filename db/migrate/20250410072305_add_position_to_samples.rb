class AddPositionToSamples < ActiveRecord::Migration[8.0]
  def change
    add_column :samples, :position, :integer, default: 0
    add_index :samples, [:sample_pad_id, :position], unique: true
  end
end
