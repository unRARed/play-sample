class HomeController < ApplicationController
  def index
    if user_signed_in?
      @sample_pads = current_user.sample_pads.limit(3)
    end
  end
end
