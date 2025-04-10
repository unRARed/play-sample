class CreateSamplePads < ActiveRecord::Migration[8.0]
  def change
    create_table :sample_pads do |t|
      t.string :name
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
