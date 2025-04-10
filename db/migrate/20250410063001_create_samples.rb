class CreateSamples < ActiveRecord::Migration[8.0]
  def change
    create_table :samples do |t|
      t.string :name
      t.string :label
      t.string :color
      t.string :play_mode
      t.references :sample_pad, null: false, foreign_key: true

      t.timestamps
    end
  end
end
