class RemoveLabelFromSamples < ActiveRecord::Migration[8.0]
  def change
    remove_column :samples, :label, :string
  end
end
