# == Schema Information
#
# Table name: geo_notes
#
#  id                      :integer          not null, primary key
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  latitude                :decimal(, )
#  longitude               :decimal(, )
#  phone_id                :string
#  note_text               :string
#  note_image_file_name    :string
#  note_image_content_type :string
#  note_image_file_size    :integer
#  note_image_updated_at   :datetime
#  device_id               :string
#
# Indexes
#
#  index_geo_notes_on_latitude_and_longitude  (latitude,longitude)
#  index_geo_notes_on_phone_id                (phone_id)
#

class GeoNote < ApplicationRecord
  # Paperclip
  has_attached_file :note_image,
                    styles: { medium: '400x400>', thumb: '100x100>' },
                    default_url: '/images/:style/missing.png'
  validates_attachment_content_type :note_image, content_type: 'image/jpeg'

  # Geokit
  acts_as_mappable default_units: :miles,
                   default_formula: :sphere,
                   distance_field_name: :distance,
                   lat_column_name: :latitude,
                   lng_column_name: :longitude

  validates :latitude, :longitude, :phone_id, :note_text, presence: true

  # Votable
  acts_as_votable

  belongs_to :user
end
